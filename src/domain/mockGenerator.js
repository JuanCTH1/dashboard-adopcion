/**
 * DETERMINISTIC SYNTHETIC DATA GENERATOR FOR CX ADOPTION - 5 REGIONS PER VP (100% ENGLISH)
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
    { id: 'vp-readymix', nombre: 'Readymix Concrete', persona: 'Sarah Jenkins', lineaNegocio: 'readymix', unidad: 'cu yd' },
    { id: 'vp-cemento', nombre: 'Bulk Cement', persona: 'Michael Chang', lineaNegocio: 'cemento', unidad: 'tons' },
    { id: 'vp-agregados', nombre: 'Quarries & Aggregates', persona: 'David Miller', lineaNegocio: 'agregados', unidad: 'tons' }
  ];

  // EXACTLY 5 REGIONAL DIRECTORS PER VP DIVISION WITH REALISTIC PERSONA NAMES
  const DIRECTORES = [
    // 5 Regions for VP Readymix Concrete
    { id: 'dir-rm-east', nombre: 'Atlantic', persona: 'Robert Vance', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-1' },
    { id: 'dir-rm-sunbelt', nombre: 'Sunbelt', persona: 'Elena Rostova', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-2' },
    { id: 'dir-rm-midwest', nombre: 'Midwest', persona: 'Marcus Thorne', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },
    { id: 'dir-rm-mountain', nombre: 'Mountain', persona: 'Jennifer Hayes', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },
    { id: 'dir-rm-pacific', nombre: 'Pacific', persona: 'Carlos Mendez', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-4' },

    // 5 Regions for VP Bulk Cement
    { id: 'dir-cem-atlantic', nombre: 'Atlantic', persona: 'William Baxter', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },
    { id: 'dir-cem-gulf', nombre: 'Gulf Coast', persona: 'Patricia Sterling', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-2' },
    { id: 'dir-cem-greatlakes', nombre: 'Great Lakes', persona: 'Arthur Pendelton', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },
    { id: 'dir-cem-plains', nombre: 'Central Plains', persona: 'Karen O\'Connor', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-3' },
    { id: 'dir-cem-northwest', nombre: 'Pacific NW', persona: 'Daniel Kim', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-4' },

    // 5 Regions for VP Quarries & Aggregates
    { id: 'dir-agg-northeast', nombre: 'Northeast', persona: 'George Hamilton', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-1' },
    { id: 'dir-agg-southeast', nombre: 'Southeast', persona: 'Sandra Bullock', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },
    { id: 'dir-agg-central', nombre: 'Central', persona: 'Richard Gere', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-3' },
    { id: 'dir-agg-texas', nombre: 'Texas', persona: 'Charles Walker', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },
    { id: 'dir-agg-westcoast', nombre: 'West Coast', persona: 'Victoria Beckham', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-4' }
  ];

  const GERENTES = [
    // Readymix Atlantic
    { id: 'ger-1', nombre: 'New York', persona: 'Kevin Stewart', directorId: 'dir-rm-east', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-1' },
    { id: 'ger-2', nombre: 'Boston', persona: 'Amanda Garcia', directorId: 'dir-rm-east', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-1' },

    // Readymix Sunbelt
    { id: 'ger-3', nombre: 'Dallas', persona: 'Christopher Harris', directorId: 'dir-rm-sunbelt', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-2' },
    { id: 'ger-4', nombre: 'Houston', persona: 'Stephanie Rodriguez', directorId: 'dir-rm-sunbelt', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-2' },

    // Readymix Midwest
    { id: 'ger-5', nombre: 'Chicago', persona: 'Matthew Thompson', directorId: 'dir-rm-midwest', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },
    { id: 'ger-6', nombre: 'St. Louis', persona: 'Nicole Lee', directorId: 'dir-rm-midwest', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },

    // Readymix Mountain
    { id: 'ger-7', nombre: 'Denver', persona: 'Steven Hernandez', directorId: 'dir-rm-mountain', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },
    { id: 'ger-8', nombre: 'Salt Lake', persona: 'Rachel Young', directorId: 'dir-rm-mountain', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },

    // Readymix Pacific
    { id: 'ger-9', nombre: 'Los Angeles', persona: 'Ashley Robinson', directorId: 'dir-rm-pacific', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-4' },
    { id: 'ger-10', nombre: 'Phoenix', persona: 'Joseph Clark', directorId: 'dir-rm-pacific', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-4' },

    // Cement Atlantic
    { id: 'ger-11', nombre: 'Philadelphia', persona: 'Paul Wright', directorId: 'dir-cem-atlantic', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },
    { id: 'ger-12', nombre: 'Baltimore', persona: 'Melissa Lopez', directorId: 'dir-cem-atlantic', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },

    // Cement Gulf
    { id: 'ger-13', nombre: 'New Orleans', persona: 'Mark Hill', directorId: 'dir-cem-gulf', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-2' },
    { id: 'ger-14', nombre: 'Tampa', persona: 'Michelle Scott', directorId: 'dir-cem-gulf', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-2' },

    // Cement Great Lakes
    { id: 'ger-15', nombre: 'Detroit', persona: 'Donald Green', directorId: 'dir-cem-greatlakes', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },
    { id: 'ger-16', nombre: 'Cleveland', persona: 'Kimberly Adams', directorId: 'dir-cem-greatlakes', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },

    // Cement Central Plains
    { id: 'ger-17', nombre: 'Kansas City', persona: 'George Baker', directorId: 'dir-cem-plains', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-3' },
    { id: 'ger-18', nombre: 'Omaha', persona: 'Amy Gonzalez', directorId: 'dir-cem-plains', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-3' },

    // Cement Pacific NW
    { id: 'ger-19', nombre: 'Seattle', persona: 'Kenneth Nelson', directorId: 'dir-cem-northwest', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-4' },
    { id: 'ger-20', nombre: 'Portland', persona: 'Angela Carter', directorId: 'dir-cem-northwest', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-4' },

    // Aggregates Northeast
    { id: 'ger-21', nombre: 'Pittsburgh', persona: 'Steven Mitchell', directorId: 'dir-agg-northeast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-1' },
    { id: 'ger-22', nombre: 'Harrisburg', persona: 'Edward Roberts', directorId: 'dir-agg-northeast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-1' },

    // Aggregates Southeast
    { id: 'ger-23', nombre: 'Atlanta', persona: 'Pamela Turner', directorId: 'dir-agg-southeast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },
    { id: 'ger-24', nombre: 'Charlotte', persona: 'Brian Phillips', directorId: 'dir-agg-southeast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },

    // Aggregates Central
    { id: 'ger-25', nombre: 'Indianapolis', persona: 'Emma Campbell', directorId: 'dir-agg-central', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-3' },
    { id: 'ger-26', nombre: 'Columbus', persona: 'Ronald Parker', directorId: 'dir-agg-central', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-3' },

    // Aggregates Texas
    { id: 'ger-27', nombre: 'Austin', persona: 'Rebecca Evans', directorId: 'dir-agg-texas', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },
    { id: 'ger-28', nombre: 'San Antonio', persona: 'Anthony Edwards', directorId: 'dir-agg-texas', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },

    // Aggregates West Coast
    { id: 'ger-29', nombre: 'San Francisco', persona: 'Laura Collins', directorId: 'dir-agg-westcoast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-4' },
    { id: 'ger-30', nombre: 'San Diego', persona: 'Cynthia Sánchez', directorId: 'dir-agg-westcoast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-4' }
  ];

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
    'Laura Collins', 'Kevin Stewart', 'Cynthia Sánchez', 'Jason Morris', 'Kathleen Rogers',
    'Gary Reed', 'Timothy Cook', 'Frank Morgan', 'Shirley Bell', 'Sharon Murphy'
  ];

  const VENDEDORES = [];
  let vIdx = 0;
  GERENTES.forEach(ger => {
    const numReps = 2;
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
    const numClientes = Math.floor(rand() * 6) + 12;
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