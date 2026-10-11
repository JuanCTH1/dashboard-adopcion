/**
 * UNIT TESTS FOR THE DOMAIN LAYER AND THE SYNTHETIC DATA GENERATOR
 */

import { describe, it, expect } from 'vitest';
import { generateDataset } from './mockGenerator.js';
import { adopcionRepo } from './adopcionRepo.js';
import { validateVolumeCompatibility, calculateAggregations, buildFunnel } from './aggregation.js';

describe('Domain Layer, Mock Generator and Aggregation Engine', () => {
  const dataset = generateDataset(20260828);

  it('1. Matches the org structure (4 regions x 12 markets x 3 lines)', () => {
    expect(dataset.VPS.length).toBe(3);
    expect(dataset.REGIONES.length).toBe(4);
    expect(dataset.DIRECTORES.length).toBe(12); // 4 regions x 3 lines
    expect(dataset.GERENTES.length).toBe(144); // 48 markets x 3 lines
    expect(dataset.VENDEDORES.length).toBeGreaterThan(600);
    expect(dataset.VENDEDORES.length).toBeLessThan(1200);
    expect(dataset.CLIENTES.length).toBeGreaterThan(4000);
    expect(dataset.MESES.length).toBe(36);
  });

  it('2. Is 100% deterministic for the same seed', () => {
    const dataset2 = generateDataset(20260828);
    expect(dataset.CLIENTES[0].volumenBase).toBe(dataset2.CLIENTES[0].volumenBase);
    expect(dataset.CLIENTES[10].id).toBe(dataset2.CLIENTES[10].id);
    expect(dataset.CLIENTES[50].estaIncorporado).toBe(dataset2.CLIENTES[50].estaIncorporado);
  });

  it('3. Follows the Pareto distribution on ORDERS (~70-85% in the top 20% of customers)', () => {
    const pedidosPorCliente = new Map();
    dataset.TRANSACCIONES.forEach(t => {
      pedidosPorCliente.set(t.clienteId, (pedidosPorCliente.get(t.clienteId) || 0) + t.pedidosTotales);
    });

    const ordenados = [...pedidosPorCliente.values()].sort((a, b) => b - a);
    const totalPedidos = ordenados.reduce((sum, v) => sum + v, 0);

    const top20PctCount = Math.round(ordenados.length * 0.20);
    const pedidosTop20 = ordenados.slice(0, top20PctCount).reduce((sum, v) => sum + v, 0);

    const pctPareto = (pedidosTop20 / totalPedidos) * 100;

    // Pareto share must be between 65% and 85%
    expect(pctPareto).toBeGreaterThanOrEqual(65.0);
    expect(pctPareto).toBeLessThanOrEqual(85.0);
  });

  it('3b. No customer reaches 100% digital adoption (real ceiling < 90%)', () => {
    const maxCeiling = Math.max(...dataset.CLIENTES.map(c => c.adoptionCeiling));
    expect(maxCeiling).toBeLessThanOrEqual(0.90);

    // Occasionally allowed in low-order months, but must not be the norm
    const fullyDigitalCount = dataset.TRANSACCIONES.filter(t => t.pedidosTotales > 5 && t.pedidosAnalogos === 0 && t.esActivo).length;
    expect(fullyDigitalCount / dataset.TRANSACCIONES.length).toBeLessThan(0.02);
  });

  it('4. Order and customer totals reconcile 100% bottom-up', () => {
    const metricasNacionales = adopcionRepo.getMetricasGlobales();
    const vps = adopcionRepo.getJerarquia('nacional');

    // The sum of orders across the 3 VPs must equal the national total
    const sumaPedidosVps = vps.reduce((sum, vp) => sum + vp.metricas.pedidos.totales, 0);
    expect(sumaPedidosVps).toBe(metricasNacionales.actual.pedidos.totales);

    // The sum of customers across VPs must equal the national customer total
    const sumaClientesVps = vps.reduce((sum, vp) => sum + vp.metricas.clientes.asignados, 0);
    expect(sumaClientesVps).toBe(metricasNacionales.actual.clientes.asignados);

    // For the first VP, the sum of its directors must equal its metrics
    const vp1 = vps[0];
    const directoresVp1 = adopcionRepo.getJerarquia('vp', vp1.id);
    const sumaPedidosDirs = directoresVp1.reduce((sum, d) => sum + d.metricas.pedidos.totales, 0);
    expect(sumaPedidosDirs).toBe(vp1.metricas.pedidos.totales);
  });

  it('5. Hard business rule: cu yd and tons are NEVER added together', () => {
    const transaccionesMixtas = [
      { lineaNegocio: 'readymix', volumenTotal: 100 },
      { lineaNegocio: 'cement', volumenTotal: 200 }
    ];
    const validacion = validateVolumeCompatibility(transaccionesMixtas);
    expect(validacion.compatible).toBe(false);
    expect(validacion.mensaje).toContain('cannot add cu yd of Readymix to tons');

    const transaccionesHomogeneas = [
      { lineaNegocio: 'cement', volumenTotal: 100 },
      { lineaNegocio: 'aggregates', volumenTotal: 200 }
    ];
    const validacionHomogenea = validateVolumeCompatibility(transaccionesHomogeneas);
    expect(validacionHomogenea.compatible).toBe(true);
    expect(validacionHomogenea.unidad).toBe('tons');
  });

  it('6. The funnel computes the 4 steps and percentage drop-offs correctly', () => {
    const metricas = adopcionRepo.getMetricasGlobales();
    const funnel = buildFunnel(metricas.actual, 'clientes');

    expect(funnel.length).toBe(4);
    expect(funnel[0].id).toBe('universo');
    expect(funnel[1].id).toBe('onboarded');
    expect(funnel[2].id).toBe('activos');
    expect(funnel[3].id).toBe('adopcion');

    // Each step must have coherent numeric values
    expect(funnel[0].count).toBeGreaterThanOrEqual(funnel[1].count);
    expect(funnel[1].count).toBeGreaterThanOrEqual(funnel[2].count);
  });

  it('7. Action Drawer ranks at-risk customers by highest volume', () => {
    const actionList = adopcionRepo.getTopClientesAccion({}, 10);
    
    expect(actionList.sinIncorporar.length).toBeLessThanOrEqual(10);
    expect(actionList.inactivosORevertidos.length).toBeLessThanOrEqual(10);

    // Verify descending order by volume
    for (let i = 0; i < actionList.sinIncorporar.length - 1; i++) {
      expect(actionList.sinIncorporar[i].volumenMes).toBeGreaterThanOrEqual(
        actionList.sinIncorporar[i + 1].volumenMes
      );
    }
  });

  it('8. Runs complex queries in under 10ms per full cycle', () => {
    const t0 = performance.now();
    for (let i = 0; i < 20; i++) {
      adopcionRepo.getMetricasGlobales({ vpIds: ['vp-readymix'], directorIds: ['Atlantic'] });
      adopcionRepo.getJerarquia('director', ['Atlantic'], { vpIds: ['vp-readymix'] });
      adopcionRepo.getCartera(null, { vpIds: ['vp-readymix'], directorIds: ['Atlantic'] });
      adopcionRepo.getLeaderboard({ vpIds: ['vp-readymix'] });
    }
    const t1 = performance.now();
    const avgMs = (t1 - t0) / 20;
    expect(avgMs).toBeLessThan(10.0);
  });

  it('9. Hierarchical filter cascade: portfolio and metrics respond coherently to node scope', () => {
    // Filtering by Atlantic (no specific market): the portfolio holds all Atlantic customers
    const carteraRegion = adopcionRepo.getCartera(null, { directorIds: ['Atlantic'] });
    expect(carteraRegion.length).toBeGreaterThan(0);
    expect(carteraRegion.every(c => c.regionNombre === 'Atlantic' || c.regionId === 'reg-1')).toBe(true);

    // Filtering by New York (a market inside Atlantic): the portfolio only holds New York customers
    const carteraMarket = adopcionRepo.getCartera(null, { directorIds: ['Atlantic'], gerenteIds: ['New York'] });
    expect(carteraMarket.length).toBeGreaterThan(0);
    expect(carteraMarket.length).toBeLessThan(carteraRegion.length);
    expect(carteraMarket.every(c => c.plaza === 'New York')).toBe(true);
  });

  it('10. Funnel integrity under yearly filters (Total >= Onboarded >= Active)', () => {
    const ny2026 = adopcionRepo.getMetricasGlobales({ anios: [2026], gerenteIds: ['New York'] });
    const c = ny2026.actual.clientes;

    expect(c.asignados).toBeGreaterThan(0);
    expect(c.asignados).toBeGreaterThan(c.onboarded);
    expect(c.onboarded).toBeGreaterThan(c.activos);
    expect(c.pctOnboarding).toBeLessThan(100);
    expect(c.pctAdopcion).toBeLessThan(c.pctOnboarding);
  });

  it('11. Structural asymmetry between Business Lines and Market Tiers', () => {
    const rmx = adopcionRepo.getMetricasGlobales({ lineasNegocio: ['readymix'] });
    const cem = adopcionRepo.getMetricasGlobales({ lineasNegocio: ['cement'] });
    const dallas = adopcionRepo.getMetricasGlobales({ gerenteIds: ['Dallas'] });
    const saltLake = adopcionRepo.getMetricasGlobales({ gerenteIds: ['Salt Lake'] });

    // Readymix has more customers than Cement (finer granularity)
    expect(rmx.actual.clientes.asignados).toBeGreaterThan(cem.actual.clientes.asignados);

    // Dallas (megamarket, tier 5) has more customers and orders than Salt Lake (tier 3)
    expect(dallas.actual.clientes.asignados).toBeGreaterThan(saltLake.actual.clientes.asignados);
    expect(dallas.actual.pedidos.totales).toBeGreaterThan(saltLake.actual.pedidos.totales);
  });

  it('12. Component individual renders', async () => {
    const { renderToString } = await import('react-dom/server');
    const React = await import('react');
    const { ExecutiveRibbon } = await import('../components/ExecutiveRibbon.jsx');
    const { AdoptionTrendCard } = await import('../components/AdoptionTrendCard.jsx');
    const { LeaderboardCard } = await import('../components/LeaderboardCard.jsx');
    const { ProgressiveHierarchy } = await import('../components/ProgressiveHierarchy.jsx');

    const metricas = adopcionRepo.getMetricasGlobales({});
    const serie = adopcionRepo.getSerieHistorica({});
    const leaderboard = adopcionRepo.getLeaderboard({});

    console.log('Rendering ExecutiveRibbon...');
    const h1 = renderToString(React.createElement(ExecutiveRibbon, { metricasGlobales: metricas }));
    expect(h1.length).toBeGreaterThan(0);

    console.log('Rendering AdoptionTrendCard...');
    const h2 = renderToString(React.createElement(AdoptionTrendCard, { serieHistorica: serie }));
    expect(h2.length).toBeGreaterThan(0);

    console.log('Rendering LeaderboardCard...');
    const h3 = renderToString(React.createElement(LeaderboardCard, { leaderboardData: leaderboard }));
    expect(h3.length).toBeGreaterThan(0);

    console.log('Rendering ProgressiveHierarchy...');
    const h4 = renderToString(React.createElement(ProgressiveHierarchy, { filtrosCompuestos: {} }));
    expect(h4.length).toBeGreaterThan(0);
  }, 45000);
});



