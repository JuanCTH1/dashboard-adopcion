/**
 * PRUEBAS UNITARIAS DE LA CAPA DE DOMINIO Y GENERADOR SINTÉTICO
 * Criterios de Aceptación - Fase 1 (MANUAL_OBRA.md)
 */

import { describe, it, expect } from 'vitest';
import { generateDataset } from './mockGenerator.js';
import { adopcionRepo } from './adopcionRepo.js';
import { validateVolumeCompatibility, calculateAggregations, buildFunnel } from './aggregation.js';

describe('Fase 1: Capa de Dominio y Generador Mock', () => {
  const dataset = generateDataset(20260828);

  it('1. Cumple la estructura organizativa exacta', () => {
    expect(dataset.VPS.length).toBe(2);
    expect(dataset.DIRECTORES.length).toBe(4);
    expect(dataset.GERENTES.length).toBe(12);
    expect(dataset.VENDEDORES.length).toBe(50);
    // ~1,300 clientes (20 a 30 por vendedor)
    expect(dataset.CLIENTES.length).toBeGreaterThanOrEqual(1100);
    expect(dataset.CLIENTES.length).toBeLessThanOrEqual(1500);
    expect(dataset.MESES.length).toBe(24);
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

    // La suma de pedidos de los 2 VPs debe ser igual al total nacional
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
    expect(funnel[0].paso).toBe(1);
    expect(funnel[0].etiqueta).toBe('Clientes en Cartera');
    expect(funnel[1].paso).toBe(2);
    expect(funnel[1].etiqueta).toBe('Clientes Incorporados');
    expect(funnel[2].paso).toBe(3);
    expect(funnel[2].etiqueta).toBe('Clientes Activos');
    expect(funnel[3].paso).toBe(4);
    expect(funnel[3].etiqueta).toBe('% Penetración Final');

    // Cada paso debe tener valores numéricos coherentes
    expect(funnel[0].valor).toBeGreaterThanOrEqual(funnel[1].valor);
    expect(funnel[1].valor).toBeGreaterThanOrEqual(funnel[2].valor);
  });

  it('7. Action Drawer prioriza por mayor volumen los clientes en riesgo', () => {
    const actionList = adopcionRepo.getTopClientesAccion({}, 10);
    
    expect(actionList.sinIncorporar.length).toBeLessThanOrEqual(10);
    expect(actionList.inactivosORevertidos.length).toBeLessThanOrEqual(10);

    // Verificar ordenamiento descendente por volumen
    for (let i = 0; i < actionList.sinIncorporar.length - 1; i++) {
      expect(actionList.sinIncorporar[i].volumen).toBeGreaterThanOrEqual(
        actionList.sinIncorporar[i + 1].volumen
      );
    }
  });
});
