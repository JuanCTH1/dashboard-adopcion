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

  const periodClientIds = new Set();
  const digitalClientIds = new Set();

  transacciones.forEach(t => {
    pedidosTotales += t.pedidosTotales;
    pedidosDigitales += t.pedidosDigitales;
    pedidosAnalogos += t.pedidosAnalogos;
    pedidosWeb += t.pedidosWeb;
    pedidosApp += t.pedidosApp;
    pedidosEdi += t.pedidosEdi;

    periodClientIds.add(t.clienteId);
    if (t.pedidosDigitales > 0) {
      digitalClientIds.add(t.clienteId);
    }

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

  // Calculate total orders (digital + analog) placed by Active Customers
  let pedidosActivosTotales = 0;
  transacciones.forEach(t => {
    if (digitalClientIds.has(t.clienteId)) {
      pedidosActivosTotales += t.pedidosTotales;
    }
  });

  const hasTxFilter = transacciones.length > 0;

  const onboardedClientIds = new Set();
  const revertidosClientIds = new Set();

  if (hasTxFilter) {
    transacciones.forEach(t => {
      if (t.estaIncorporado) onboardedClientIds.add(t.clienteId);
      if (t.esRevertido) revertidosClientIds.add(t.clienteId);
    });
  }

  const filteredClientsInPeriod = (hasTxFilter && periodClientIds.size < clientes.length)
    ? clientes.filter(c => periodClientIds.has(c.id))
    : clientes;

  const totalAsignados = filteredClientsInPeriod.length || clientes.length;
  const totalOnboarded = hasTxFilter ? onboardedClientIds.size : filteredClientsInPeriod.filter(c => c.estaIncorporado).length;
  const totalActivos = hasTxFilter ? digitalClientIds.size : clientes.filter(c => c.esActivo).length;
  const totalRevertidos = hasTxFilter ? revertidosClientIds.size : filteredClientsInPeriod.filter(c => c.esRevertido).length;

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
      activosTotales: pedidosActivosTotales || pedidosTotales,
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

export function buildFunnel(actual = {}) {
  const c = actual.clientes || {};
  const p = actual.pedidos || {};

  const asignados = c.asignados || 0;
  const onboarded = c.onboarded || 0;
  const activos = c.activos || 0;
  const pctAdopcion = p.pctAdopcion || 0;

  const dropOffStage1 = asignados > 0 ? ((asignados - onboarded) / asignados) * 100 : 0;
  const dropOffStage2 = onboarded > 0 ? ((onboarded - activos) / onboarded) * 100 : 0;

  return [
    {
      id: 'universo',
      stepName: '1. Assigned Universe',
      count: asignados,
      unit: 'Accounts',
      dropOffPct: Number(dropOffStage1.toFixed(1)),
      subLabel: `${p.totales || 0} Total Orders`
    },
    {
      id: 'onboarded',
      stepName: '2. Onboarded CX App',
      count: onboarded,
      unit: 'Accounts',
      pctOfUniverse: Number((c.pctOnboarding || 0).toFixed(1)),
      dropOffPct: Number(dropOffStage2.toFixed(1)),
      subLabel: `${c.pctOnboarding || 0}% Onboarding Rate`
    },
    {
      id: 'activos',
      stepName: '3. Active Buyers',
      count: activos,
      unit: 'Accounts',
      pctOfUniverse: Number((c.pctAdopcion || 0).toFixed(1)),
      subLabel: `${p.digitales || 0} Digital Orders`
    },
    {
      id: 'adopcion',
      stepName: '4. Digital Adoption Rate',
      count: pctAdopcion,
      unit: '% Adoption',
      isDominant: true,
      subLabel: `${p.digitales || 0} / ${p.totales || 0} Digital Orders`
    }
  ];
}