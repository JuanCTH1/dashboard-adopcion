/**
 * GENERADOR DE DATOS SINTÉTICOS DETERMINISTAS (MOCK ENGINE)
 * Dashboard de Adopción Digital CX
 */

import { ESTATUS_ONBOARDING, ESTATUS_USO, LINEAS_NEGOCIO } from './definiciones.js';

// PRNG Determinista Mulberry32
function createPrng(seed = 42) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generador de distribución Log-Normal (Box-Muller)
function randomLogNormal(prng, mu, sigma) {
  const u1 = Math.max(1e-7, prng());
  const u2 = prng();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return Math.exp(mu + sigma * z0);
}

export function generateDataset(seed = 20260828) {
  const prng = createPrng(seed);

  // 1. Geografía
  const REGIONES = [
    { id: 'pnw', nombre: 'Pacific Northwest', plazas: ['Seattle', 'Portland'], climaFrio: true },
    { id: 'cal', nombre: 'California', plazas: ['Sacramento', 'Los Angeles', 'San Diego'], climaFrio: false },
    { id: 'sw', nombre: 'Southwest', plazas: ['Phoenix', 'Tucson', 'Albuquerque'], climaFrio: false },
    { id: 'tex', nombre: 'Texas', plazas: ['Dallas', 'Houston', 'Austin', 'San Antonio'], climaFrio: false },
    { id: 'mid', nombre: 'Midwest', plazas: ['Chicago', 'Detroit', 'Minneapolis'], climaFrio: true },
    { id: 'se', nombre: 'Southeast', plazas: ['Atlanta', 'Orlando', 'Charlotte'], climaFrio: false }
  ];

  // 2. Jerarquía Comercial
  const VPS = [
    { id: 'VP-01', nombre: 'VP Oeste', regiones: ['pnw', 'cal', 'sw'] },
    { id: 'VP-02', nombre: 'VP Este', regiones: ['tex', 'mid', 'se'] }
  ];

  const DIRECTORES = [
    { id: 'DIR-01', nombre: 'Dir. Costa Pacífica', vpId: 'VP-01', regionId: 'cal' },
    { id: 'DIR-02', nombre: 'Dir. Noroeste & Suroeste', vpId: 'VP-01', regionId: 'sw' },
    { id: 'DIR-03', nombre: 'Dir. Texas & Golfo', vpId: 'VP-02', regionId: 'tex' },
    { id: 'DIR-04', nombre: 'Dir. Midwest & Sureste', vpId: 'VP-02', regionId: 'mid' }
  ];

  const GERENTES = [];
  let gteCount = 1;
  DIRECTORES.forEach(dir => {
    for (let i = 1; i <= 3; i++) {
      const id = 'GTE-' + String(gteCount).padStart(2, '0');
      GERENTES.push({
        id,
        nombre: 'Gerente ' + gteCount + ' (' + dir.nombre.split(' ')[1] + ')',
        directorId: dir.id,
        vpId: dir.vpId
      });
      gteCount++;
    }
  });

  const NOMBRES_VENDEDORES = [
    'Juan Pérez', 'María Rodríguez', 'Carlos Garza', 'Ana Lucía Treviño',
    'Roberto Cantú', 'Sofía Villarreal', 'Alejandro Morales', 'Diana Castillo',
    'Fernando Reyes', 'Patricia Lozano', 'Ricardo Salinas', 'Gabriela Hinojosa',
    'Eduardo Elizondo', 'Valeria Serna', 'Javier Benítez', 'Laura Cavazos',
    'Héctor Sada', 'Daniela Chapa', 'Guillermo Domínguez', 'Natalia Guerra',
    'Manuel Valdés', 'Paola Montemayor', 'Rodrigo Zambrano', 'Claudia De la Garza',
    'Andrés Santos', 'Mónica Junco', 'Gustavo Clariond', 'Lucía Coindreau',
    'Tomás Muguerza', 'Adriana Ferrara', 'Raúl Canales', 'Lorena Madero',
    'Ignacio Terrazas', 'Beatriz Rivero', 'Jorge Segovia', 'Carmen Belden',
    'Emilio González', 'Regina Tamez', 'Arturo Santos', 'Verónica Dieck',
    'Federico Pozas', 'Paulina Ballesteros', 'Salvador Calderón', 'Silvia Bremer',
    'Óscar García', 'Marcela Treviño', 'Rubén Martínez', 'Ivonne Lobo',
    'Hugo Garza', 'Teresa Kalifa'
  ];

  const VENDEDORES = [];
  let vendIdx = 0;
  GERENTES.forEach((gte, gIdx) => {
    const count = (gIdx < 2) ? 5 : 4; 
    for (let i = 0; i < count; i++) {
      if (vendIdx < NOMBRES_VENDEDORES.length) {
        const id = 'VEN-' + String(vendIdx + 1).padStart(2, '0');
        const dir = DIRECTORES.find(d => d.id === gte.directorId);
        const reg = REGIONES.find(r => r.id === dir.regionId) || REGIONES[vendIdx % REGIONES.length];
        const plaza = reg.plazas[i % reg.plazas.length];

        const empujeOnboarding = 0.30 + prng() * 0.68;
        
        VENDEDORES.push({
          id,
          nombre: NOMBRES_VENDEDORES[vendIdx],
          gerenteId: gte.id,
          directorId: gte.directorId,
          vpId: gte.vpId,
          regionId: reg.id,
          regionNombre: reg.nombre,
          plaza,
          empujeOnboarding
        });
        vendIdx++;
      }
    }
  });

  // 3. Generación de ~1,300 Clientes con Pareto 20/75 y Líneas de Negocio
  const CLIENTES = [];
  let cliSeq = 1000;

  VENDEDORES.forEach(vend => {
    const numClientes = 20 + Math.floor(prng() * 11);

    for (let c = 0; c < numClientes; c++) {
      cliSeq++;
      const id = 'CLI-' + String(cliSeq).padStart(5, '0');

      const rLinea = prng();
      let lineaKey = 'READYMIX';
      if (rLinea > 0.85) lineaKey = 'AGREGADOS';
      else if (rLinea > 0.55) lineaKey = 'CEMENTO';
      const linea = LINEAS_NEGOCIO[lineaKey];

      // Distribución Log-Normal con factor de Pareto (20% de cuentas concentran ~75% del volumen)
      const esGrande = prng() < 0.20;
      let volumenBase;
      if (esGrande) {
        // Cuentas tractoras / gran volumen
        volumenBase = randomLogNormal(prng, 10.55, 0.35);
      } else {
        // Cuentas estándar
        volumenBase = randomLogNormal(prng, 7.8, 0.45);
      }
      volumenBase = Math.round(Math.max(1200, Math.min(95000, volumenBase)));

      const estaIncorporado = prng() < vend.empujeOnboarding;
      
      let fttv = null;
      let esActivo = false;
      let esRevertido = false;

      if (estaIncorporado) {
        const nuncaActiva = prng() < 0.18;
        if (!nuncaActiva) {
          fttv = Math.round(randomLogNormal(prng, 2.48, 0.6));
          fttv = Math.max(1, Math.min(90, fttv));
          
          if (prng() < 0.045) {
            esRevertido = true;
            esActivo = false;
          } else {
            esActivo = true;
          }
        }
      }

      let digitalShare = 0;
      if (esActivo) {
        digitalShare = Math.min(1.0, Math.max(0.20, 0.68 + (prng() - 0.5) * 0.35));
      }

      const rCanal = prng();
      let canalPreferido = 'portal_web';
      if (rCanal > 0.96) canalPreferido = 'edi_api';
      else if (rCanal > 0.70) canalPreferido = 'app_movil';

      CLIENTES.push({
        id,
        vendedorId: vend.id,
        gerenteId: vend.gerenteId,
        directorId: vend.directorId,
        vpId: vend.vpId,
        regionId: vend.regionId,
        plaza: vend.plaza,
        lineaNegocio: linea.id,
        lineaLabel: linea.label,
        unidad: linea.unidad,
        volumenBase,
        estaIncorporado,
        esActivo,
        esRevertido,
        fttv,
        digitalShare,
        canalPreferido,
        esTopPareto: esGrande
      });
    }
  });

  // 4. Generación de Serie Histórica (24 Meses)
  const MESES = [];
  const startYear = 2024;
  const startMonth = 9; // Sep 2024
  for (let m = 0; m < 24; m++) {
    const d = new Date(startYear, startMonth - 1 + m, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const key = yyyy + '-' + mm;
    const label = d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    MESES.push({ key, label, monthIdx: m, monthOfYear: d.getMonth() + 1 });
  }

  const TRANSACCIONES = [];
  
  CLIENTES.forEach(cli => {
    const reg = REGIONES.find(r => r.id === cli.regionId);
    
    MESES.forEach(m => {
      let factorEstacional = 1.0;
      if (reg && reg.climaFrio && (m.monthOfYear === 12 || m.monthOfYear === 1 || m.monthOfYear === 2)) {
        factorEstacional = 0.85;
      }
      
      const factorMaduracion = Math.min(1.0, 0.75 + (m.monthIdx / 24) * 0.25);
      const factorRuido = 0.92 + prng() * 0.16;
      const volumenTotal = Math.round(cli.volumenBase * factorEstacional * factorRuido);
      
      const pedidoPromedio = cli.lineaNegocio === 'readymix' ? 350 : 600;
      const pedidosTotales = Math.max(1, Math.round(volumenTotal / pedidoPromedio));
      
      let esActivoEsteMes = cli.esActivo;
      if (m.monthIdx < 12 && prng() < (0.35 - m.monthIdx * 0.025)) {
        esActivoEsteMes = false;
      }
      
      let pedidosDigitales = 0;
      let volumenDigital = 0;
      let pedidosWeb = 0;
      let pedidosApp = 0;
      let pedidosEdi = 0;
      
      if (esActivoEsteMes) {
        const shareMes = Math.min(1.0, cli.digitalShare * factorMaduracion);
        pedidosDigitales = Math.round(pedidosTotales * shareMes);
        volumenDigital = Math.round(volumenTotal * shareMes);
        
        if (cli.canalPreferido === 'edi_api') {
          pedidosEdi = pedidosDigitales;
        } else if (cli.canalPreferido === 'app_movil') {
          pedidosApp = Math.round(pedidosDigitales * 0.85);
          pedidosWeb = pedidosDigitales - pedidosApp;
        } else {
          pedidosWeb = Math.round(pedidosDigitales * 0.75);
          pedidosApp = pedidosDigitales - pedidosWeb;
        }
      }
      
      const pedidosAnalogos = pedidosTotales - pedidosDigitales;
      const volumenAnalogo = volumenTotal - volumenDigital;

      TRANSACCIONES.push({
        clienteId: cli.id,
        vendedorId: cli.vendedorId,
        gerenteId: cli.gerenteId,
        directorId: cli.directorId,
        vpId: cli.vpId,
        regionId: cli.regionId,
        plaza: cli.plaza,
        lineaNegocio: cli.lineaNegocio,
        periodo: m.key,
        pedidosTotales,
        pedidosDigitales,
        pedidosAnalogos,
        pedidosWeb,
        pedidosApp,
        pedidosEdi,
        volumenTotal,
        volumenDigital,
        volumenAnalogo,
        esActivo: pedidosDigitales > 0,
        estaIncorporado: cli.estaIncorporado
      });
    });
  });

  return {
    VPS,
    DIRECTORES,
    GERENTES,
    VENDEDORES,
    CLIENTES,
    REGIONES,
    MESES,
    TRANSACCIONES,
    periodoActual: MESES[MESES.length - 1].key
  };
}
