/**
 * DETERMINISTIC SYNTHETIC DATA GENERATOR FOR CX ADOPTION
 * Comprehensive Commercial Lifecycle Engine (36 Months: 2024 - 2026)
 *
 * v2: Realistic hierarchy scale, orders-driven Pareto (client-level, long-tail
 * order frequency), individual adoption ceilings (<=90%), and a correlated
 * market-month random-walk so adoption growth is organic instead of a smooth
 * synchronized ramp.
 */

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Standard normal via Box-Muller, driven by the same seeded rand() stream.
function gaussian(rand) {
  const u1 = Math.max(rand(), 1e-9);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function lognormal(rand, mu, sigma) {
  return Math.exp(mu + sigma * gaussian(rand));
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

// Fisher-Yates shuffle driven by the seeded rand() stream (keeps determinism).
function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function weightedPick(rand, options, weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rand() * total;
  for (let i = 0; i < options.length; i++) {
    r -= weights[i];
    if (r <= 0) return options[i];
  }
  return options[options.length - 1];
}

export function generateDataset(seed = 20260828) {
  const rand = mulberry32(seed);

  // 1. TIMELINE DEFINITIONS (36 Months: 2024-01 to 2026-12)
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
  const periodoActualIdx = MESES.findIndex(m => m.key === periodoActual);

  // 2. GEOGRAPHIC REGIONS & MARKETS
  // Tier: 5 = megamarket, 1 = small regional hub. Loosely mirrors real US metro scale.
  const REGION_CITY_TIERS = {
    'Atlantic': [
      ['New York', 5], ['Philadelphia', 4], ['Boston', 4], ['Newark', 3],
      ['Pittsburgh', 3], ['Baltimore', 3], ['Providence', 2], ['Hartford', 2],
      ['Albany', 2], ['Buffalo', 2], ['Portland (ME)', 1], ['Burlington', 1]
    ],
    'Sunbelt': [
      ['Dallas', 5], ['Houston', 5], ['Atlanta', 4], ['Miami', 4],
      ['Charlotte', 3], ['Nashville', 3], ['Austin', 3], ['San Antonio', 3],
      ['Orlando', 2], ['Tampa', 2], ['Memphis', 2], ['Birmingham', 1]
    ],
    'Midwest': [
      ['Chicago', 5], ['Detroit', 4], ['Columbus', 4], ['Indianapolis', 3],
      ['Milwaukee', 3], ['St. Louis', 3], ['Kansas City', 3], ['Minneapolis', 3],
      ['Cincinnati', 2], ['Cleveland', 2], ['Omaha', 1], ['Des Moines', 1]
    ],
    'West': [
      ['Los Angeles', 5], ['Phoenix', 4], ['Denver', 4], ['Seattle', 4],
      ['Las Vegas', 3], ['Salt Lake', 3], ['San Diego', 3], ['Portland (OR)', 3],
      ['Sacramento', 2], ['Albuquerque', 2], ['Boise', 1], ['Tucson', 1]
    ]
  };

  const REGIONES = Object.keys(REGION_CITY_TIERS).map((nombre, idx) => ({
    id: `reg-${idx + 1}`,
    nombre,
    plazas: REGION_CITY_TIERS[nombre].map(([city]) => city)
  }));

  const TIER_SPECS = {
    5: { repRange: [8, 10], freqMult: 1.55, adoptionPace: 0.045 },
    4: { repRange: [6, 8], freqMult: 1.30, adoptionPace: 0.030 },
    3: { repRange: [4, 6], freqMult: 1.05, adoptionPace: 0.010 },
    2: { repRange: [3, 5], freqMult: 0.90, adoptionPace: -0.010 },
    1: { repRange: [3, 4], freqMult: 0.75, adoptionPace: -0.025 }
  };

  const MARKET_TIERS = {};
  REGIONES.forEach(r => {
    REGION_CITY_TIERS[r.nombre].forEach(([city, tier]) => {
      MARKET_TIERS[city] = { tier, ...TIER_SPECS[tier] };
    });
  });

  // 3. BUSINESS LINES
  const VPS = [
    { id: 'vp-readymix', nombre: 'Readymix', persona: 'Sarah Jenkins', lineaNegocio: 'readymix', unidad: 'cu yd' },
    { id: 'vp-cemento', nombre: 'Cement', persona: 'Michael Chang', lineaNegocio: 'cemento', unidad: 'tons' },
    { id: 'vp-agregados', nombre: 'Aggregates', persona: 'David Miller', lineaNegocio: 'agregados', unidad: 'tons' }
  ];

  // Order-frequency (per week) & behavioral traits per business line.
  const LINEAS_CONFIG = {
    readymix: {
      label: 'Readymix', unidad: 'cu yd',
      clientDensity: [7, 13], freqMu: Math.log(1.2), freqSigma: 1.55,
      avgOrderSize: 18, channelMix: { web: 0.50, app: 0.42, edi: 0.08 }
    },
    cemento: {
      label: 'Cement', unidad: 'tons',
      clientDensity: [4, 8], freqMu: Math.log(0.42), freqSigma: 1.45,
      avgOrderSize: 220, channelMix: { web: 0.35, app: 0.12, edi: 0.53 }
    },
    agregados: {
      label: 'Aggregates', unidad: 'tons',
      clientDensity: [6, 11], freqMu: Math.log(0.80), freqSigma: 1.50,
      avgOrderSize: 45, channelMix: { web: 0.52, app: 0.33, edi: 0.15 }
    }
  };

  // 4. NAME POOLS (large enough that directors + managers + reps never repeat)
  const FIRST_NAMES = [
    'James', 'Maria', 'Robert', 'Linda', 'Michael', 'Elena', 'William', 'Jennifer',
    'David', 'Patricia', 'Carlos', 'Susan', 'Daniel', 'Karen', 'Matthew', 'Nancy',
    'Anthony', 'Sofia', 'Mark', 'Rebecca', 'Steven', 'Laura', 'Paul', 'Michelle',
    'Andrew', 'Amanda', 'Joshua', 'Melissa', 'Kevin', 'Stephanie', 'Brian', 'Angela',
    'George', 'Rachel', 'Edward', 'Samantha', 'Ronald', 'Kimberly', 'Timothy', 'Emily',
    'Jason', 'Nicole', 'Jeffrey', 'Heather', 'Ryan', 'Cynthia', 'Jacob', 'Amy',
    'Gary', 'Katherine', 'Nathan', 'Christina', 'Eric', 'Diana', 'Stephen', 'Julia',
    'Larry', 'Victoria', 'Justin', 'Gloria', 'Scott', 'Teresa', 'Brandon', 'Sara',
    'Benjamin', 'Janet', 'Samuel', 'Rosa', 'Gregory', 'Alicia', 'Alexander', 'Jasmine',
    'Frank', 'Brenda', 'Raymond', 'Pamela', 'Jack', 'Debra', 'Dennis', 'Sharon'
  ];
  const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
    'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris',
    'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen',
    'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
    'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter',
    'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz',
    'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook'
  ];

  const namePool = [];
  FIRST_NAMES.forEach(f => LAST_NAMES.forEach(l => namePool.push(`${f} ${l}`)));
  const shuffledNames = shuffle(namePool, rand);
  let nameCursor = 0;
  const nextPersonaName = () => shuffledNames[nameCursor++ % shuffledNames.length];

  // 5. HIERARCHY: DIRECTORS (per region x BL), MANAGERS (per market x BL)
  const DIRECTORES = [];
  REGIONES.forEach(region => {
    VPS.forEach(vp => {
      DIRECTORES.push({
        id: `dir-${region.id}-${vp.lineaNegocio}`,
        nombre: region.nombre,
        persona: nextPersonaName(),
        vpId: vp.id,
        lineaNegocio: vp.lineaNegocio,
        regionId: region.id
      });
    });
  });

  const GERENTES = [];
  REGIONES.forEach(region => {
    REGION_CITY_TIERS[region.nombre].forEach(([city]) => {
      VPS.forEach(vp => {
        const dir = DIRECTORES.find(d => d.regionId === region.id && d.vpId === vp.id);
        GERENTES.push({
          id: `ger-${city.replace(/[^a-zA-Z]/g, '')}-${vp.lineaNegocio}`,
          nombre: city,
          persona: nextPersonaName(),
          directorId: dir.id,
          vpId: vp.id,
          lineaNegocio: vp.lineaNegocio,
          regionId: region.id,
          regionNombre: region.nombre
        });
      });
    });
  });

  // 6. 5 COMMERCIAL ARCHETYPES (weighted, non-uniform assignment)
  const REP_ARCHETYPES = [
    { type: 'Onboarder', onboardingTarget: 0.95, activeConversionTarget: 0.74, adoptionTarget: 0.58, weight: 25 },
    { type: 'DigitalChampion', onboardingTarget: 0.76, activeConversionTarget: 0.94, adoptionTarget: 0.87, weight: 15 },
    { type: 'ActiveConverter', onboardingTarget: 0.80, activeConversionTarget: 0.90, adoptionTarget: 0.80, weight: 28 },
    { type: 'Traditionalist', onboardingTarget: 0.60, activeConversionTarget: 0.68, adoptionTarget: 0.50, weight: 20 },
    { type: 'HighAdopter', onboardingTarget: 0.93, activeConversionTarget: 0.92, adoptionTarget: 0.85, weight: 12 }
  ];
  const archetypeOptions = REP_ARCHETYPES;
  const archetypeWeights = REP_ARCHETYPES.map(a => a.weight);

  // 7. SALES REPS (variable per market by tier: small markets 3-4, megamarkets 8-10)
  const VENDEDORES = [];
  let vIdx = 0;
  GERENTES.forEach(ger => {
    const marketTier = MARKET_TIERS[ger.nombre];
    const [repMin, repMax] = marketTier.repRange;
    const numReps = repMin + Math.floor(rand() * (repMax - repMin + 1));

    for (let i = 0; i < numReps; i++) {
      const profile = weightedPick(rand, archetypeOptions, archetypeWeights);
      vIdx++;
      VENDEDORES.push({
        id: `rep-${vIdx}`,
        nombre: nextPersonaName(),
        gerenteId: ger.id,
        directorId: ger.directorId,
        vpId: ger.vpId,
        lineaNegocio: ger.lineaNegocio,
        regionId: ger.regionId,
        regionNombre: ger.regionNombre,
        plaza: ger.nombre,
        marketTier: marketTier.tier,
        marketPace: marketTier.adoptionPace,
        freqMult: marketTier.freqMult,
        profile
      });
    }
  });

  // 8. CUSTOMER ACCOUNTS
  // Accounts never "die" — they persist for the full horizon. What varies is how
  // often each one orders (order frequency, long-tailed) and how far its digital
  // adoption can climb (an individual ceiling, always < 100%).
  const BASE_COMPANY_NAMES = [
    'Apex Construction', 'Turner Heavy Infra', 'Skanska Built Works', 'Bechtel Concrete',
    'PCL Construction', 'Fluor Industrial', 'Kiewit Infrastructure', 'Walsh Heavy Materials',
    'Balfour Beatty', 'Gilbane Building Co', 'AECOM Structures', 'Mortenson Construction',
    'Hensel Phelps', 'Clark Construction Group', 'Suffolk Heavy Build', 'Whiting-Turner Co',
    'Granite Construction', 'Structure Tone', 'Clayco Commercial', 'Sundt Infrastructure',
    'Austin Commercial', 'Webcor Builders', 'McCarthy Building Co', 'Lendlease Americas',
    'DPR Construction', 'Brasfield & Gorrie', 'JE Dunn Construction', 'Rodgers Builders',
    'Robins & Morton', 'Barton Malow Co', 'Swinerton Builders', 'Sundt Metro',
    'Flatiron Constructors', 'Archer Western', 'Traylor Bros Heavy', 'Lane Construction',
    'Ridgeline Contractors', 'Cornerstone Civil Works', 'Summit Grading Co', 'Ironclad Builders',
    'Vantage Site Works', 'Pinnacle Infrastructure', 'Meridian Heavy Civil', 'Redstone Contracting',
    'Harbor Point Builders', 'Keystone Paving Group', 'Northgate Construction', 'Bluepeak Civil',
    'Anchor Concrete Works', 'Foundry Street Builders'
  ];

  const COMPANY_SUFFIXES = [
    'East Site', 'West Div', 'Metro Project', 'Plant #2', 'Hub', 'Venture', 'Site A', 'South Park',
    'North Terminal', 'Central Plant', 'Highway Div', 'Industrial Yard', 'Bay Area Site', 'Downtown Highrise',
    'Site B', 'Logistics Yard', 'Distribution Hub', 'Corridor Project', 'Riverside Site', 'Overpass Div'
  ];

  const CLIENTES = [];
  let cIdx = 1;

  VENDEDORES.forEach(rep => {
    const blCfg = LINEAS_CONFIG[rep.lineaNegocio];
    const [densMin, densMax] = blCfg.clientDensity;
    const numClientes = densMin + Math.floor(rand() * (densMax - densMin + 1));
    const p = rep.profile;

    for (let i = 0; i < numClientes; i++) {
      const cId = `CLI-${String(cIdx).padStart(5, '0')}`;
      const baseComp = BASE_COMPANY_NAMES[Math.floor(rand() * BASE_COMPANY_NAMES.length)];
      const suff = COMPANY_SUFFIXES[Math.floor(rand() * COMPANY_SUFFIXES.length)];
      const nombreEmpresa = `${baseComp} — ${rep.plaza} ${suff}`;
      cIdx++;

      // LONG-TAIL ORDER FREQUENCY (per week): this is the real Pareto driver.
      // Most clients sit low (finishing small jobs), a long tail of "whales"
      // orders daily-plus.
      const weeklyOrderFreq = clamp(
        lognormal(rand, blCfg.freqMu, blCfg.freqSigma) * rep.freqMult,
        0.35, 26
      );

      // CLIENT LIFECYCLE ONBOARDING STATE MACHINE
      const clientOnboardPropensity = clamp(p.onboardingTarget + ((rand() - 0.5) * 0.18), 0.20, 0.98);
      const everOnboards = rand() < clientOnboardPropensity;

      let onboardingMonthIndex = null;
      if (everOnboards) {
        const cohortRand = rand();
        if (cohortRand < 0.40) {
          onboardingMonthIndex = Math.floor(rand() * 12);
        } else if (cohortRand < 0.78) {
          onboardingMonthIndex = 12 + Math.floor(rand() * 12);
        } else {
          onboardingMonthIndex = 24 + Math.floor(rand() * 10);
        }
      }

      const fttv = everOnboards ? Math.floor(rand() * 24) + 3 : null;

      // INDIVIDUAL ADOPTION CEILING — nobody reaches 100%. Best-in-class
      // accounts top out around 85-90%; most sit well below that.
      const adoptionCeiling = clamp(
        p.adoptionTarget * 0.92 + rep.marketPace + ((rand() - 0.5) * 0.20),
        0.15, 0.90
      );

      const cMix = blCfg.channelMix;
      const cRand = rand();
      let canalPreferido = 'web';
      if (cRand < cMix.web) canalPreferido = 'web';
      else if (cRand < cMix.web + cMix.app) canalPreferido = 'app';
      else canalPreferido = 'edi';

      const estaIncorporadoActual = onboardingMonthIndex !== null && onboardingMonthIndex <= periodoActualIdx;
      const esActivoActual = estaIncorporadoActual && (rand() < (p.activeConversionTarget * 0.9));
      const esRevertidoActual = estaIncorporadoActual && !esActivoActual;

      // volumenBase kept only as a secondary, derived display figure (orders
      // are the real unit of analysis now) — proportional to order frequency
      // so it doesn't fight the Pareto distribution that matters.
      const volumenBase = Math.round(weeklyOrderFreq * 52 * blCfg.avgOrderSize * (0.85 + rand() * 0.3));

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
        lineaLabel: blCfg.label,
        unidad: blCfg.unidad,
        weeklyOrderFreq,
        volumenBase,
        isTopPareto: false, // computed below once global freq distribution is known
        esTopPareto: false,
        onboardingMonthIndex,
        estaIncorporado: estaIncorporadoActual,
        esActivo: esActivoActual,
        esRevertido: esRevertidoActual,
        fttv,
        adoptionCeiling,
        basePropensity: adoptionCeiling,
        digitalShare: esActivoActual ? adoptionCeiling : 0,
        canalPreferido,
        profile: p,
        marketPace: rep.marketPace,
        _adopt: null // running random-walk state, mutated during transaction generation
      });
    }
  });

  // Mark top-20%-by-order-frequency clients (this is what should carry ~75-80%
  // of total orders once transactions are summed).
  const freqSorted = [...CLIENTES].sort((a, b) => b.weeklyOrderFreq - a.weeklyOrderFreq);
  const top20Count = Math.round(freqSorted.length * 0.20);
  const top20Ids = new Set(freqSorted.slice(0, top20Count).map(c => c.id));
  CLIENTES.forEach(c => {
    c.isTopPareto = top20Ids.has(c.id);
    c.esTopPareto = c.isTopPareto;
  });

  // 9. 36-MONTH TRANSACTION GENERATION
  // Growth over the horizon is emergent, not a scripted curve:
  //  - more accounts onboard/activate as months pass (cohort ramp, above)
  //  - each active client's adoption rate follows a bounded random walk with a
  //    small positive drift + reversion toward its own ceiling
  //  - every (market, month) pair gets a SHARED shock so dips/spikes show up
  //    at the market level instead of averaging away across thousands of
  //    independent clients
  const TRANSACCIONES = [];
  const plazas = REGIONES.flatMap(r => r.plazas);

  MESES.forEach((m, mIdx) => {
    const seasonality = 1 + (Math.sin((m.mesNum - 2) * 0.52) * 0.10);
    const globalDrift = 0.014 - (mIdx / 35) * 0.007; // ~0.014 early -> ~0.007 late

    // Company-wide monthly shock: hits every client the same month, on top of
    // the local market shock below. Without this, aggregating dozens of
    // markets averages the local noise away and the NATIONAL line looks
    // suspiciously smooth/linear even though individual markets wobble —
    // exactly the "se promedia todo" problem, one level up. A bad quarter,
    // a platform outage, a slow holiday stretch — some months the whole
    // company dips together, not just one market.
    const nationalRoll = rand();
    let nationalShock;
    if (nationalRoll < 0.15) nationalShock = -(0.035 + rand() * 0.06);      // company-wide bad month
    else if (nationalRoll > 0.90) nationalShock = (0.02 + rand() * 0.035); // company-wide good month
    else nationalShock = (rand() - 0.5) * 0.01;

    // Shared market-month shock: this is what lets a single market visibly
    // dip or spike in a given month without the aggregate averaging it out.
    const marketShock = new Map();
    plazas.forEach(plaza => {
      const roll = rand();
      let shock;
      if (roll < 0.12) shock = -(0.06 + rand() * 0.09);       // bad month
      else if (roll > 0.94) shock = (0.03 + rand() * 0.06);   // good month
      else shock = (rand() - 0.5) * 0.02;                     // ambient noise
      marketShock.set(plaza, shock);
    });

    CLIENTES.forEach(cli => {
      const estaIncorporadoMes = (cli.onboardingMonthIndex !== null) && (mIdx >= cli.onboardingMonthIndex);

      let esActivoMes = false;
      let esRevertidoMes = false;
      if (estaIncorporadoMes) {
        const activeTarget = clamp(cli.profile.activeConversionTarget + ((rand() - 0.5) * 0.16), 0.20, 0.96);
        esActivoMes = rand() < activeTarget;
        esRevertidoMes = !esActivoMes;
      }

      // Orders this month: weekly frequency * ~4.345 weeks, with organic jitter.
      const weeksInMonth = 4.345;
      const rawOrders = cli.weeklyOrderFreq * weeksInMonth * seasonality * (rand() * 0.30 + 0.85);
      const pedidosTotales = Math.max(1, Math.round(rawOrders));

      let pedidosDigitales = 0;
      let pedidosAnalogos = pedidosTotales;
      let volDigital = 0;
      let volAnalogo = cli.volumenBase;

      if (estaIncorporadoMes && esActivoMes) {
        if (cli._adopt === null) {
          // Adopters ramp up fast once they start (matches the fttv concept:
          // most value is realized within the first few weeks/months).
          cli._adopt = cli.adoptionCeiling * (0.40 + rand() * 0.15);
        }
        const shock = nationalShock + (marketShock.get(cli.plaza) || 0);
        const noise = gaussian(rand) * 0.035;
        // Fast reversion toward (near) their own ceiling: ~3-4 month half-life,
        // so adoption plateaus near the ceiling instead of crawling toward it
        // over the full 3-year horizon.
        const reversion = (cli.adoptionCeiling * 0.95 - cli._adopt) * 0.22;
        cli._adopt = clamp(cli._adopt + globalDrift + noise + shock + reversion, 0.05, cli.adoptionCeiling);

        pedidosDigitales = Math.round(pedidosTotales * cli._adopt);
        if (pedidosDigitales > pedidosTotales) pedidosDigitales = pedidosTotales;
        pedidosAnalogos = pedidosTotales - pedidosDigitales;

        const volMes = Math.round(cli.volumenBase / 12 * seasonality * (rand() * 0.28 + 0.86));
        volDigital = Math.round(volMes * (pedidosDigitales / pedidosTotales));
        volAnalogo = Math.max(0, volMes - volDigital);
      } else {
        volAnalogo = Math.round(cli.volumenBase / 12 * seasonality * (rand() * 0.28 + 0.86));
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
        estaIncorporado: estaIncorporadoMes,
        esActivo: esActivoMes,
        esRevertido: esRevertidoMes,
        pedidosTotales,
        pedidosDigitales,
        pedidosAnalogos,
        pedidosWeb,
        pedidosApp,
        pedidosEdi,
        volumenTotal: volDigital + volAnalogo,
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
