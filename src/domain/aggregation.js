/**
 * FUNCIONES PURAS DE AGREGACIÓN Y CÁLCULO DE DOMINIO
 * Dashboard de Adopción Digital CX
 */

import { LINEAS_NEGOCIO } from './definiciones.js';

export function calculateAggregations(transaccionesPeriodo, clientesAsignados) {
  const numClientes = clientesAsignados.length;
  const numIncorporados = clientesAsignados.filter(c => c.estaIncorporado).length;
  
  const activosIds = new Set(
    transaccionesPeriodo.filter(t => t.pedidosDigitales > 0).map(t => t.clienteId)
  );
  const numActivos = activosIds.size;

  const revertidos = clientesAsignados.filter(c => c.estaIncorporado && c.esRevertido);
  const numRevertidos = revertidos.length;

  const clientesConFttv = clientesAsignados.filter(c => c.fttv != null);
  const fttvPromedio = clientesConFttv.length > 0
    ? Math.round(clientesConFttv.reduce((acc, c) => acc + c.fttv, 0) / clientesConFttv.length)
    : null;

  // Sumas de pedidos
  let pedidosTotales = 0;
  let pedidosDigitales = 0;
  let pedidosAnalogos = 0;
  let pedidosWeb = 0;
  let pedidosApp = 0;
  let pedidosEdi = 0;

  // Sumas de volumen diferenciadas por unidad física (Readymix m³ vs Cemento/Agregados Tons)
  let volConcretoTotal = 0;
  let volConcretoDigital = 0;
  let volCementoTotal = 0;
  let volCementoDigital = 0;

  transaccionesPeriodo.forEach(t => {
    pedidosTotales += t.pedidosTotales;
    pedidosDigitales += t.pedidosDigitales;
    pedidosAnalogos += t.pedidosAnalogos;
    pedidosWeb += (t.pedidosWeb || 0);
    pedidosApp += (t.pedidosApp || 0);
    pedidosEdi += (t.pedidosEdi || 0);

    if (t.lineaNegocio === 'readymix') {
      volConcretoTotal += t.volumenTotal;
      volConcretoDigital += t.volumenDigital;
    } else {
      volCementoTotal += t.volumenTotal;
      volCementoDigital += t.volumenDigital;
    }
  });

  const pctAdopcionPedidos = pedidosTotales > 0
    ? (pedidosDigitales / pedidosTotales) * 100
    : 0;

  const pctAdopcionClientes = numClientes > 0
    ? (numActivos / numClientes) * 100
    : 0;

  const pctOnboardingClientes = numClientes > 0
    ? (numIncorporados / numClientes) * 100
    : 0;

  const pctActivacionSobreOnboarded = numIncorporados > 0
    ? (numActivos / numIncorporados) * 100
    : 0;

  const pctAdopcionConcreto = volConcretoTotal > 0
    ? (volConcretoDigital / volConcretoTotal) * 100
    : 0;

  const pctAdopcionCemento = volCementoTotal > 0
    ? (volCementoDigital / volCementoTotal) * 100
    : 0;

  return {
    clientes: {
      asignados: numClientes,
      incorporados: numIncorporados,
      activos: numActivos,
      revertidos: numRevertidos,
      pctOnboarding: pctOnboardingClientes,
      pctActivacion: pctActivacionSobreOnboarded,
      pctAdopcion: pctAdopcionClientes,
      fttvPromedio
    },
    pedidos: {
      totales: pedidosTotales,
      digitales: pedidosDigitales,
      analogos: pedidosAnalogos,
      pctAdopcion: pctAdopcionPedidos,
      canales: {
        web: pedidosWeb,
        app: pedidosApp,
        edi: pedidosEdi,
        pctWeb: pedidosDigitales > 0 ? (pedidosWeb / pedidosDigitales) * 100 : 0,
        pctApp: pedidosDigitales > 0 ? (pedidosApp / pedidosDigitales) * 100 : 0,
        pctEdi: pedidosDigitales > 0 ? (pedidosEdi / pedidosDigitales) * 100 : 0,
      }
    },
    volumen: {
      concreto: {
        total: volConcretoTotal,
        digital: volConcretoDigital,
        pctAdopcion: pctAdopcionConcreto,
        unidad: 'm³'
      },
      cemento: {
        total: volCementoTotal,
        digital: volCementoDigital,
        pctAdopcion: pctAdopcionCemento,
        unidad: 'tons'
      }
    }
  };
}

export function buildFunnel(metricas, lens = 'clientes') {
  const { clientes, pedidos, volumen } = metricas;

  const cAsignados = clientes.asignados;
  const cIncorporados = clientes.incorporados;
  const cActivos = clientes.activos;

  const convOnboarding = cAsignados > 0 ? (cIncorporados / cAsignados) * 100 : 0;
  const dropOnboarding = 100 - convOnboarding;

  const convUso = cIncorporados > 0 ? (cActivos / cIncorporados) * 100 : 0;
  const dropUso = 100 - convUso;

  return [
    {
      paso: 1,
      etiqueta: 'Cartera Asignada',
      descripcion: 'Cuentas totales gestionadas',
      valor: cAsignados,
      pctPasoAnterior: 100,
      dropOffPct: 0,
      color: '#002B99',
      widthPct: 100
    },
    {
      paso: 2,
      etiqueta: 'Cuentas Onboarded',
      descripcion: 'Registradas en la plataforma',
      valor: cIncorporados,
      pctPasoAnterior: convOnboarding,
      dropOffPct: dropOnboarding,
      motivoFuga: 'Falta de Onboarding por Vendedor',
      color: '#53CC80',
      widthPct: Math.max(25, convOnboarding)
    },
    {
      paso: 3,
      etiqueta: 'Cuentas Activas',
      descripcion: 'Con pedidos digitales en periodo',
      valor: cActivos,
      pctPasoAnterior: convUso,
      dropOffPct: dropUso,
      motivoFuga: 'Resistencia al uso / Soporte CX',
      color: '#398EF4',
      widthPct: Math.max(20, (cActivos / cAsignados) * 100)
    },
    {
      paso: 4,
      etiqueta: 'Adopción Final',
      descripcion: 'Meta corporativa 75%',
      valor: pedidos.pctAdopcion,
      esPorcentaje: true,
      dropOffPct: 0,
      color: '#FFB000',
      widthPct: Math.max(15, pedidos.pctAdopcion)
    }
  ];
}