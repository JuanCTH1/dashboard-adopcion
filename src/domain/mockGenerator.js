/**
 * GENERADOR DETERMINISTA DE DATOS SINTÉTICOS DE ADOPCIÓN CX
 * PRNG Mulberry32 para reproducibilidad exacta
 */

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateDataset(seed = 20260828) {
  const rand = mulberry32(seed);

  const MESES = [];
  const anios = [2024, 2025, 2026];
  const nombresMes = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  anios.forEach(anio => {
    nombresMes.forEach((nombre, idx) => {
      const mesNum = idx + 1;
      const mm = String(mesNum).padStart(2, '0');
      MESES.push({
        key: `${anio}-${mm}`,
        label: `${nombre} ${anio}`,
        nombreMes: nombre,
        mesNum: mesNum,
        anio: anio
      });
    });
  });

  const periodoActual = '2026-08';

  const REGIONES = [
    { id: 'reg-1', nombre: 'Norte / Pacífico', plazas: ['Tijuana', 'Hermosillo', 'Culiacán', 'Chihuahua'] },
    { id: 'reg-2', nombre: 'Noreste / Centro', plazas: ['Monterrey', 'Saltillo', 'Torreón', 'San Luis Potosí'] },
    { id: 'reg-3', nombre: 'Bajío / Occidente', plazas: ['Guadalajara', 'León', 'Querétaro', 'Aguascalientes'] },
    { id: 'reg-4', nombre: 'Sur / Golfo', plazas: ['CDMX', 'Puebla', 'Veracruz', 'Mérida'] }
  ];

  const VPS = [
    { id: 'vp-1', nombre: 'VP Oeste / Norte', regiones: ['reg-1', 'reg-2'] },
    { id: 'vp-2', nombre: 'VP Este / Centro-Sur', regiones: ['reg-3', 'reg-4'] }
  ];

  const DIRECTORES = [
    { id: 'dir-1', nombre: 'Dir. Costa Pacífica', vpId: 'vp-1', regionId: 'reg-1' },
    { id: 'dir-2', nombre: 'Dir. Noreste Industrial', vpId: 'vp-1', regionId: 'reg-2' },
    { id: 'dir-3', nombre: 'Dir. Bajío & Occidente', vpId: 'vp-2', regionId: 'reg-3' },
    { id: 'dir-4', nombre: 'Dir. Metropolitano Sur', vpId: 'vp-2', regionId: 'reg-4' }
  ];

  const GERENTES = [];
  DIRECTORES.forEach((dir, dIdx) => {
    for (let g = 1; g <= 3; g++) {
      const gId = `ger-${dIdx * 3 + g}`;
      GERENTES.push({
        id: gId,
        nombre: `Gerente ${dIdx * 3 + g} (${dir.nombre.split(' ')[1] || 'Plaza'})`,
        directorId: dir.id,
        vpId: dir.vpId,
        regionId: dir.regionId
      });
    }
  });

  const NOMBRES_VENDEDORES = [
    'Juan Pérez', 'María Gómez', 'Carlos Ruiz', 'Ana López', 'Roberto Garza',
    'Laura Sánchez', 'David Torres', 'Patricia Morales', 'Fernando Castro', 'Sofía Herrera',
    'Jorge Villarreal', 'Elena Ramos', 'Ricardo Mendoza', 'Carmen Ortiz', 'Alejandro Peña',
    'Daniela Flores', 'Manuel Treviño', 'Gabriela Reyes', 'Héctor Salgado', 'Beatriz Domínguez',
    'Hugo Vargas', 'Adriana Luna', 'Esteban Campos', 'Silvia Vega', 'Pablo Navarro',
    'Raquel Guzmán', 'Ignacio Soto', 'Verónica Meza', 'Arturo Medina', 'Claudia Delgado',
    'Gonzalo Ríos', 'Teresa Pacheco', 'Felipe Cárdenas', 'Alicia Valdés', 'César Espinoza',
    'Leticia Solís', 'Andrés Cervantes', 'Rosario Ibarra', 'Marcos Lara', 'Yolanda Rangel',
    'Emilio Montes', 'Diana Serrano', 'Jaime Beltrán', 'Mónica Corona', 'Salvador Fuentes',
    'Guadalupe Tapia', 'Víctor Ponce', 'Irma Carrillo', 'Ángel Rosales', 'Norma Castañeda'
  ];

  const VENDEDORES = [];
  let vIdx = 0;
  GERENTES.forEach(ger => {
    const numReps = Math.floor(rand() * 2) + 4; // 4 a 5 reps
    const regionObj = REGIONES.find(r => r.id === ger.regionId);
    for (let i = 0; i < numReps; i++) {
      if (vIdx < NOMBRES_VENDEDORES.length) {
        const plaza = regionObj.plazas[i % regionObj.plazas.length];
        VENDEDORES.push({
          id: `rep-${vIdx + 1}`,
          nombre: NOMBRES_VENDEDORES[vIdx],
          gerenteId: ger.id,
          directorId: ger.directorId,
          vpId: ger.vpId,
          regionId: ger.regionId,
          regionNombre: regionObj.nombre,
          plaza: plaza,
          empujeOnboarding: rand() * 0.4 + 0.6
        });
        vIdx++;
      }
    }
  });

  const LINEAS_LIST = [
    { id: 'readymix', label: 'Concreto / Readymix', unidad: 'm³', peso: 0.45 },
    { id: 'cemento', label: 'Cemento a Granel', unidad: 'tons', peso: 0.35 },
    { id: 'agregados', label: 'Agregados / Cantera', unidad: 'tons', peso: 0.20 }
  ];

  const CLIENTES = [];
  let cIdx = 1;

  VENDEDORES.forEach(rep => {
    const numClientes = Math.floor(rand() * 12) + 20; // 20 a 31 clientes

    for (let i = 0; i < numClientes; i++) {
      const cId = `CLI-${String(cIdx).padStart(5, '0')}`;
      cIdx++;

      const lRand = rand();
      const linea = lRand < 0.45 ? LINEAS_LIST[0] : lRand < 0.80 ? LINEAS_LIST[1] : LINEAS_LIST[2];

      const u = rand();
      const isTopPareto = u > 0.80; // top 20%
      const volumenBase = isTopPareto
        ? Math.floor(rand() * 2500) + 1200
        : Math.floor(rand() * 220) + 40;

      const estaIncorporado = rand() < (0.75 * rep.empujeOnboarding);
      const esActivo = estaIncorporado && rand() < 0.86;
      const esRevertido = estaIncorporado && !esActivo && rand() < 0.30;

      const fttv = estaIncorporado ? Math.floor(rand() * 28) + 2 : null;
      const digitalShare = esActivo ? rand() * 0.45 + 0.50 : 0;

      const canalRand = rand();
      const canalPreferido = canalRand < 0.55 ? 'web' : canalRand < 0.85 ? 'app' : 'edi';

      CLIENTES.push({
        id: cId,
        vendedorId: rep.id,
        gerenteId: rep.gerenteId,
        directorId: rep.directorId,
        vpId: rep.vpId,
        regionId: rep.regionId,
        plaza: rep.plaza,
        lineaNegocio: linea.id,
        lineaLabel: linea.label,
        unidad: linea.unidad,
        volumenBase,
        isTopPareto,
        esTopPareto: isTopPareto,
        estaIncorporado,
        esActivo,
        esRevertido,
        fttv,
        digitalShare,
        canalPreferido
      });
    }
  });

  // Curva de Adopción Realista: Inicia en ~12.2% en Ene 2024 y llega a ~75.4% en Ago 2026 con fluctuaciones
  // Array de tasas base históricas no-lineales
  const BASE_CURVE_24M = [
    0.122, 0.135, 0.118, 0.149, 0.174, 0.162, 0.201, 0.228, 0.215, 0.254, 0.282, 0.269, // 2024: 12% a 27%
    0.312, 0.345, 0.331, 0.386, 0.421, 0.408, 0.465, 0.502, 0.489, 0.541, 0.583, 0.569, // 2025: 31% a 57%
    0.615, 0.648, 0.632, 0.684, 0.721, 0.709, 0.738, 0.754, 0.768, 0.782, 0.795, 0.812  // 2026: 61% a 81%
  ];

  const TRANSACCIONES = [];

  MESES.forEach((m, mIdx) => {
    const baseRate = BASE_CURVE_24M[mIdx] || 0.50;

    CLIENTES.forEach(cli => {
      // Estacionalidad mensual
      const seasonality = 1 + (Math.sin(m.mesNum * 0.5) * 0.10);
      const volMes = Math.max(10, Math.round(cli.volumenBase * seasonality * (rand() * 0.25 + 0.88)));

      const pedidosTotales = Math.max(1, Math.round((volMes / (cli.isTopPareto ? 160 : 32)) * (rand() * 0.35 + 0.82)));

      let pedidosDigitales = 0;
      let pedidosAnalogos = pedidosTotales;
      let volDigital = 0;
      let volAnalogo = volMes;

      if (cli.estaIncorporado) {
        // Factor de adopción no-lineal con ruido
        const clientAdoptionRate = Math.min(0.98, Math.max(0.04, baseRate * (cli.esActivo ? 1.25 : 0.45) + ((rand() - 0.5) * 0.12)));
        pedidosDigitales = Math.round(pedidosTotales * clientAdoptionRate);
        if (pedidosDigitales > pedidosTotales) pedidosDigitales = pedidosTotales;
        pedidosAnalogos = pedidosTotales - pedidosDigitales;

        volDigital = Math.round(volMes * (pedidosDigitales / pedidosTotales));
        volAnalogo = volMes - volDigital;
      }

      let pedidosWeb = 0;
      let pedidosApp = 0;
      let pedidosEdi = 0;

      if (pedidosDigitales > 0) {
        if (cli.canalPreferido === 'web') {
          pedidosWeb = Math.ceil(pedidosDigitales * 0.65);
          pedidosApp = pedidosDigitales - pedidosWeb;
        } else if (cli.canalPreferido === 'app') {
          pedidosApp = Math.ceil(pedidosDigitales * 0.65);
          pedidosWeb = pedidosDigitales - pedidosApp;
        } else {
          pedidosEdi = Math.ceil(pedidosDigitales * 0.75);
          pedidosWeb = pedidosDigitales - pedidosEdi;
        }
      }

      TRANSACCIONES.push({
        periodo: m.key,
        clienteId: cli.id,
        vendedorId: cli.vendedorId,
        gerenteId: cli.gerenteId,
        directorId: cli.directorId,
        vpId: cli.vpId,
        regionId: cli.regionId,
        plaza: cli.plaza,
        lineaNegocio: cli.lineaNegocio,
        unidad: cli.unidad,
        pedidosTotales,
        pedidosDigitales,
        pedidosAnalogos,
        pedidosWeb,
        pedidosApp,
        pedidosEdi,
        volumenTotal: volMes,
        volumenDigital: volDigital,
        volumenAnalogo: volAnalogo
      });
    });
  });

  return {
    MESES,
    periodoActual,
    REGIONES,
    VPS,
    DIRECTORES,
    GERENTES,
    VENDEDORES,
    CLIENTES,
    TRANSACCIONES
  };
}