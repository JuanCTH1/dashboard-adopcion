/**
 * PRUEBAS UNITARIAS DE LA CAPA DE DOMINIO Y GENERADOR SINTÉTICO
 * Criterios de Aceptación - Fase 2/3
 */

import { describe, it, expect } from 'vitest';
import { generateDataset } from './mockGenerator.js';
import { adopcionRepo } from './adopcionRepo.js';
import { validateVolumeCompatibility, calculateAggregations, buildFunnel } from './aggregation.js';

describe('Capa de Dominio, Generador Mock y Motor de Agregación', () => {
  const dataset = generateDataset(20260828);

  it('1. Cumple la estructura organizativa exacta', () => {
    expect(dataset.VPS.length).toBe(3);
    expect(dataset.DIRECTORES.length).toBe(15);
    expect(dataset.GERENTES.length).toBe(30);
    expect(dataset.VENDEDORES.length).toBe(150);
    expect(dataset.CLIENTES.length).toBeGreaterThanOrEqual(1800);
    expect(dataset.CLIENTES.length).toBeLessThanOrEqual(2500);
    expect(dataset.MESES.length).toBe(36);
  });

  it('2. Es 100% determinista con la misma semilla', () => {
    const dataset2 = generateDataset(20260828);
    expect(dataset.CLIENTES[0].volumenBase).toBe(dataset2.CLIENTES[0].volumenBase);
    expect(dataset.CLIENTES[10].id).toBe(dataset2.CLIENTES[10].id);
    expect(dataset.CLIENTES[50].estaIncorporado).toBe(dataset2.CLIENTES[50].estaIncorporado);
  });

  it('3. Cumple la distribución de Pareto obligatoria (~75% del volumen en el 20% de clientes)', () => {
    const clientesOrdenados = [...dataset.CLIENTES].sort((a, b) => b.volumenBase - a.volumenBase);
    const totalVolumen = clientesOrdenados.reduce((sum, c) => sum + c.volumenBase, 0);

    const top20PctCount = Math.round(clientesOrdenados.length * 0.20);
    const volumenTop20 = clientesOrdenados
      .slice(0, top20PctCount)
      .reduce((sum, c) => sum + c.volumenBase, 0);

    const pctPareto = (volumenTop20 / totalVolumen) * 100;
    
    // Pareto debe estar entre 70% y 80%
    expect(pctPareto).toBeGreaterThanOrEqual(70.0);
    expect(pctPareto).toBeLessThanOrEqual(80.0);
  });

  it('4. Los totales de pedidos y clientes cuadran 100% de abajo hacia arriba', () => {
    const metricasNacionales = adopcionRepo.getMetricasGlobales();
    const vps = adopcionRepo.getJerarquia('nacional');

    // La suma de pedidos de los 3 VPs debe ser igual al total nacional
    const sumaPedidosVps = vps.reduce((sum, vp) => sum + vp.metricas.pedidos.totales, 0);
    expect(sumaPedidosVps).toBe(metricasNacionales.actual.pedidos.totales);

    // La suma de clientes de los VPs debe ser igual al total de clientes nacional
    const sumaClientesVps = vps.reduce((sum, vp) => sum + vp.metricas.clientes.asignados, 0);
    expect(sumaClientesVps).toBe(metricasNacionales.actual.clientes.asignados);

    // Para el primer VP, la suma de sus directores debe igualar sus métricas
    const vp1 = vps[0];
    const directoresVp1 = adopcionRepo.getJerarquia('vp', vp1.id);
    const sumaPedidosDirs = directoresVp1.reduce((sum, d) => sum + d.metricas.pedidos.totales, 0);
    expect(sumaPedidosDirs).toBe(vp1.metricas.pedidos.totales);
  });

  it('5. Regla de negocio dura: m³ y toneladas NUNCA se suman', () => {
    const transaccionesMixtas = [
      { lineaNegocio: 'readymix', volumenTotal: 100 },
      { lineaNegocio: 'cemento', volumenTotal: 200 }
    ];
    const validacion = validateVolumeCompatibility(transaccionesMixtas);
    expect(validacion.compatible).toBe(false);
    expect(validacion.mensaje).toContain('no se pueden sumar m³ de Readymix con toneladas');

    const transaccionesHomogeneas = [
      { lineaNegocio: 'cemento', volumenTotal: 100 },
      { lineaNegocio: 'agregados', volumenTotal: 200 }
    ];
    const validacionHomogenea = validateVolumeCompatibility(transaccionesHomogeneas);
    expect(validacionHomogenea.compatible).toBe(true);
    expect(validacionHomogenea.unidad).toBe('toneladas');
  });

  it('6. El Funnel calcula correctamente los 4 pasos y caídas porcentuales', () => {
    const metricas = adopcionRepo.getMetricasGlobales();
    const funnel = buildFunnel(metricas.actual, 'clientes');

    expect(funnel.length).toBe(4);
    expect(funnel[0].id).toBe('universo');
    expect(funnel[1].id).toBe('onboarded');
    expect(funnel[2].id).toBe('activos');
    expect(funnel[3].id).toBe('adopcion');

    // Cada paso debe tener valores numéricos coherentes
    expect(funnel[0].count).toBeGreaterThanOrEqual(funnel[1].count);
    expect(funnel[1].count).toBeGreaterThanOrEqual(funnel[2].count);
  });

  it('7. Action Drawer prioriza por mayor volumen los clientes en riesgo', () => {
    const actionList = adopcionRepo.getTopClientesAccion({}, 10);
    
    expect(actionList.sinIncorporar.length).toBeLessThanOrEqual(10);
    expect(actionList.inactivosORevertidos.length).toBeLessThanOrEqual(10);

    // Verificar ordenamiento descendente por volumen
    for (let i = 0; i < actionList.sinIncorporar.length - 1; i++) {
      expect(actionList.sinIncorporar[i].volumenMes).toBeGreaterThanOrEqual(
        actionList.sinIncorporar[i + 1].volumenMes
      );
    }
  });

  it('8. Ejecuta consultas complejas en menos de 5ms por ciclo completo', () => {
    const t0 = performance.now();
    for (let i = 0; i < 20; i++) {
      adopcionRepo.getMetricasGlobales({ vpIds: ['vp-readymix'], directorIds: ['Atlantic'] });
      adopcionRepo.getJerarquia('director', ['Atlantic'], { vpIds: ['vp-readymix'] });
      adopcionRepo.getCartera(null, { vpIds: ['vp-readymix'], directorIds: ['Atlantic'] });
      adopcionRepo.getLeaderboard({ vpIds: ['vp-readymix'] });
    }
    const t1 = performance.now();
    const avgMs = (t1 - t0) / 20;
    expect(avgMs).toBeLessThan(5.0);
  });

  it('9. Cascada de filtros jerárquicos: cartera y métricas responden coherentemente al alcance del nodo', () => {
    // Al filtrar por Atlantic (sin mercado específico), la cartera contiene todos los clientes de Atlantic
    const carteraRegion = adopcionRepo.getCartera(null, { directorIds: ['Atlantic'] });
    expect(carteraRegion.length).toBeGreaterThan(0);
    expect(carteraRegion.every(c => c.regionNombre === 'Atlantic' || c.regionId === 'reg-1')).toBe(true);

    // Al filtrar por New York (mercado dentro de Atlantic), la cartera solo tiene clientes de New York
    const carteraMarket = adopcionRepo.getCartera(null, { directorIds: ['Atlantic'], gerenteIds: ['New York'] });
    expect(carteraMarket.length).toBeGreaterThan(0);
    expect(carteraMarket.length).toBeLessThan(carteraRegion.length);
    expect(carteraMarket.every(c => c.plaza === 'New York')).toBe(true);
  });

  it('10. Integridad matemática del embudo en filtros anuales (Total >= Onboarded >= Activos)', () => {
    const ny2026 = adopcionRepo.getMetricasGlobales({ anios: [2026], gerenteIds: ['New York'] });
    const c = ny2026.actual.clientes;

    expect(c.asignados).toBeGreaterThan(0);
    expect(c.asignados).toBeGreaterThan(c.onboarded);
    expect(c.onboarded).toBeGreaterThan(c.activos);
    expect(c.pctOnboarding).toBeLessThan(100);
    expect(c.pctAdopcion).toBeLessThan(c.pctOnboarding);
  });

  it('11. Asimetría estructural entre Líneas de Negocio y Tiers de Mercado', () => {
    const rmx = adopcionRepo.getMetricasGlobales({ lineasNegocio: ['readymix'] });
    const cem = adopcionRepo.getMetricasGlobales({ lineasNegocio: ['cemento'] });
    const dallas = adopcionRepo.getMetricasGlobales({ gerenteIds: ['Dallas'] });
    const saltLake = adopcionRepo.getMetricasGlobales({ gerenteIds: ['Salt Lake'] });

    // Readymix tiene más clientes que Cemento (mayor granularidad)
    expect(rmx.actual.clientes.asignados).toBeGreaterThan(cem.actual.clientes.asignados);

    // Dallas (Megamercado Tier 1) tiene más clientes y pedidos que Salt Lake (Tier 3)
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
  });
});



