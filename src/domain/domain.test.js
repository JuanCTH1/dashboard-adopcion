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

  it('1. Cumple la estructura organizativa (4 regiones x 12 mercados x 3 líneas)', () => {
    expect(dataset.VPS.length).toBe(3);
    expect(dataset.REGIONES.length).toBe(4);
    expect(dataset.DIRECTORES.length).toBe(12); // 4 regiones x 3 líneas
    expect(dataset.GERENTES.length).toBe(144); // 48 mercados x 3 líneas
    expect(dataset.VENDEDORES.length).toBeGreaterThan(600);
    expect(dataset.VENDEDORES.length).toBeLessThan(1200);
    expect(dataset.CLIENTES.length).toBeGreaterThan(4000);
    expect(dataset.MESES.length).toBe(36);
  });

  it('2. Es 100% determinista con la misma semilla', () => {
    const dataset2 = generateDataset(20260828);
    expect(dataset.CLIENTES[0].volumenBase).toBe(dataset2.CLIENTES[0].volumenBase);
    expect(dataset.CLIENTES[10].id).toBe(dataset2.CLIENTES[10].id);
    expect(dataset.CLIENTES[50].estaIncorporado).toBe(dataset2.CLIENTES[50].estaIncorporado);
  });

  it('3. Cumple la distribución de Pareto en PEDIDOS (~70-85% en el 20% de clientes)', () => {
    const pedidosPorCliente = new Map();
    dataset.TRANSACCIONES.forEach(t => {
      pedidosPorCliente.set(t.clienteId, (pedidosPorCliente.get(t.clienteId) || 0) + t.pedidosTotales);
    });

    const ordenados = [...pedidosPorCliente.values()].sort((a, b) => b - a);
    const totalPedidos = ordenados.reduce((sum, v) => sum + v, 0);

    const top20PctCount = Math.round(ordenados.length * 0.20);
    const pedidosTop20 = ordenados.slice(0, top20PctCount).reduce((sum, v) => sum + v, 0);

    const pctPareto = (pedidosTop20 / totalPedidos) * 100;

    // Pareto debe estar entre 65% y 85%
    expect(pctPareto).toBeGreaterThanOrEqual(65.0);
    expect(pctPareto).toBeLessThanOrEqual(85.0);
  });

  it('3b. Ningún cliente alcanza el 100% de adopción digital (techo real < 90%)', () => {
    const maxCeiling = Math.max(...dataset.CLIENTES.map(c => c.adoptionCeiling));
    expect(maxCeiling).toBeLessThanOrEqual(0.90);

    // Se permite ocasionalmente en meses con pocos pedidos, pero no debe ser la norma
    const fullyDigitalCount = dataset.TRANSACCIONES.filter(t => t.pedidosTotales > 5 && t.pedidosAnalogos === 0 && t.esActivo).length;
    expect(fullyDigitalCount / dataset.TRANSACCIONES.length).toBeLessThan(0.02);
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

  it('8. Ejecuta consultas complejas en menos de 10ms por ciclo completo', () => {
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
  }, 45000);
});



