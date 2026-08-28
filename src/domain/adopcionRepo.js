/**
 * REPOSITORIO DE DATOS DE ADOPCIÓN CX
 */

import { generateDataset } from './mockGenerator.js';
import { calculateAggregations, buildFunnel } from './aggregation.js';
import { METRIC_DEFINITIONS, LINEAS_NEGOCIO } from './definiciones.js';

class AdopcionRepository {
  constructor(seed = 20260828) {
    this.data = generateDataset(seed);
  }

  getDefiniciones() {
    return METRIC_DEFINITIONS;
  }

  getFiltrosDisponibles() {
    return {
      meses: this.data.MESES,
      periodoActual: this.data.periodoActual,
      lineasNegocio: Object.values(LINEAS_NEGOCIO),
      regiones: this.data.REGIONES,
      vps: this.data.VPS,
      directores: this.data.DIRECTORES,
      gerentes: this.data.GERENTES,
      vendedores: this.data.VENDEDORES
    };
  }

  _filtrar(filtros = {}) {
    const periodo = filtros.periodo || this.data.periodoActual;
    const linea = filtros.lineaNegocio;
    const region = filtros.regionId;
    const plaza = filtros.plaza;
    const vpId = filtros.vpId;
    const directorId = filtros.directorId;
    const gerenteId = filtros.gerenteId;
    const vendedorId = filtros.vendedorId;

    let clientesFiltrados = this.data.CLIENTES;
    if (linea) clientesFiltrados = clientesFiltrados.filter(c => c.lineaNegocio === linea);
    if (region) clientesFiltrados = clientesFiltrados.filter(c => c.regionId === region);
    if (plaza) clientesFiltrados = clientesFiltrados.filter(c => c.plaza === plaza);
    if (vpId) clientesFiltrados = clientesFiltrados.filter(c => c.vpId === vpId);
    if (directorId) clientesFiltrados = clientesFiltrados.filter(c => c.directorId === directorId);
    if (gerenteId) clientesFiltrados = clientesFiltrados.filter(c => c.gerenteId === gerenteId);
    if (vendedorId) clientesFiltrados = clientesFiltrados.filter(c => c.vendedorId === vendedorId);

    const clientIdsSet = new Set(clientesFiltrados.map(c => c.id));

    const transaccionesPeriodo = this.data.TRANSACCIONES.filter(t => 
      t.periodo === periodo && clientIdsSet.has(t.clienteId)
    );

    const mesActualIdx = this.data.MESES.findIndex(m => m.key === periodo);
    let transaccionesPeriodoAnterior = [];
    if (mesActualIdx > 0) {
      const periodoAnteriorKey = this.data.MESES[mesActualIdx - 1].key;
      transaccionesPeriodoAnterior = this.data.TRANSACCIONES.filter(t => 
        t.periodo === periodoAnteriorKey && clientIdsSet.has(t.clienteId)
      );
    }

    return {
      clientes: clientesFiltrados,
      transacciones: transaccionesPeriodo,
      transaccionesAnteriores: transaccionesPeriodoAnterior,
      periodo
    };
  }

  getMetricasGlobales(filtros = {}) {
    const { clientes, transacciones, transaccionesAnteriores, periodo } = this._filtrar(filtros);
    const metricasActuales = calculateAggregations(transacciones, clientes);
    const metricasAnteriores = calculateAggregations(transaccionesAnteriores, clientes);

    const deltaAdopcionPedidos = metricasActuales.pedidos.pctAdopcion - metricasAnteriores.pedidos.pctAdopcion;
    const deltaAdopcionClientes = metricasActuales.clientes.pctAdopcion - metricasAnteriores.clientes.pctAdopcion;
    const deltaConcreto = metricasActuales.volumen.concreto.pctAdopcion - metricasAnteriores.volumen.concreto.pctAdopcion;
    const deltaCemento = metricasActuales.volumen.cemento.pctAdopcion - metricasAnteriores.volumen.cemento.pctAdopcion;

    const serieHistorica = this.getSerieHistorica(filtros, 12);

    return {
      periodo,
      actual: metricasActuales,
      anterior: metricasAnteriores,
      deltas: {
        pedidosMoM: deltaAdopcionPedidos,
        clientesMoM: deltaAdopcionClientes,
        concretoMoM: deltaConcreto,
        cementoMoM: deltaCemento
      },
      sparklineAdopcion: serieHistorica.map(s => s.pctAdopcionPedidos),
      sparklineConcreto: serieHistorica.map(s => s.volumenConcreto),
      sparklineCemento: serieHistorica.map(s => s.volumenCemento)
    };
  }

  getSerieHistorica(filtros = {}, limiteMeses = 24) {
    const meses = this.data.MESES.slice(-limiteMeses);
    const { clientes } = this._filtrar({ ...filtros, periodo: null });
    const clientIdsSet = new Set(clientes.map(c => c.id));

    return meses.map(m => {
      const txsMes = this.data.TRANSACCIONES.filter(t => 
        t.periodo === m.key && clientIdsSet.has(t.clienteId)
      );
      const agg = calculateAggregations(txsMes, clientes);
      return {
        periodo: m.key,
        label: m.label,
        pctAdopcionPedidos: Number(agg.pedidos.pctAdopcion.toFixed(1)),
        pctAdopcionClientes: Number(agg.clientes.pctAdopcion.toFixed(1)),
        pedidosTotales: agg.pedidos.totales,
        pedidosDigitales: agg.pedidos.digitales,
        volumenConcreto: agg.volumen.concreto.digital,
        volumenCemento: agg.volumen.cemento.digital
      };
    });
  }

