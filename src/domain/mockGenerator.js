/**
 * DETERMINISTIC SYNTHETIC DATA GENERATOR FOR CX ADOPTION - 100% ENGLISH
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
  const nombresMes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
    { id: 'reg-1', nombre: 'US North & Atlantic', plazas: ['New York', 'Philadelphia', 'Boston', 'Chicago'] },
    { id: 'reg-2', nombre: 'US Sunbelt & Gulf', plazas: ['Houston', 'Dallas', 'Atlanta', 'Miami'] },
    { id: 'reg-3', nombre: 'US Midwest & Central', plazas: ['Denver', 'Salt Lake City', 'Kansas City', 'St. Louis'] },
    { id: 'reg-4', nombre: 'US Pacific & Southwest', plazas: ['Los Angeles', 'Phoenix', 'Seattle', 'San Francisco'] }
  ];

  const VPS = [
    { id: 'vp-readymix', nombre: 'VP Readymix Concrete', lineaNegocio: 'readymix', unidad: 'cu yd' },
    { id: 'vp-cemento', nombre: 'VP Bulk Cement', lineaNegocio: 'cemento', unidad: 'tons' },
    { id: 'vp-agregados', nombre: 'VP Quarries & Aggregates', lineaNegocio: 'agregados', unidad: 'tons' }
  ];

  const DIRECTORES = [
    { id: 'dir-rm-east', nombre: 'Dir. Readymix East', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-1' },
    { id: 'dir-rm-west', nombre: 'Dir. Readymix West', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-4' },
    { id: 'dir-cem-east', nombre: 'Dir. Cement Sunbelt & East', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-2' },
    { id: 'dir-cem-west', nombre: 'Dir. Cement Central & West', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-3' },
    { id: 'dir-agg-nat', nombre: 'Dir. National Quarries', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-1' }
  ];

  const GERENTES = [];
  DIRECTORES.forEach((dir, dIdx) => {
    for (let g = 1; g <= 3; g++) {
      const gId = `ger-${dIdx * 3 + g}`;
      GERENTES.push({
        id: gId,
        nombre: `Manager ${g} (${dir.nombre.split(' ')[1] || 'Region'})`,
        directorId: dir.id,
        vpId: dir.vpId,
        lineaNegocio: dir.lineaNegocio,
        regionId: dir.regionId
      });
    }
  });

  const NOMBRES_VENDEDORES = [
    'John Smith', 'Michael Johnson', 'David Miller', 'Emily Davis', 'James Wilson',
    'Sarah Taylor', 'Robert Anderson', 'Jennifer Thomas', 'William Jackson', 'Elizabeth White',
    'Christopher Harris', 'Jessica Martin', 'Matthew Thompson', 'Amanda Garcia', 'Daniel Martinez',
    'Ashley Robinson', 'Joseph Clark', 'Stephanie Rodriguez', 'Richard Lewis', 'Nicole Lee',
    'Charles Walker', 'Samantha Hall', 'Thomas Allen', 'Rachel Young', 'Steven Hernandez',
    'Heather King', 'Paul Wright', 'Melissa Lopez', 'Mark Hill', 'Michelle Scott',
    'Donald Green', 'Kimberly Adams', 'George Baker', 'Amy Gonzalez', 'Kenneth Nelson',
    'Angela Carter', 'Steven Mitchell', 'Brenda Pérez', 'Edward Roberts', 'Pamela Turner',
    'Brian Phillips', 'Emma Campbell', 'Ronald Parker', 'Rebecca Evans', 'Anthony Edwards',
    'Laura Collins', 'Kevin Stewart', 'Cynthia Sánchez', 'Jason Morris', 'Kathleen Rogers'
  ];

  const VENDEDORES = [];
  let vIdx = 0;
  GERENTES.forEach(ger => {
    const numReps = Math.floor(rand() * 2) + 3;
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
          lineaNegocio: ger.lineaNegocio,
          regionId: ger.regionId,
          regionNombre: regionObj.nombre,
          plaza: plaza,
          empujeOnboarding: rand() * 0.4 + 0.6
        });
        vIdx++;
      }
    }
  });

  const BASE_COMPANY_NAMES = [
    'Apex Construction LLC', 'Turner Heavy Infra', 'Skanska USA Built', 'Bechtel Concrete Works',
    'PCL Construction Corp', 'Fluor Industrial Inc', 'Kiewit Infrastructure', 'Walsh Heavy Materials',
    'Balfour Beatty US', 'Gilbane Building Co', 'AECOM Structures', 'Mortenson Construction',
    'Hensel Phelps Builders', 'Clark Construction Group', 'Suffolk Heavy Build', 'Whiting-Turner Co',
    'Granite Construction', 'Structure Tone Global', 'Clayco Commercial Works', 'Sundt Infrastructure',
    'Austin Commercial LLC', 'Webcor Builders', 'McCarthy Building Co', 'Lendlease Americas',
    'DPR Construction', 'Brasfield & Gorrie', 'JE Dunn Construction', 'Rodgers Builders Inc',
    'Robins & Morton', 'Barton Malow Co'
  ];

  const COMPANY_SUFFIXES = ['East Site', 'West Div', 'Metro Project', 'Plant #2', 'Hub', 'Venture', 'Site A', 'South Park'];

  const LINEAS_MAP = {
    readymix: { label: 'Readymix Concrete', unidad: 'cu yd' },
    cemento: { label: 'Bulk Cement', unidad: 'tons' },
    agregados: { label: 'Aggregates & Quarries', unidad: 'tons' }
  };

  const CLIENTES = [];
  let cIdx = 1;

  VENDEDORES.forEach(rep => {
    const numClientes = Math.floor(rand() * 10) + 18;
    const linea = LINEAS_MAP[rep.lineaNegocio] || LINEAS_MAP.readymix;

    for (let i = 0; i < numClientes; i++) {
      const cId = `CLI-${String(cIdx).padStart(5, '0')}`;
      const baseComp = BASE_COMPANY_NAMES[(cIdx - 1) % BASE_COMPANY_NAMES.length];
      const suff = COMPANY_SUFFIXES[Math.floor(rand() * COMPANY_SUFFIXES.length)];
      const nombreEmpresa = `${baseComp} (${suff})`;
      cIdx++;

      const u = rand();
      const isTopPareto = u > 0.80;
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
        nombreEmpresa,
        vendedorId: rep.id,
        gerenteId: rep.gerenteId,
        directorId: rep.directorId,
        vpId: rep.vpId,
        regionId: rep.regionId,
        plaza: rep.plaza,
        lineaNegocio: rep.lineaNegocio,
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

  const BASE_CURVE_24M = [
    0.122, 0.135, 0.118, 0.149, 0.174, 0.162, 0.201, 0.228, 0.215, 0.254, 0.282, 0.269,
    0.312, 0.345, 0.331, 0.386, 0.421, 0.408, 0.465, 0.502, 0.489, 0.541, 0.583, 0.569,
    0.615, 0.648, 0.632, 0.684, 0.721, 0.709, 0.738, 0.754, 0.768, 0.782, 0.795, 0.812
  ];

  const TRANSACCIONES = [];

  MESES.forEach((m, mIdx) => {
    const baseRate = BASE_CURVE_24M[mIdx] || 0.50;

    CLIENTES.forEach(cli => {
      const seasonality = 1 + (Math.sin(m.mesNum * 0.5) * 0.10);
      const volMes = Math.max(10, Math.round(cli.volumenBase * seasonality * (rand() * 0.25 + 0.88)));
      const pedidosTotales = Math.max(1, Math.round((volMes / (cli.isTopPareto ? 160 : 32)) * (rand() * 0.35 + 0.82)));

      let pedidosDigitales = 0;
      let pedidosAnalogos = pedidosTotales;
      let volDigital = 0;
      let volAnalogo = volMes;

      if (cli.estaIncorporado) {
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