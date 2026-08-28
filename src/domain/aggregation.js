/**
 * FUNCIONES PURAS DE AGREGACIÓN Y CÁLCULO DE DOMINIO
 * Dashboard de Adopción Digital CX
 */

import { LINEAS_NEGOCIO } from './definiciones.js';

/**
 * Valida si un conjunto de registros de transacciones o clientes comparte
 * una unidad física compatible (o si mezcla m³ con toneladas).
 */
export function validateVolumeCompatibility(items) {
  if (!items || items.length === 0) return { compatible: true, unidad: '' };
  
  const lineas = new Set(items.map(i => i.lineaNegocio));
  
  // Si contiene Readymix Y alguna otra línea (Cemento o Agregados) -> Incompatible
  const hasReadymix = lineas.has('readymix');
  const hasOtros = lineas.has('cemento') || lineas.has('agregados');
  
  if (hasReadymix && hasOtros) {
    return {
      compatible: false,
      mensaje: 'El lente de volumen está deshabilitado: no se pueden sumar m³ de Readymix con toneladas de Cemento/Agregados. Selecciona una sola línea de negocio en los filtros.'
    };
  }

  const primeraLinea = LINEAS_NEGOCIO[items[0].lineaNegocio?.toUpperCase()] || { unidad: 'unidades' };
  return {
    compatible: true,
    unidad: hasReadymix ? 'm³' : 'toneladas'
  };
}

/**
 * Calcula métricas agregadas a partir de un conjunto de transacciones del periodo y clientes.
 */
export function calculateAggregations(transaccionesPeriodo, clientesAsignados) {
  const numClientes = clientesAsignados.length;
  const numIncorporados = clientesAsignados.filter(c => c.estaIncorporado).length;
  
  // Clientes activos en el periodo según transacciones
  const activosIds = new Set(
    transaccionesPeriodo.filter(t => t.pedidosDigitales > 0).map(t => t.clienteId)
  );
  const numActivos = activosIds.size;

  // Clientes revertidos (están incorporados, fueron activos alguna vez, pero en este mes tuvieron 0 pedidos digitales)
  const revertidos = clientesAsignados.filter(c => c.estaIncorporado && c.esRevertido);
  const numRevertidos = revertidos.length;

  // FTTV promedio
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

  // Sumas de volumen
  let volumenTotal = 0;
  let volumenDigital = 0;
  let volumenAnalogo = 0;

  transaccionesPeriodo.forEach(t => {
    pedidosTotales += t.pedidosTotales;
    pedidosDigitales += t.pedidosDigitales;
    pedidosAnalogos += t.pedidosAnalogos;
    pedidosWeb += (t.pedidosWeb || 0);
    pedidosApp += (t.pedidosApp || 0);
    pedidosEdi += (t.pedidosEdi || 0);

    volumenTotal += t.volumenTotal;
    volumenDigital += t.volumenDigital;
    volumenAnalogo += t.volumenAnalogo;
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

  const pctAdopcionVolumen = volumenTotal > 0
    ? (volumenDigital / volumenTotal) * 100
    : 0;

  const volCompat = validateVolumeCompatibility(transaccionesPeriodo);

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
      total: volumenTotal,
      digital: volumenDigital,
      analogo: volumenAnalogo,
      pctAdopcion: pctAdopcionVolumen,
      compatible: volCompat.compatible,
      unidad: volCompat.unidad,
      mensajeIncompatibilidad: volCompat.mensaje
    }
  };
}

/**
 * Construye los 4 pasos del Funnel Conectado según el lente activo.
 */
export function buildFunnel(metricas, lens = 'clientes') {
  const { clientes, pedidos, volumen } = metricas;

  if (lens === 'volumen' && volumen.compatible) {
    const total = volumen.total;
    const volOnboarded = Math.round(total * (clientes.pctOnboarding / 100));
    const volActivo = volumen.digital;
    
    return [
      {
        paso: 1,
        etiqueta: 'Volumen Asignado',
        valor: total,
        unidad: volumen.unidad,
        pctPasoAnterior: 100,
        dropOffPct: 0
      },
      {
        paso: 2,
        etiqueta: 'Vol. Cuentas Onboarded',
        valor: volOnboarded,
        unidad: volumen.unidad,
        pctPasoAnterior: total > 0 ? (volOnboarded / total) * 100 : 0,
        dropOffPct: total > 0 ? ((total - volOnboarded) / total) * 100 : 0
      },
      {
        paso: 3,
        etiqueta: 'Volumen Transaccionado Digital',
        valor: volActivo,
        unidad: volumen.unidad,
        pctPasoAnterior: volOnboarded > 0 ? (volActivo / volOnboarded) * 100 : 0,
        dropOffPct: volOnboarded > 0 ? ((volOnboarded - volActivo) / volOnboarded) * 100 : 0
      },
      {
        paso: 4,
        etiqueta: '% Adopción de Volumen',
        valor: volumen.pctAdopcion,
        esPorcentaje: true,
        dropOffPct: 0
      }
    ];
  }

  if (lens === 'pedidos') {
    return [
      {
        paso: 1,
        etiqueta: 'Pedidos Totales',
        valor: pedidos.totales,
        pctPasoAnterior: 100,
        dropOffPct: 0
      },
      {
        paso: 2,
        etiqueta: 'Potencial Digital (Onboarded)',
        valor: Math.round(pedidos.totales * (clientes.pctOnboarding / 100)),
        pctPasoAnterior: clientes.pctOnboarding,
        dropOffPct: 100 - clientes.pctOnboarding
      },
      {
        paso: 3,
        etiqueta: 'Pedidos Digitales Reales',
        valor: pedidos.digitales,
        pctPasoAnterior: pedidos.totales > 0 ? (pedidos.digitales / pedidos.totales) * 100 : 0,
        dropOffPct: pedidos.totales > 0 ? (pedidos.analogos / pedidos.totales) * 100 : 0
      },
      {
        paso: 4,
        etiqueta: '% Adopción de Pedidos',
        valor: pedidos.pctAdopcion,
        esPorcentaje: true,
        dropOffPct: 0
      }
    ];
  }

  // Por defecto: Lente Clientes (La historia del embudo de onboarding & uso)
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
      etiqueta: 'Clientes en Cartera',
      valor: cAsignados,
      pctPasoAnterior: 100,
      dropOffPct: 0
    },
    {
      paso: 2,
      etiqueta: 'Clientes Incorporados',
      valor: cIncorporados,
      pctPasoAnterior: convOnboarding,
      dropOffPct: dropOnboarding,
      motivoFuga: 'Falta de Onboarding por Vendedor'
    },
    {
      paso: 3,
      etiqueta: 'Clientes Activos',
      valor: cActivos,
      pctPasoAnterior: convUso,
      dropOffPct: dropUso,
      motivoFuga: 'Resistencia al uso / Soporte CX'
    },
    {
      paso: 4,
      etiqueta: '% Penetración Final',
      valor: clientes.pctAdopcion,
      esPorcentaje: true,
      dropOffPct: 0
    }
  ];
}