  getJerarquia(nivel = 'nacional', parentId = null, filtros = {}) {
    const periodo = filtros.periodo || this.data.periodoActual;
    let nodos = [];

    if (nivel === 'nacional') {
      nodos = this.data.VPS.map(vp => ({
        id: vp.id,
        nombre: vp.nombre,
        tipo: 'VP',
        parentId: null,
        regiones: vp.regiones
      }));
    } else if (nivel === 'vp') {
      nodos = this.data.DIRECTORES
        .filter(d => !parentId || d.vpId === parentId)
        .map(d => ({
          id: d.id,
          nombre: d.nombre,
          tipo: 'Director',
          parentId: d.vpId,
          regionId: d.regionId
        }));
    } else if (nivel === 'director') {
      nodos = this.data.GERENTES
        .filter(g => !parentId || g.directorId === parentId)
        .map(g => ({
          id: g.id,
          nombre: g.nombre,
          tipo: 'Gerente',
          parentId: g.directorId,
          vpId: g.vpId
        }));
    } else if (nivel === 'gerente') {
      nodos = this.data.VENDEDORES
        .filter(v => !parentId || v.gerenteId === parentId)
        .map(v => ({
          id: v.id,
          nombre: v.nombre,
          tipo: 'Vendedor',
          parentId: v.gerenteId,
          plaza: v.plaza,
          regionNombre: v.regionNombre,
          empujeOnboarding: v.empujeOnboarding
        }));
    }

    return nodos.map(nodo => {
      let nodoFiltro = { ...filtros, periodo };
      if (nodo.tipo === 'VP') nodoFiltro.vpId = nodo.id;
      else if (nodo.tipo === 'Director') nodoFiltro.directorId = nodo.id;
      else if (nodo.tipo === 'Gerente') nodoFiltro.gerenteId = nodo.id;
      else if (nodo.tipo === 'Vendedor') nodoFiltro.vendedorId = nodo.id;

      const { clientes, transacciones, transaccionesAnteriores } = this._filtrar(nodoFiltro);
      const metricas = calculateAggregations(transacciones, clientes);
      const metricasAnt = calculateAggregations(transaccionesAnteriores, clientes);

      const deltaPedidos = metricas.pedidos.pctAdopcion - metricasAnt.pedidos.pctAdopcion;

      return {
        ...nodo,
        metricas,
        deltaPedidosMoM: Number(deltaPedidos.toFixed(1)),
        metaAdopcion: 75.0
      };
    });
  }

  getCartera(vendedorId, filtros = {}) {
    const { clientes, transacciones } = this._filtrar({ ...filtros, vendedorId });
    const txMap = new Map(transacciones.map(t => [t.clienteId, t]));

    return clientes.map(c => {
      const tx = txMap.get(c.id) || {
        pedidosTotales: 0,
        pedidosDigitales: 0,
        pedidosAnalogos: 0,
        volumenTotal: c.volumenBase,
        volumenDigital: 0
      };

      const pctDigital = tx.pedidosTotales > 0
        ? (tx.pedidosDigitales / tx.pedidosTotales) * 100
        : 0;

      return {
        id: c.id,
        lineaNegocio: c.lineaNegocio,
        lineaLabel: c.lineaLabel,
        unidad: c.unidad,
        volumenBase: c.volumenBase,
        volumenMes: tx.volumenTotal,
        volumenDigital: tx.volumenDigital,
        pedidosTotales: tx.pedidosTotales,
        pedidosDigitales: tx.pedidosDigitales,
        pctAdopcionPedidos: Number(pctDigital.toFixed(1)),
        estaIncorporado: c.estaIncorporado,
        esActivo: c.esActivo,
        esRevertido: c.esRevertido,
        fttv: c.fttv,
        digitalShare: Number((c.digitalShare * 100).toFixed(1)),
        canalPreferido: c.canalPreferido,
        esTopPareto: c.esTopPareto
      };
    });
  }

  getTopClientesAccion(filtros = {}, limit = 10) {
    const { clientes, transacciones } = this._filtrar(filtros);
    const txMap = new Map(transacciones.map(t => [t.clienteId, t]));

    const enriquecidos = clientes.map(c => {
      const tx = txMap.get(c.id);
      return {
        id: c.id,
        vendedorId: c.vendedorId,
        vendedorNombre: this.data.VENDEDORES.find(v => v.id === c.vendedorId)?.nombre || 'Vendedor',
        plaza: c.plaza,
        lineaNegocio: c.lineaNegocio,
        unidad: c.unidad,
        volumen: tx ? tx.volumenTotal : c.volumenBase,
        estaIncorporado: c.estaIncorporado,
        esActivo: c.esActivo,
        esRevertido: c.esRevertido,
        fttv: c.fttv,
        esTopPareto: c.esTopPareto
      };
    });

    const sinIncorporar = enriquecidos
      .filter(c => !c.estaIncorporado)
      .sort((a, b) => b.volumen - a.volumen)
      .slice(0, limit);

    const inactivosORevertidos = enriquecidos
      .filter(c => c.estaIncorporado && (!c.esActivo || c.esRevertido))
      .sort((a, b) => b.volumen - a.volumen)
      .slice(0, limit);

    return {
      sinIncorporar,
      inactivosORevertidos,
      volumenEnRiesgoTotal: sinIncorporar.reduce((sum, c) => sum + c.volumen, 0) +
                            inactivosORevertidos.reduce((sum, c) => sum + c.volumen, 0)
    };
  }

  getFunnel(filtros = {}, lens = 'clientes') {
    const { clientes, transacciones } = this._filtrar(filtros);
    const metricas = calculateAggregations(transacciones, clientes);
    return buildFunnel(metricas, lens);
  }
}

export const adopcionRepo = new AdopcionRepository();
export default adopcionRepo;