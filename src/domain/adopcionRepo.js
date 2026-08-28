/**
 * HIGH-PERFORMANCE REPOSITORIO DE DATOS DE ADOPCIÓN CX (INDEXED MAP LOOKUPS FOR 0ms INSTANT ANIMATIONS)
 */

import { generateDataset } from './mockGenerator.js';
import { calculateAggregations, buildFunnel } from './aggregation.js';
import { METRIC_DEFINITIONS, LINEAS_NEGOCIO } from './definiciones.js';

class AdopcionRepository {
  constructor(seed = 20260828) {
    this.data = generateDataset(seed);

    // INDEXATION FOR O(1) INSTANT LOOKUPS
    this.txByPeriod = new Map();
    this.txByClient = new Map();

    this.data.TRANSACCIONES.forEach(t => {
      if (!this.txByPeriod.has(t.periodo)) {
        this.txByPeriod.set(t.periodo, []);
      }
      this.txByPeriod.get(t.periodo).push(t);

      if (!this.txByClient.has(t.clienteId)) {
        this.txByClient.set(t.clienteId, []);
      }
      this.txByClient.get(t.clienteId).push(t);
    });
  }

  getDefiniciones() {
    return METRIC_DEFINITIONS;
  }

  getFiltrosDisponibles() {
    return {
      meses: this.data.MESES,
      periodoActual: this.data.periodoActual,
      anios: [2024, 2025, 2026],
      nombresMeses: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      lineasNegocio: Object.values(LINEAS_NEGOCIO),
      regiones: this.data.REGIONES,
      vps: this.data.VPS,
      directores: this.data.DIRECTORES,
      gerentes: this.data.GERENTES,
      vendedores: this.data.VENDEDORES
    };
  }

  _filtrar(filtros = {}) {
    const anios = filtros.anios?.length ? filtros.anios.map(Number) : [2026];
    const ALL_MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mesesNombres = filtros.meses?.length ? filtros.meses : ALL_MONTHS;
    const lineas = filtros.lineasNegocio?.length ? filtros.lineasNegocio : (filtros.lineaNegocio ? [filtros.lineaNegocio] : []);
    const regiones = filtros.regionIds?.length ? filtros.regionIds : (filtros.regionId ? [filtros.regionId] : []);
    const plazas = filtros.plazas?.length ? filtros.plazas : (filtros.plaza ? [filtros.plaza] : []);

    const vpIds = filtros.vpIds?.length ? filtros.vpIds : (filtros.vpId ? [filtros.vpId] : []);
    const directorIds = filtros.directorIds?.length ? filtros.directorIds : (filtros.directorId ? [filtros.directorId] : []);
    const gerenteIds = filtros.gerenteIds?.length ? filtros.gerenteIds : (filtros.gerenteId ? [filtros.gerenteId] : []);
    const vendedorIds = filtros.vendedorIds?.length ? filtros.vendedorIds : (filtros.vendedorId ? [filtros.vendedorId] : []);

    // 1. FAST CLIENT FILTERING
    let clientesFiltrados = this.data.CLIENTES;
    if (lineas.length) clientesFiltrados = clientesFiltrados.filter(c => lineas.includes(c.lineaNegocio));
    if (regiones.length) clientesFiltrados = clientesFiltrados.filter(c => regiones.includes(c.regionId));
    if (plazas.length) clientesFiltrados = clientesFiltrados.filter(c => plazas.includes(c.plaza));
    if (vpIds.length) clientesFiltrados = clientesFiltrados.filter(c => vpIds.includes(c.vpId));
    if (directorIds.length) clientesFiltrados = clientesFiltrados.filter(c => directorIds.includes(c.directorId) || directorIds.includes(c.regionNombre));
    if (gerenteIds.length) clientesFiltrados = clientesFiltrados.filter(c => gerenteIds.includes(c.gerenteId) || gerenteIds.includes(c.plaza));
    if (vendedorIds.length) clientesFiltrados = clientesFiltrados.filter(c => vendedorIds.includes(c.vendedorId));

    const clientIdsSet = new Set(clientesFiltrados.map(c => c.id));

    // 2. FAST PERIOD LOOKUP (O(1) MAP LOOKUP)
    const mesesValidosKeys = [];
    this.data.MESES.forEach(m => {
      if (anios.includes(m.anio) && mesesNombres.includes(m.nombreMes)) {
        mesesValidosKeys.push(m.key);
      }
    });

    if (mesesValidosKeys.length === 0) {
      mesesValidosKeys.push(this.data.periodoActual);
    }

    const transaccionesPeriodo = [];
    mesesValidosKeys.forEach(pKey => {
      const txs = this.txByPeriod.get(pKey) || [];
      for (let i = 0; i < txs.length; i++) {
        if (clientIdsSet.has(txs[i].clienteId)) {
          transaccionesPeriodo.push(txs[i]);
        }
      }
    });

    return {
      clientes: clientesFiltrados,
      transacciones: transaccionesPeriodo,
      mesesValidosKeys
    };
  }

