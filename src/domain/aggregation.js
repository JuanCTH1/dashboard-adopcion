/**
 * AGGREGATION & FUNNEL ENGINE - 100% ENGLISH
 */

export function calculateAggregations(transacciones = [], clientes = []) {
  let pedidosTotales = 0;
  let pedidosDigitales = 0;
  let pedidosAnalogos = 0;
  let pedidosWeb = 0;
  let pedidosApp = 0;
  let pedidosEdi = 0;

  let volConcretoTotal = 0;
  let volConcretoDig = 0;
  let volCementoTotal = 0;
  let volCementoDig = 0;
  let volAgregadosTotal = 0;
  let volAgregadosDig = 0;

  transacciones.forEach(t => {
    pedidosTotales += t.pedidosTotales;
    pedidosDigitales += t.pedidosDigitales;
    pedidosAnalogos += t.pedidosAnalogos;
    pedidosWeb += t.pedidosWeb;
    pedidosApp += t.pedidosApp;
    pedidosEdi += t.pedidosEdi;

    if (t.lineaNegocio === 'readymix') {
      volConcretoTotal += t.volumenTotal;
      volConcretoDig += t.volumenDigital;
    } else if (t.lineaNegocio === 'cemento') {
      volCementoTotal += t.volumenTotal;
      volCementoDig += t.volumenDigital;
    } else if (t.lineaNegocio === 'agregados') {
      volAgregadosTotal += t.volumenTotal;
      volAgregadosDig += t.volumenDigital;
    }
  });

  const totalAsignados = clientes.length;
  const totalOnboarded = clientes.filter(c => c.estaIncorporado).length;
  const totalActivos = clientes.filter(c => c.esActivo).length;
  const totalRevertidos = clientes.filter(c => c.esRevertido).length;

  const pctAdopcionPedidos = pedidosTotales > 0 ? (pedidosDigitales / pedidosTotales) * 100 : 0;
  const pctAdopcionClientes = totalAsignados > 0 ? (totalActivos / totalAsignados) * 100 : 0;
  const pctOnboarding = totalAsignados > 0 ? (totalOnboarded / totalAsignados) * 100 : 0;

  return {
    pedidos: {
      totales: pedidosTotales,
      digitales: pedidosDigitales,
      analogos: pedidosAnalogos,
      web: pedidosWeb,
      app: pedidosApp,
      edi: pedidosEdi,
      pctAdopcion: Number(pctAdopcionPedidos.toFixed(1))
    },
    clientes: {
      asignados: totalAsignados,
      onboarded: totalOnboarded,
      activos: totalActivos,
      revertidos: totalRevertidos,
      pctOnboarding: Number(pctOnboarding.toFixed(1)),
      pctAdopcion: Number(pctAdopcionClientes.toFixed(1))
    },
    volumen: {
      concreto: { total: volConcretoTotal, digital: volConcretoDig, unidad: 'cu yd' },
      cemento: { total: volCementoTotal, digital: volCementoDig, unidad: 'tons' },
      agregados: { total: volAgregadosTotal, digital: volAgregadosDig, unidad: 'tons' }
    }
  };
}

export function buildFunnel(metricasGlobales) {
  const c = metricasGlobales.clientes;
  const p = metricasGlobales.pedidos;

  return [
    {
      paso: 1,
      titulo: '1. Client Universe',
      subtitulo: 'Total assigned accounts under management',
      valor: c.asignados,
      pctBase: 100.0,
      tipo: 'absoluto',
      unidad: 'accounts'
    },
    {
      paso: 2,
      titulo: '2. Onboarded Clients',
      subtitulo: 'Registered with active digital credentials',
      valor: c.onboarded,
      pctBase: c.pctOnboarding,
      tipo: 'porcentaje',
      unidad: 'accounts',
      fuga: c.asignados - c.onboarded,
      pctFuga: Number((100 - c.pctOnboarding).toFixed(1))
    },
    {
      paso: 3,
      titulo: '3. Active Digital Clients',
      subtitulo: 'Placed digital transactions in period',
      valor: c.activos,
      pctBase: c.pctAdopcion,
      tipo: 'porcentaje',
      unidad: 'accounts',
      fuga: c.onboarded - c.activos,
      pctFuga: Number((c.onboarded > 0 ? ((c.onboarded - c.activos) / c.onboarded) * 100 : 0).toFixed(1))
    },
    {
      paso: 4,
      titulo: '4. Transactional Adoption',
      subtitulo: 'Digital orders share vs 90.0% Goal',
      valor: p.pctAdopcion,
      pctBase: p.pctAdopcion,
      tipo: 'porcentaje_final',
      unidad: '% orders',
      meta: 90.0
    }
  ];
}