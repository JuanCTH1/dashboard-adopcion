/**
 * DEFINICIONES DE NEGOCIO Y CONSTANTES DE DOMINIO
 * Dashboard de Adopción Digital CX
 * 
 * Regla: Toda definición de negocio mostrada al usuario en tooltips o selects
 * se centraliza aquí. Modificar aquí propaga a toda la interfaz.
 */

export const ESTATUS_ONBOARDING = {
  INCORPORADO: 'INCORPORADO',
  NO_INCORPORADO: 'NO_INCORPORADO',
};

export const ESTATUS_USO = {
  ACTIVO: 'ACTIVO',
  INACTIVO_REVERTIDO: 'INACTIVO_REVERTIDO',
  NUNCA_USO: 'NUNCA_USO',
};

export const CANALES_DIGITALES = {
  PORTAL_WEB: { id: 'portal_web', label: 'Portal Web', peso: 0.70 },
  APP_MOVIL: { id: 'app_movil', label: 'App Móvil', peso: 0.26 },
  EDI_API: { id: 'edi_api', label: 'EDI / API', peso: 0.04 },
};

export const LINEAS_NEGOCIO = {
  READYMIX: { id: 'readymix', label: 'Readymix', unidad: 'm³', peso: 0.55 },
  CEMENTO: { id: 'cemento', label: 'Cemento', unidad: 'toneladas', peso: 0.30 },
  AGREGADOS: { id: 'agregados', label: 'Agregados', unidad: 'toneladas', peso: 0.15 },
};

export const VENTANAS_ACTIVIDAD = {
  DIAS_30: { id: 30, label: 'Últimos 30 días' },
  DIAS_90: { id: 90, label: 'Últimos 90 días' },
};

export const LENTES = {
  PEDIDOS: 'pedidos',
  CLIENTES: 'clientes',
  VOLUMEN: 'volumen',
};

export const METRIC_DEFINITIONS = {
  incorporado: {
    titulo: 'Cliente Incorporado (Propuesta)',
    descripcion: 'Cliente que completó el registro en la plataforma y cuenta con credenciales activas habilitadas.',
    tipo: 'propuesta'
  },
  activo: {
    titulo: 'Cliente Activo (Propuesta)',
    descripcion: 'Cliente incorporado que ha registrado al menos un pedido digital dentro de la ventana seleccionada (por defecto 90 días).',
    tipo: 'propuesta'
  },
  adopcion_pedidos: {
    titulo: '% Adopción por Pedidos',
    descripcion: 'Proporción de pedidos digitales (Portal Web, App Móvil, EDI) sobre el total de pedidos de la cartera en el periodo.',
    tipo: 'estandar'
  },
  adopcion_clientes: {
    titulo: '% Penetración de Clientes',
    descripcion: 'Proporción de clientes asignados a la cartera que usan activamente los canales digitales.',
    tipo: 'estandar'
  },
  adopcion_volumen: {
    titulo: '% Adopción Ponderada por Volumen',
    descripcion: 'Porcentaje del volumen físico (m³ o toneladas) canalizado por medios digitales. Requiere filtrar por una sola línea de negocio compatible.',
    tipo: 'estandar'
  },
  fttv: {
    titulo: 'First Time to Value (FTTV)',
    descripcion: 'Días promedio transcurridos entre la fecha de alta/onboarding del cliente y su primer pedido digital exitoso.',
    tipo: 'avanzada'
  },
  reversion_analoga: {
    titulo: 'Tasa de Reversión Analógica',
    descripcion: 'Clientes incorporados que compraron digitalmente en meses anteriores pero operaron 100% por vía telefónica/análoga en el periodo actual.',
    tipo: 'avanzada'
  },
  share_of_wallet: {
    titulo: 'Digital Share of Wallet',
    descripcion: 'Porcentaje del volumen total de una cuenta híbrida que es colocado por canales digitales vs canales tradicionales.',
    tipo: 'estandar'
  }
};
