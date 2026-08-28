/**
 * GLOSSARY OF METRICS AND DEFINITIONS FOR CX DIGITAL ADOPTION - 100% ENGLISH
 */

export const METRIC_DEFINITIONS = {
  pedidos: {
    title: "Digital Adoption Rate (Orders)",
    shortLabel: "Digital Orders Share",
    description: "Percentage of total orders placed via self-service digital channels (Web Portal, Mobile App, EDI Integration).",
    formula: "(Digital Orders / Total Orders) * 100",
    target: 90.0
  },
  clientes: {
    title: "Client Onboarding Penetration",
    shortLabel: "Onboarded Customers",
    description: "Percentage of active commercial customers registered with an enabled user profile on the digital platform.",
    formula: "(Onboarded Customers / Total Assigned Universe) * 100",
    target: 85.0
  },
  volumen: {
    title: "Digital Volume Penetration",
    shortLabel: "Digital Volume",
    description: "Total metric volume (cu yd / tons) dispatched through digitally placed orders.",
    formula: "Sum(Digital Order Volumes)",
    target: 80.0
  },
  fttv: {
    title: "Time-to-First-Value (FTTV)",
    shortLabel: "Days to First Digital Tx",
    description: "Average days elapsed between customer creation and the first completed digital order.",
    target: 14
  }
};

export const LINEAS_NEGOCIO = {
  readymix: {
    id: 'readymix',
    label: 'Readymix Concrete',
    unidad: 'cu yd',
    color: '#002B99'
  },
  cemento: {
    id: 'cemento',
    label: 'Bulk Cement',
    unidad: 'tons',
    color: '#10b981'
  },
  agregados: {
    id: 'agregados',
    label: 'Aggregates & Quarries',
    unidad: 'tons',
    color: '#f59e0b'
  }
};