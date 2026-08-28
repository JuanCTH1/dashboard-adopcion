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

  // 5 STANDARDIZED GEOGRAPHIC REGIONS PER VP WITH DEDICATED BUSINESS LINE DIRECTORS
  const DIRECTORES = [
    // VP Readymix Concrete Dedicated Regional Directors
    { id: 'dir-rm-east', nombre: 'Atlantic', persona: 'Robert Vance', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-1' },
    { id: 'dir-rm-sunbelt', nombre: 'Sunbelt', persona: 'Elena Rostova', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-2' },
    { id: 'dir-rm-midwest', nombre: 'Midwest', persona: 'Marcus Thorne', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },
    { id: 'dir-rm-mountain', nombre: 'Mountain', persona: 'Jennifer Hayes', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },
    { id: 'dir-rm-pacific', nombre: 'Pacific NW', persona: 'Carlos Mendez', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-4' },

    // VP Bulk Cement Dedicated Regional Directors
    { id: 'dir-cem-atlantic', nombre: 'Atlantic', persona: 'William Baxter', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },
    { id: 'dir-cem-gulf', nombre: 'Sunbelt', persona: 'Patricia Sterling', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-2' },
    { id: 'dir-cem-greatlakes', nombre: 'Midwest', persona: 'Arthur Pendelton', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },
    { id: 'dir-cem-plains', nombre: 'Mountain', persona: 'Karen O\'Connor', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-3' },
    { id: 'dir-cem-northwest', nombre: 'Pacific NW', persona: 'Daniel Kim', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-4' },

    // VP Quarries & Aggregates Dedicated Regional Directors
    { id: 'dir-agg-northeast', nombre: 'Atlantic', persona: 'George Hamilton', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-1' },
    { id: 'dir-agg-southeast', nombre: 'Sunbelt', persona: 'Sandra Bullock', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },
    { id: 'dir-agg-central', nombre: 'Midwest', persona: 'Richard Gere', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-3' },
    { id: 'dir-agg-texas', nombre: 'Mountain', persona: 'Charles Walker', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },
    { id: 'dir-agg-westcoast', nombre: 'Pacific NW', persona: 'Victoria Beckham', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-4' }
  ];

  // STANDARDIZED PHYSICAL MARKETS WITH DEDICATED BUSINESS LINE MANAGERS
  const GERENTES = [
    // Readymix Dedicated Managers
    { id: 'ger-1', nombre: 'New York', persona: 'Kevin Stewart', directorId: 'dir-rm-east', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-1' },
    { id: 'ger-2', nombre: 'Boston', persona: 'Amanda Garcia', directorId: 'dir-rm-east', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-1' },
    { id: 'ger-3', nombre: 'Dallas', persona: 'Christopher Harris', directorId: 'dir-rm-sunbelt', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-2' },
    { id: 'ger-4', nombre: 'Houston', persona: 'Stephanie Rodriguez', directorId: 'dir-rm-sunbelt', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-2' },
    { id: 'ger-5', nombre: 'Chicago', persona: 'Matthew Thompson', directorId: 'dir-rm-midwest', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },
    { id: 'ger-6', nombre: 'St. Louis', persona: 'Nicole Lee', directorId: 'dir-rm-midwest', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },
    { id: 'ger-7', nombre: 'Denver', persona: 'Steven Hernandez', directorId: 'dir-rm-mountain', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },
    { id: 'ger-8', nombre: 'Salt Lake', persona: 'Rachel Young', directorId: 'dir-rm-mountain', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },
    { id: 'ger-9', nombre: 'Los Angeles', persona: 'Ashley Robinson', directorId: 'dir-rm-pacific', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-4' },
    { id: 'ger-10', nombre: 'Phoenix', persona: 'Joseph Clark', directorId: 'dir-rm-pacific', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-4' },

    // Cement Dedicated Managers (Same physical markets, dedicated Cement Managers)
    { id: 'ger-11', nombre: 'New York', persona: 'Paul Wright', directorId: 'dir-cem-atlantic', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },
    { id: 'ger-12', nombre: 'Boston', persona: 'Melissa Lopez', directorId: 'dir-cem-atlantic', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },
    { id: 'ger-13', nombre: 'Dallas', persona: 'Mark Hill', directorId: 'dir-cem-gulf', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-2' },
    { id: 'ger-14', nombre: 'Houston', persona: 'Michelle Scott', directorId: 'dir-cem-gulf', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-2' },
    { id: 'ger-15', nombre: 'Chicago', persona: 'Donald Green', directorId: 'dir-cem-greatlakes', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },
    { id: 'ger-16', nombre: 'St. Louis', persona: 'Kimberly Adams', directorId: 'dir-cem-greatlakes', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },
    { id: 'ger-17', nombre: 'Denver', persona: 'George Baker', directorId: 'dir-cem-plains', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-3' },
    { id: 'ger-18', nombre: 'Salt Lake', persona: 'Amy Gonzalez', directorId: 'dir-cem-plains', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-3' },
    { id: 'ger-19', nombre: 'Los Angeles', persona: 'Kenneth Nelson', directorId: 'dir-cem-northwest', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-4' },
    { id: 'ger-20', nombre: 'Phoenix', persona: 'Angela Carter', directorId: 'dir-cem-northwest', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-4' },

    // Aggregates Dedicated Managers (Same physical markets, dedicated Aggregates Managers)
    { id: 'ger-21', nombre: 'New York', persona: 'Steven Mitchell', directorId: 'dir-agg-northeast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-1' },
    { id: 'ger-22', nombre: 'Boston', persona: 'Edward Roberts', directorId: 'dir-agg-northeast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-1' },
    { id: 'ger-23', nombre: 'Dallas', persona: 'Pamela Turner', directorId: 'dir-agg-southeast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },
    { id: 'ger-24', nombre: 'Houston', persona: 'Brian Phillips', directorId: 'dir-agg-southeast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },
    { id: 'ger-25', nombre: 'Chicago', persona: 'Emma Campbell', directorId: 'dir-agg-central', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-3' },
    { id: 'ger-26', nombre: 'St. Louis', persona: 'Ronald Parker', directorId: 'dir-agg-central', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-3' },
    { id: 'ger-27', nombre: 'Denver', persona: 'Rebecca Evans', directorId: 'dir-agg-texas', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },
    { id: 'ger-28', nombre: 'Salt Lake', persona: 'Anthony Edwards', directorId: 'dir-agg-texas', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },
    { id: 'ger-29', nombre: 'Los Angeles', persona: 'Laura Collins', directorId: 'dir-agg-westcoast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-4' },
    { id: 'ger-30', nombre: 'Phoenix', persona: 'Cynthia Sánchez', directorId: 'dir-agg-westcoast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-4' }
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
    const numReps = 5; // EXACTLY 5 Sales Reps per Market Manager
    const regionObj = REGIONES.find(r => r.id === ger.regionId);
    for (let i = 0; i < numReps; i++) {
      const nameIndex = (vIdx % NOMBRES_VENDEDORES.length);
      const nameSuffix = Math.floor(vIdx / NOMBRES_VENDEDORES.length) > 0 ? ` Jr.` : '';
      const repName = `${NOMBRES_VENDEDORES[nameIndex]}${nameSuffix}`;
      VENDEDORES.push({
        id: `rep-${vIdx + 1}`,
        nombre: repName,
        gerenteId: ger.id,
        directorId: ger.directorId,
        vpId: ger.vpId,
        lineaNegocio: ger.lineaNegocio,
        regionId: ger.regionId,
        regionNombre: regionObj?.nombre || 'USA National',
        plaza: ger.nombre, // Physical market city name
        empujeOnboarding: rand() * 0.4 + 0.6
      });
      vIdx++;
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
      const basePropensity = rand() * 0.45 + 0.45;
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
        regionNombre: rep.regionNombre,
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
        basePropensity,
        digitalShare,
        canalPreferido
      });
    }
  });

  const BASE_CURVE_36M = [
    // 2024: ~22% to ~45% with realistic peaks, dips & weather seasonality
    0.22, 0.28, 0.21, 0.33, 0.41, 0.36, 0.43, 0.47, 0.39, 0.45, 0.41, 0.32,
    // 2025: ~38% to ~63% with realistic peaks, dips & weather seasonality
    0.38, 0.46, 0.41, 0.54, 0.63, 0.56, 0.65, 0.69, 0.60, 0.67, 0.62, 0.51,
    // 2026: ~53% to ~86% with realistic peaks, dips & weather seasonality
    0.53, 0.61, 0.57, 0.71, 0.79, 0.74, 0.81, 0.86, 0.78, 0.84, 0.81, 0.73
  ];

  // Distinct monthly market shifts per Business Line (e.g. Ready Mix weather/jobsite shocks)
  const BL_MONTHLY_SHIFTS = {
    readymix: [
      -0.08,  0.06, -0.12,  0.08,  0.15, -0.05,  0.09, -0.04,  0.11, -0.08,  0.04, -0.14,
      -0.10,  0.07, -0.14,  0.11,  0.18, -0.08,  0.12, -0.06,  0.14, -0.09,  0.06, -0.16,
      -0.12,  0.08, -0.15,  0.12,  0.19, -0.09,  0.14, -0.07,  0.15, -0.10,  0.07, -0.18
    ],
    cemento: [
       0.05, -0.07,  0.09, -0.04,  0.08,  0.07, -0.06,  0.10, -0.05,  0.08, -0.06,  0.04,
       0.06, -0.09,  0.11, -0.06,  0.10,  0.08, -0.08,  0.12, -0.07,  0.10, -0.08,  0.05,
       0.07, -0.10,  0.12, -0.07,  0.12,  0.09, -0.09,  0.14, -0.08,  0.11, -0.09,  0.06
    ],
    agregados: [
      -0.04, -0.08,  0.14, -0.09,  0.06,  0.11, -0.12,  0.07, -0.08,  0.13, -0.07, -0.06,
      -0.06, -0.10,  0.16, -0.11,  0.08,  0.13, -0.14,  0.09, -0.10,  0.15, -0.09, -0.08,
      -0.07, -0.11,  0.18, -0.12,  0.10,  0.15, -0.15,  0.11, -0.11,  0.17, -0.10, -0.09
    ]
  };

  const TRANSACCIONES = [];

  MESES.forEach((m, mIdx) => {
    const baseRate = BASE_CURVE_36M[mIdx] || 0.55;

    CLIENTES.forEach(cli => {
      const blShifts = BL_MONTHLY_SHIFTS[cli.lineaNegocio] || [];
      const blShift = blShifts[mIdx] || 0;

      const seasonality = 1 + (Math.sin(m.mesNum * 0.5) * 0.10);
      const volMes = Math.max(10, Math.round(cli.volumenBase * seasonality * (rand() * 0.25 + 0.88)));
      const pedidosTotales = Math.max(1, Math.round((volMes / (cli.isTopPareto ? 160 : 32)) * (rand() * 0.35 + 0.82)));

      let pedidosDigitales = 0;
      let pedidosAnalogos = pedidosTotales;
      let volDigital = 0;
      let volAnalogo = volMes;

      if (cli.estaIncorporado && cli.esActivo) {
        // High realistic monthly volatility per client + business line monthly macro shift
        const clientVolatility = (rand() - 0.5) * 0.35;
        const targetRate = baseRate + blShift;
        const clientAdoptionRate = Math.min(0.96, Math.max(0.12, (targetRate * 0.50) + (cli.basePropensity * 0.50) + clientVolatility));

        pedidosDigitales = Math.round(pedidosTotales * clientAdoptionRate);
        if (pedidosDigitales > pedidosTotales) pedidosDigitales = pedidosTotales;
        if (pedidosDigitales === 0 && pedidosTotales > 0) pedidosDigitales = 1;
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