  getMetricasGlobales(filtros = {}) {
    const { clientes, transacciones } = this._filtrar(filtros);
    const metricasActuales = calculateAggregations(transacciones, clientes);
    const serieHistorica = this.getSerieHistorica(filtros, 24);

    return {
      actual: metricasActuales,
      deltas: {
        pedidosMoM: 3.4,
        clientesMoM: 2.1,
        concretoMoM: 4.8,
        cementoMoM: 1.9
      },
      serieHistorica,
      sparklineAdopcion: serieHistorica.map(s => s.pctAdopcionPedidos),
      sparklineConcreto: serieHistorica.map(s => s.volumenConcreto),
      sparklineCemento: serieHistorica.map(s => s.volumenCemento)
    };
  }

  getSerieHistorica(filtros = {}, limiteMeses = 24) {
    const meses = this.data.MESES.slice(-limiteMeses);
    const { clientes } = this._filtrar({ ...filtros, anios: [2024, 2025, 2026], meses: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] });
    const clientIdsSet = new Set(clientes.map(c => c.id));

    return meses.map(m => {
      const txs = this.txByPeriod.get(m.key) || [];
      const txsMes = txs.filter(t => clientIdsSet.has(t.clienteId));
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

  getJerarquia(nivel = 'nacional', parentIds = [], filtros = {}) {
    let nodos = [];
    const parentSet = new Set(Array.isArray(parentIds) ? parentIds : [parentIds].filter(Boolean));

    // Base filter clean of level selection to compute true node metrics
    const baseFiltro = { ...filtros };
    delete baseFiltro.vpId;
    delete baseFiltro.directorId;
    delete baseFiltro.gerenteId;
    delete baseFiltro.vendedorId;

    if (nivel === 'nacional') {
      delete baseFiltro.vpIds;
      delete baseFiltro.directorIds;
      delete baseFiltro.gerenteIds;
      delete baseFiltro.vendedorIds;
      nodos = this.data.VPS.map(v => ({
        id: v.id,
        nombre: v.nombre,
        tipo: 'VP',
        persona: v.persona,
        lineaNegocio: v.lineaNegocio
      }));
    } else if (nivel === 'vp') {
      delete baseFiltro.directorIds;
      delete baseFiltro.gerenteIds;
      delete baseFiltro.vendedorIds;

      const isSingleVp = parentSet.size === 1;
      const singleVpId = isSingleVp ? Array.from(parentSet)[0] : null;

      const BL_SHORT = {
        readymix: 'RMX',
        cemento: 'CEM',
        agregados: 'AGG'
      };

      // Group by physical Region name so there are ALWAYS 5 regions
      const regionMap = new Map();
      this.data.DIRECTORES.forEach(d => {
        if (parentSet.size > 0 && !parentSet.has(d.vpId)) return;

        if (!regionMap.has(d.nombre)) {
          regionMap.set(d.nombre, {
            id: d.id,
            directorIds: [],
            nombre: d.nombre,
            tipo: 'Director',
            regionId: d.regionId,
            personas: [],
            lineas: new Set()
          });
        }
        const reg = regionMap.get(d.nombre);
        reg.directorIds.push(d.id);
        if (d.persona) reg.personas.push({ vpId: d.vpId, persona: d.persona, id: d.id });
        const vpObj = this.data.VPS.find(v => v.id === d.vpId);
        if (vpObj) reg.lineas.add(vpObj.nombre);
      });

      nodos = Array.from(regionMap.values()).map(r => {
        const personasDetalle = r.personas.map(p => {
          const vpObj = this.data.VPS.find(v => v.id === p.vpId);
          const personaFiltro = { ...baseFiltro, vpId: p.vpId, directorId: p.id };
          const { clientes: personaCli, transacciones: personaTx } = this._filtrar(personaFiltro);
          const agg = calculateAggregations(personaTx, personaCli);
          return {
            vpId: p.vpId,
            bl: BL_SHORT[vpObj?.lineaNegocio] || 'BL',
            blFull: vpObj?.nombre || 'Business Line',
            persona: p.persona,
            totales: agg.pedidos.totales,
            pctAdopcion: agg.pedidos.pctAdopcion
          };
        });

        const singleMatch = isSingleVp ? personasDetalle.find(p => p.vpId === singleVpId) : null;
        const personaDisplay = isSingleVp ? singleMatch?.persona : null;

        return {
          id: r.nombre,
          directorIds: r.directorIds,
          nombre: r.nombre,
          persona: personaDisplay,
          personasDetalle,
          blPills: Array.from(new Set(personasDetalle.map(p => p.bl))),
          isSingleVp,
          tipo: 'Director',
          regionId: r.regionId,
          lineasLabel: personasDetalle.map(p => p.bl).join(' · ')
        };
      });
    } else if (nivel === 'director') {
      delete baseFiltro.gerenteIds;
      delete baseFiltro.vendedorIds;

      const activeVpIds = baseFiltro.vpIds || [];
      const isSingleVp = activeVpIds.length === 1;

      const BL_SHORT = {
        readymix: 'RMX',
        cemento: 'CEM',
        agregados: 'AGG'
      };

      // Group by physical Market name
      const marketMap = new Map();
      this.data.GERENTES.forEach(g => {
        if (activeVpIds.length > 0 && !activeVpIds.includes(g.vpId)) return;

        if (parentSet.size > 0) {
          const parentDir = this.data.DIRECTORES.find(d => d.id === g.directorId);
          const matchParent = parentSet.has(g.directorId) ||
            (parentDir && (parentSet.has(parentDir.id) || parentSet.has(parentDir.nombre) || parentSet.has(parentDir.regionId)));
          if (!matchParent) return;
        }

        if (!marketMap.has(g.nombre)) {
          marketMap.set(g.nombre, {
            id: g.id,
            gerenteIds: [],
            nombre: g.nombre,
            tipo: 'Gerente',
            personas: [],
            lineas: new Set()
          });
        }
        const mkt = marketMap.get(g.nombre);
        mkt.gerenteIds.push(g.id);
        if (g.persona) mkt.personas.push({ vpId: g.vpId, persona: g.persona, id: g.id });
        const vpObj = this.data.VPS.find(v => v.id === g.vpId);
        if (vpObj) mkt.lineas.add(vpObj.nombre);
      });

      nodos = Array.from(marketMap.values()).map(m => {
        const personasDetalle = m.personas.map(p => {
          const vpObj = this.data.VPS.find(v => v.id === p.vpId);
          const personaFiltro = { ...baseFiltro, vpId: p.vpId, gerenteId: p.id };
          const { clientes: personaCli, transacciones: personaTx } = this._filtrar(personaFiltro);
          const agg = calculateAggregations(personaTx, personaCli);
          return {
            vpId: p.vpId,
            bl: BL_SHORT[vpObj?.lineaNegocio] || 'BL',
            blFull: vpObj?.nombre || 'Business Line',
            persona: p.persona,
            totales: agg.pedidos.totales,
            pctAdopcion: agg.pedidos.pctAdopcion
          };
        });

        return {
          id: m.nombre,
          gerenteIds: m.gerenteIds,
          nombre: m.nombre,
          personasDetalle,
          blPills: Array.from(new Set(personasDetalle.map(p => p.bl))),
          tipo: 'Gerente',
          lineasLabel: personasDetalle.map(p => p.bl).join(' · ')
        };
      });
    } else if (nivel === 'gerente') {
      delete baseFiltro.vendedorIds;
      const activeVpIds = baseFiltro.vpIds || [];
      const BL_SHORT = {
        readymix: 'RMX',
        cemento: 'CEM',
        agregados: 'AGG'
      };

      nodos = this.data.VENDEDORES
        .filter(v => {
          if (activeVpIds.length > 0 && !activeVpIds.includes(v.vpId)) return false;
          if (parentSet.size === 0) return true;
          const parentGer = this.data.GERENTES.find(g => g.id === v.gerenteId);
          return parentSet.has(v.gerenteId) || (parentGer && (parentSet.has(parentGer.id) || parentSet.has(parentGer.nombre) || parentSet.has(parentGer.plaza)));
        })
        .map(v => ({
          id: v.id,
          nombre: v.nombre,
          tipo: 'Vendedor',
          parentId: v.gerenteId,
          vpId: v.vpId,
          lineaNegocio: v.lineaNegocio,
          bl: BL_SHORT[v.lineaNegocio] || 'BL',
          plaza: v.plaza,
          regionNombre: v.regionNombre,
          empujeOnboarding: v.empujeOnboarding
        }));
    }

    return nodos.map(nodo => {
      let nodoFiltro = { ...baseFiltro };
      if (nodo.tipo === 'VP') nodoFiltro.vpId = nodo.id;
      else if (nodo.tipo === 'Director') {
        if (nodo.directorIds && nodo.directorIds.length) {
          nodoFiltro.directorIds = nodo.directorIds;
        } else {
          nodoFiltro.directorId = nodo.id;
        }
      }
      else if (nodo.tipo === 'Gerente') {
        if (nodo.gerenteIds && nodo.gerenteIds.length) {
          nodoFiltro.gerenteIds = nodo.gerenteIds;
        } else {
          nodoFiltro.gerenteId = nodo.id;
        }
      }
      else if (nodo.tipo === 'Vendedor') nodoFiltro.vendedorId = nodo.id;

      const { clientes, transacciones } = this._filtrar(nodoFiltro);
      const metricas = calculateAggregations(transacciones, clientes);

      return {
        ...nodo,
        metricas,
        deltaPedidosMoM: 3.2,
        metaAdopcion: 90.0
      };
    });
  }

  getCartera(vendedorId = null, filtros = {}) {
    const { clientes, transacciones } = this._filtrar({ ...filtros, ...(vendedorId ? { vendedorId } : {}) });
    const txMap = new Map();

    transacciones.forEach(t => {
      if (!txMap.has(t.clienteId)) {
        txMap.set(t.clienteId, {
          pedidosTotales: 0,
          pedidosDigitales: 0,
          pedidosAnalogos: 0,
          pedidosWeb: 0,
          pedidosApp: 0,
          pedidosEdi: 0,
          volumenTotal: 0,
          volumenDigital: 0
        });
      }
      const acc = txMap.get(t.clienteId);
      acc.pedidosTotales += t.pedidosTotales;
      acc.pedidosDigitales += t.pedidosDigitales;
      acc.pedidosAnalogos += t.pedidosAnalogos;
      acc.pedidosWeb += t.pedidosWeb;
      acc.pedidosApp += t.pedidosApp;
      acc.pedidosEdi += t.pedidosEdi;
      acc.volumenTotal += t.volumenTotal;
      acc.volumenDigital += t.volumenDigital;
    });

    return clientes.map(c => {
      const tx = txMap.get(c.id) || {
        pedidosTotales: 0,
        pedidosDigitales: 0,
        pedidosAnalogos: 0,
        pedidosWeb: 0,
        pedidosApp: 0,
        pedidosEdi: 0,
        volumenTotal: c.volumenBase,
        volumenDigital: 0
      };

      const pctDigital = tx.pedidosTotales > 0
        ? (tx.pedidosDigitales / tx.pedidosTotales) * 100
        : 0;

      let primaryChannel = 'Phone / Offline';
      if (tx.pedidosDigitales > 0) {
        if (tx.pedidosWeb >= tx.pedidosApp && tx.pedidosWeb >= tx.pedidosEdi) {
          primaryChannel = 'Web Portal';
        } else if (tx.pedidosApp >= tx.pedidosWeb && tx.pedidosApp >= tx.pedidosEdi) {
          primaryChannel = 'Mobile App';
        } else {
          primaryChannel = 'EDI Integration';
        }
      }

      return {
        id: c.id,
        nombreEmpresa: c.nombreEmpresa || `Company ${c.id}`,
        lineaNegocio: c.lineaNegocio,
        lineaLabel: c.lineaLabel,
        unidad: c.unidad,
        volumenBase: c.volumenBase,
        volumenMes: tx.volumenTotal,
        volumenDigital: tx.volumenDigital,
        pedidosTotales: tx.pedidosTotales,
        pedidosDigitales: tx.pedidosDigitales,
        pedidosAnalogos: tx.pedidosAnalogos,
        pedidosWeb: tx.pedidosWeb,
        pedidosApp: tx.pedidosApp,
        pedidosEdi: tx.pedidosEdi,
        pctAdopcionPedidos: Number(pctDigital.toFixed(1)),
        estaIncorporado: c.estaIncorporado,
        esActivo: c.esActivo,
        esRevertido: c.esRevertido,
        fttv: c.fttv,
        digitalShare: Number((c.digitalShare * 100).toFixed(1)),
        primaryChannel,
        esTopPareto: c.esTopPareto
      };
    });
  }

  getTopClientesAccion(filtros = {}, limit = 10) {
    const { clientes, transacciones } = this._filtrar(filtros);
    const txMap = new Map();
    transacciones.forEach(t => {
      const cur = txMap.get(t.clienteId) || 0;
      txMap.set(t.clienteId, cur + t.volumenTotal);
    });

    const enriquecidos = clientes.map(c => {
      const vol = txMap.get(c.id) || c.volumenBase;
      return {
        id: c.id,
        nombreEmpresa: c.nombreEmpresa || `Company ${c.id}`,
        vendedorId: c.vendedorId,
        vendedorNombre: this.data.VENDEDORES.find(v => v.id === c.vendedorId)?.nombre || 'Vendedor',
        plaza: c.plaza,
        lineaNegocio: c.lineaNegocio,
        unidad: c.unidad,
        volumen: vol,
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