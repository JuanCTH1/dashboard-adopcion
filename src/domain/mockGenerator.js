/**
 * DETERMINISTIC SYNTHETIC DATA GENERATOR FOR CX ADOPTION
 * Comprehensive Commercial Lifecycle Engine (36 Months: 2024 - 2026)
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
  const periodoActualIdx = MESES.findIndex(m => m.key === periodoActual); // 31 (Aug 2026)

  // 2. GEOGRAPHIC REGIONS & PHYSICAL MARKETS WITH MARKET TIERS
  const REGIONES = [
    { id: 'reg-1', nombre: 'Atlantic', plazas: ['New York', 'Boston'] },
    { id: 'reg-2', nombre: 'Sunbelt', plazas: ['Dallas', 'Houston'] },
    { id: 'reg-3', nombre: 'Midwest', plazas: ['Chicago', 'St. Louis'] },
    { id: 'reg-4', nombre: 'Mountain', plazas: ['Denver', 'Salt Lake'] },
    { id: 'reg-5', nombre: 'Pacific NW', plazas: ['Los Angeles', 'Phoenix'] }
  ];

  // Market Scale Tiers: Megamarkets (Tier 1), Large Metros (Tier 2), Regional Hubs (Tier 3)
  const MARKET_TIERS = {
    'Dallas': { tier: 1, baseVolMult: 1.45, repLoadMult: 1.35, adoptionPace: 0.04 },
    'Houston': { tier: 1, baseVolMult: 1.40, repLoadMult: 1.30, adoptionPace: 0.03 },
    'Los Angeles': { tier: 1, baseVolMult: 1.35, repLoadMult: 1.25, adoptionPace: 0.03 },
    'Phoenix': { tier: 1, baseVolMult: 1.30, repLoadMult: 1.20, adoptionPace: 0.05 },
    'New York': { tier: 2, baseVolMult: 1.15, repLoadMult: 1.05, adoptionPace: -0.02 },
    'Chicago': { tier: 2, baseVolMult: 1.10, repLoadMult: 1.00, adoptionPace: 0.00 },
    'Denver': { tier: 2, baseVolMult: 1.05, repLoadMult: 0.95, adoptionPace: 0.02 },
    'Boston': { tier: 3, baseVolMult: 0.85, repLoadMult: 0.80, adoptionPace: -0.03 },
    'St. Louis': { tier: 3, baseVolMult: 0.80, repLoadMult: 0.75, adoptionPace: -0.04 },
    'Salt Lake': { tier: 3, baseVolMult: 0.75, repLoadMult: 0.70, adoptionPace: 0.01 }
  };

  // 3. BUSINESS LINES
  const VPS = [
    { id: 'vp-readymix', nombre: 'Readymix', persona: 'Sarah Jenkins', lineaNegocio: 'readymix', unidad: 'cu yd' },
    { id: 'vp-cemento', nombre: 'Cement', persona: 'Michael Chang', lineaNegocio: 'cemento', unidad: 'tons' },
    { id: 'vp-agregados', nombre: 'Aggregates', persona: 'David Miller', lineaNegocio: 'agregados', unidad: 'tons' }
  ];

  // Business Line Scale & Behavioral Traits
  const LINEAS_CONFIG = {
    readymix: {
      label: 'Readymix',
      unidad: 'cu yd',
      accountDensity: 1.25,
      orderFreqRange: [8, 26],
      avgOrderSize: 18,
      baseVolRange: [150, 2200],
      topVolRange: [3000, 9500],
      channelMix: { web: 0.50, app: 0.42, edi: 0.08 }
    },
    cemento: {
      label: 'Cement',
      unidad: 'tons',
      accountDensity: 0.65,
      orderFreqRange: [2, 9],
      avgOrderSize: 220,
      baseVolRange: [400, 4500],
      topVolRange: [8000, 32000],
      channelMix: { web: 0.35, app: 0.12, edi: 0.53 }
    },
    agregados: {
      label: 'Aggregates',
      unidad: 'tons',
      accountDensity: 0.95,
      orderFreqRange: [10, 34],
      avgOrderSize: 45,
      baseVolRange: [350, 3800],
      topVolRange: [5500, 18000],
      channelMix: { web: 0.52, app: 0.33, edi: 0.15 }
    }
  };

  // 4. REGIONAL DIRECTORS (5 Regions per Business Line)
  const DIRECTORES = [
    // VP Readymix Concrete Dedicated Regional Directors
    { id: 'dir-rm-east', nombre: 'Atlantic', persona: 'Robert Vance', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-1' },
    { id: 'dir-rm-sunbelt', nombre: 'Sunbelt', persona: 'Elena Rostova', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-2' },
    { id: 'dir-rm-midwest', nombre: 'Midwest', persona: 'Marcus Thorne', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },
    { id: 'dir-rm-mountain', nombre: 'Mountain', persona: 'Jennifer Hayes', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-4' },
    { id: 'dir-rm-pacific', nombre: 'Pacific NW', persona: 'Carlos Mendez', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-5' },

    // VP Bulk Cement Dedicated Regional Directors
    { id: 'dir-cem-atlantic', nombre: 'Atlantic', persona: 'William Baxter', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },
    { id: 'dir-cem-gulf', nombre: 'Sunbelt', persona: 'Patricia Sterling', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-2' },
    { id: 'dir-cem-greatlakes', nombre: 'Midwest', persona: 'Arthur Pendelton', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-3' },
    { id: 'dir-cem-plains', nombre: 'Mountain', persona: 'Karen O\'Connor', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-4' },
    { id: 'dir-cem-northwest', nombre: 'Pacific NW', persona: 'Daniel Kim', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-5' },

    // VP Quarries & Aggregates Dedicated Regional Directors
    { id: 'dir-agg-northeast', nombre: 'Atlantic', persona: 'George Hamilton', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-1' },
    { id: 'dir-agg-southeast', nombre: 'Sunbelt', persona: 'Sandra Bullock', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },
    { id: 'dir-agg-central', nombre: 'Midwest', persona: 'Richard Gere', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-3' },
    { id: 'dir-agg-texas', nombre: 'Mountain', persona: 'Charles Walker', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-4' },
    { id: 'dir-agg-westcoast', nombre: 'Pacific NW', persona: 'Victoria Beckham', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-5' }
  ];

  // 5. MARKET MANAGERS (10 Physical Markets per Business Line)
  const GERENTES = [
    // Readymix Dedicated Managers
    { id: 'ger-1', nombre: 'New York', persona: 'Kevin Stewart', directorId: 'dir-rm-east', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-1' },
    { id: 'ger-2', nombre: 'Boston', persona: 'Amanda Garcia', directorId: 'dir-rm-east', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-1' },
    { id: 'ger-3', nombre: 'Dallas', persona: 'Christopher Harris', directorId: 'dir-rm-sunbelt', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-2' },
    { id: 'ger-4', nombre: 'Houston', persona: 'Stephanie Rodriguez', directorId: 'dir-rm-sunbelt', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-2' },
    { id: 'ger-5', nombre: 'Chicago', persona: 'Matthew Thompson', directorId: 'dir-rm-midwest', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },
    { id: 'ger-6', nombre: 'St. Louis', persona: 'Nicole Lee', directorId: 'dir-rm-midwest', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-3' },
    { id: 'ger-7', nombre: 'Denver', persona: 'Steven Hernandez', directorId: 'dir-rm-mountain', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-4' },
    { id: 'ger-8', nombre: 'Salt Lake', persona: 'Rachel Young', directorId: 'dir-rm-mountain', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-4' },
    { id: 'ger-9', nombre: 'Los Angeles', persona: 'Ashley Robinson', directorId: 'dir-rm-pacific', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-5' },
    { id: 'ger-10', nombre: 'Phoenix', persona: 'Joseph Clark', directorId: 'dir-rm-pacific', vpId: 'vp-readymix', lineaNegocio: 'readymix', regionId: 'reg-5' },

    // Cement Dedicated Managers
    { id: 'ger-11', nombre: 'New York', persona: 'Paul Wright', directorId: 'dir-cem-atlantic', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },
    { id: 'ger-12', nombre: 'Boston', persona: 'Melissa Lopez', directorId: 'dir-cem-atlantic', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-1' },
    { id: 'ger-13', nombre: 'Dallas', persona: 'Mark Hill', directorId: 'dir-cem-gulf', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-2' },
    { id: 'ger-14', nombre: 'Houston', persona: 'Michelle Scott', directorId: 'dir-cem-gulf', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-2' },
    { id: 'ger-15', nombre: 'Chicago', persona: 'Donald Green', directorId: 'dir-cem-greatlakes', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-3' },
    { id: 'ger-16', nombre: 'St. Louis', persona: 'Kimberly Adams', directorId: 'dir-cem-greatlakes', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-3' },
    { id: 'ger-17', nombre: 'Denver', persona: 'George Baker', directorId: 'dir-cem-plains', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-4' },
    { id: 'ger-18', nombre: 'Salt Lake', persona: 'Amy Gonzalez', directorId: 'dir-cem-plains', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-4' },
    { id: 'ger-19', nombre: 'Los Angeles', persona: 'Kenneth Nelson', directorId: 'dir-cem-northwest', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-5' },
    { id: 'ger-20', nombre: 'Phoenix', persona: 'Angela Carter', directorId: 'dir-cem-northwest', vpId: 'vp-cemento', lineaNegocio: 'cemento', regionId: 'reg-5' },

    // Aggregates Dedicated Managers
    { id: 'ger-21', nombre: 'New York', persona: 'Steven Mitchell', directorId: 'dir-agg-northeast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-1' },
    { id: 'ger-22', nombre: 'Boston', persona: 'Edward Roberts', directorId: 'dir-agg-northeast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-1' },
    { id: 'ger-23', nombre: 'Dallas', persona: 'Pamela Turner', directorId: 'dir-agg-southeast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },
    { id: 'ger-24', nombre: 'Houston', persona: 'Brian Phillips', directorId: 'dir-agg-southeast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-2' },
    { id: 'ger-25', nombre: 'Chicago', persona: 'Emma Campbell', directorId: 'dir-agg-central', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-3' },
    { id: 'ger-26', nombre: 'St. Louis', persona: 'Ronald Parker', directorId: 'dir-agg-central', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-3' },
    { id: 'ger-27', nombre: 'Denver', persona: 'Rebecca Evans', directorId: 'dir-agg-texas', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-4' },
    { id: 'ger-28', nombre: 'Salt Lake', persona: 'Anthony Edwards', directorId: 'dir-agg-texas', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-4' },
    { id: 'ger-29', nombre: 'Los Angeles', persona: 'Laura Collins', directorId: 'dir-agg-westcoast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-5' },
    { id: 'ger-30', nombre: 'Phoenix', persona: 'Cynthia Sánchez', directorId: 'dir-agg-westcoast', vpId: 'vp-agregados', lineaNegocio: 'agregados', regionId: 'reg-5' }
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

  // 6. 5 COMMERCIAL ARCHETYPES WITH AUTHENTIC FUNNEL BEHAVIORS
  const REP_ARCHETYPES = [
    // Onboarder: 94% Onboarding | 44% Adoption (High registration, moderate digital conversion)
    { type: 'Onboarder', onboardingTarget: 0.94, activeConversionTarget: 0.60, adoptionTarget: 0.44 },
    // DigitalChampion: 68% Onboarding | 86% Adoption (Intense digital push on registered accounts)
    { type: 'DigitalChampion', onboardingTarget: 0.68, activeConversionTarget: 0.94, adoptionTarget: 0.86 },
    // ActiveConverter: 72% Onboarding | 68% Adoption (Balanced conversion)
    { type: 'ActiveConverter', onboardingTarget: 0.72, activeConversionTarget: 0.90, adoptionTarget: 0.68 },
    // Traditionalist: 52% Onboarding | 38% Adoption (High phone reliance, resistance to portal)
    { type: 'Traditionalist', onboardingTarget: 0.52, activeConversionTarget: 0.55, adoptionTarget: 0.38 },
    // HighAdopter: 90% Onboarding | 84% Adoption (Elite performance across all metrics)
    { type: 'HighAdopter', onboardingTarget: 0.90, activeConversionTarget: 0.92, adoptionTarget: 0.84 }
  ];

  // 7. BUILD 150 SALES REPS WITH ARCHETYPES AND MARKET ASYMMETRY
  const VENDEDORES = [];
  let vIdx = 0;
  GERENTES.forEach(ger => {
    const numReps = 5;
    const dirObj = DIRECTORES.find(d => d.id === ger.directorId);
    const regionObj = REGIONES.find(r => r.id === ger.regionId);
    const marketTier = MARKET_TIERS[ger.nombre] || { tier: 2, repLoadMult: 1.0, adoptionPace: 0.0 };
    const marketBias = (ger.id.charCodeAt(ger.id.length - 1) % 5);

    for (let i = 0; i < numReps; i++) {
      const nameIndex = (vIdx % NOMBRES_VENDEDORES.length);
      const nameSuffix = Math.floor(vIdx / NOMBRES_VENDEDORES.length) > 0 ? ` Jr.` : '';
      const repName = `${NOMBRES_VENDEDORES[nameIndex]}${nameSuffix}`;
      const profileIndex = (marketBias + i) % REP_ARCHETYPES.length;
      const profile = REP_ARCHETYPES[profileIndex];

      VENDEDORES.push({
        id: `rep-${vIdx + 1}`,
        nombre: repName,
        gerenteId: ger.id,
        directorId: ger.directorId,
        vpId: ger.vpId,
        lineaNegocio: ger.lineaNegocio,
        regionId: ger.regionId,
        regionNombre: dirObj?.nombre || regionObj?.nombre || 'Atlantic',
        plaza: ger.nombre,
        marketTier: marketTier.tier,
        marketPace: marketTier.adoptionPace,
        repLoadMult: marketTier.repLoadMult,
        profile
      });
      vIdx++;
    }
  });

  // 8. BUILD CUSTOMER ACCOUNTS (Pareto 80/20 Volume & Lifecycle State Machine)
  const BASE_COMPANY_NAMES = [
    'Apex Construction LLC', 'Turner Heavy Infra', 'Skanska USA Built', 'Bechtel Concrete Works',
    'PCL Construction Corp', 'Fluor Industrial Inc', 'Kiewit Infrastructure', 'Walsh Heavy Materials',
    'Balfour Beatty US', 'Gilbane Building Co', 'AECOM Structures', 'Mortenson Construction',
    'Hensel Phelps Builders', 'Clark Construction Group', 'Suffolk Heavy Build', 'Whiting-Turner Co',
    'Granite Construction', 'Structure Tone Global', 'Clayco Commercial Works', 'Sundt Infrastructure',
    'Austin Commercial LLC', 'Webcor Builders', 'McCarthy Building Co', 'Lendlease Americas',
    'DPR Construction', 'Brasfield & Gorrie', 'JE Dunn Construction', 'Rodgers Builders Inc',
    'Robins & Morton', 'Barton Malow Co', 'Swinerton Heavy Builders', 'Sundt Metro LLC',
    'Flatiron Constructors', 'Archer Western Contractors', 'Traylor Bros Heavy', 'Lane Construction'
  ];

  const COMPANY_SUFFIXES = [
    'East Site', 'West Div', 'Metro Project', 'Plant #2', 'Hub', 'Venture', 'Site A', 'South Park',
    'North Terminal', 'Central Plant', 'Highway Div', 'Industrial Yard', 'Bay Area Site', 'Downtown Highrise'
  ];

  const CLIENTES = [];
  let cIdx = 1;

  VENDEDORES.forEach(rep => {
    const blCfg = LINEAS_CONFIG[rep.lineaNegocio] || LINEAS_CONFIG.readymix;
    const baseRepLoad = Math.round(14 * blCfg.accountDensity * rep.repLoadMult);
    const numClientes = Math.max(7, baseRepLoad + Math.floor((rand() - 0.5) * 6));
    const p = rep.profile;

    for (let i = 0; i < numClientes; i++) {
      const cId = `CLI-${String(cIdx).padStart(5, '0')}`;
      const baseComp = BASE_COMPANY_NAMES[(cIdx - 1) % BASE_COMPANY_NAMES.length];
      const suff = COMPANY_SUFFIXES[Math.floor(rand() * COMPANY_SUFFIXES.length)];
      const nombreEmpresa = `${baseComp} (${suff})`;
      cIdx++;

      // Pareto Distribution: Top 20% generate ~78% of volume
      const u = rand();
      const isTopPareto = u > 0.80;
      const isMidPareto = !isTopPareto && u > 0.50;

      let volumenBase = 0;
      if (isTopPareto) {
        volumenBase = Math.floor(blCfg.topVolRange[0] + rand() * (blCfg.topVolRange[1] - blCfg.topVolRange[0]));
      } else if (isMidPareto) {
        volumenBase = Math.floor(blCfg.baseVolRange[0] * 1.8 + rand() * (blCfg.baseVolRange[1] - blCfg.baseVolRange[0]));
      } else {
        volumenBase = Math.floor(blCfg.baseVolRange[0] + rand() * (blCfg.baseVolRange[0] * 1.5));
      }

      // CLIENT LIFECYCLE ONBOARDING STATE MACHINE
      // Determine if customer ever onboards in the 36-month horizon based on rep archetype
      const clientOnboardPropensity = Math.min(0.98, Math.max(0.20, p.onboardingTarget + ((rand() - 0.5) * 0.18)));
      const everOnboards = rand() < clientOnboardPropensity;

      let onboardingMonthIndex = null;
      if (everOnboards) {
        // Ramp distribution: Some in 2024 (months 0-11), more in 2025 (months 12-23), latecomers in 2026 (months 24-35)
        const cohortRand = rand();
        if (cohortRand < 0.40) {
          onboardingMonthIndex = Math.floor(rand() * 12); // 2024 (0 - 11)
        } else if (cohortRand < 0.78) {
          onboardingMonthIndex = 12 + Math.floor(rand() * 12); // 2025 (12 - 23)
        } else {
          onboardingMonthIndex = 24 + Math.floor(rand() * 10); // 2026 (24 - 33)
        }
      }

      // First Time To Value (days)
      const fttv = everOnboards ? Math.floor(rand() * 24) + 3 : null;

      // Base client digital adoption propensity
      const basePropensity = Math.min(0.96, Math.max(0.15, p.adoptionTarget + rep.marketPace + ((rand() - 0.5) * 0.22)));

      // Primary Channel Selection based on BL mix
      const cMix = blCfg.channelMix;
      const cRand = rand();
      let canalPreferido = 'web';
      if (cRand < cMix.web) canalPreferido = 'web';
      else if (cRand < cMix.web + cMix.app) canalPreferido = 'app';
      else canalPreferido = 'edi';

      // Current snapshot status (at periodoActualIdx = Aug 2026)
      const estaIncorporadoActual = onboardingMonthIndex !== null && onboardingMonthIndex <= periodoActualIdx;
      const esActivoActual = estaIncorporadoActual && (rand() < (p.activeConversionTarget * 0.95));
      const esRevertidoActual = estaIncorporadoActual && !esActivoActual;

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
        volumenBase,
        isTopPareto,
        esTopPareto: isTopPareto,
        onboardingMonthIndex,
        estaIncorporado: estaIncorporadoActual,
        esActivo: esActivoActual,
        esRevertido: esRevertidoActual,
        fttv,
        basePropensity,
        digitalShare: esActivoActual ? basePropensity : 0,
        canalPreferido,
        profile: p,
        marketPace: rep.marketPace
      });
    }
  });

  // 9. 36-MONTH MACRO GROWTH & TRANSACTIONS GENERATION
  // 2024 (~32.5% avg base), 2025 (~53.7% avg base), 2026 (~74.9% avg base)
  const BASE_CURVE_36M = [
    // 2024 (Jan - Dec): Clear ~32.5% avg base with natural non-linear monthly ups/downs
    0.24, 0.28, 0.26, 0.31, 0.35, 0.33, 0.37, 0.39, 0.34, 0.40, 0.36, 0.33,
    // 2025 (Jan - Dec): Strong YoY growth (~53.7% avg base) with natural monthly ups/downs
    0.43, 0.47, 0.45, 0.52, 0.57, 0.54, 0.59, 0.62, 0.56, 0.63, 0.61, 0.55,
    // 2026 (Jan - Dec): Solid YoY growth (~74.9% avg base) with natural monthly ups/downs
    0.65, 0.69, 0.66, 0.73, 0.79, 0.76, 0.81, 0.84, 0.77, 0.85, 0.82, 0.77
  ];

  // Business Line Quarterly Shifts (+/- 15% to 25% organic oscillations)
  const BL_MONTHLY_SHIFTS = {
    readymix: [
      -0.03,  0.04, -0.04,  0.05,  0.06, -0.03,  0.04, -0.02,  0.05, -0.04,  0.03, -0.05,
      -0.04,  0.05, -0.05,  0.06,  0.07, -0.04,  0.05, -0.03,  0.06, -0.04,  0.04, -0.06,
      -0.05,  0.06, -0.06,  0.07,  0.08, -0.04,  0.06, -0.03,  0.06, -0.05,  0.04, -0.06
    ],
    cemento: [
       0.04, -0.03,  0.05, -0.02,  0.04,  0.03, -0.04,  0.06, -0.03,  0.05, -0.03,  0.02,
       0.04, -0.04,  0.06, -0.03,  0.05,  0.04, -0.05,  0.07, -0.03,  0.06, -0.04,  0.03,
       0.05, -0.04,  0.07, -0.03,  0.06,  0.04, -0.05,  0.07, -0.04,  0.06, -0.04,  0.03
    ],
    agregados: [
      -0.02, -0.04,  0.05, -0.04,  0.03,  0.05, -0.05,  0.03, -0.04,  0.06, -0.03, -0.03,
      -0.03, -0.05,  0.06, -0.04,  0.04,  0.06, -0.06,  0.04, -0.04,  0.07, -0.04, -0.04,
      -0.03, -0.05,  0.07, -0.05,  0.05,  0.07, -0.06,  0.05, -0.05,  0.07, -0.04, -0.04
    ]
  };

  // Funnel Step Shifts: Alternating weakest links between Step 2 (Onboarding), Step 3 (Active), Step 4 (Adoption)
  const MONTHLY_FUNNEL_SHIFTS = [
    // 2024:
    { activeShift: -0.16, adoptShift:  0.03 }, // Step 3 bottleneck
    { activeShift:  0.12, adoptShift: -0.18 }, // Step 4 bottleneck
    { activeShift:  0.10, adoptShift: -0.20 }, // Step 4 bottleneck
    { activeShift: -0.14, adoptShift:  0.12 }, // Step 3 bottleneck
    { activeShift: -0.18, adoptShift:  0.04 }, // Step 3 bottleneck
    { activeShift:  0.12, adoptShift: -0.20 }, // Step 4 bottleneck
    { activeShift:  0.10, adoptShift:  0.06 },
    { activeShift: -0.15, adoptShift:  0.04 },
    { activeShift:  0.09, adoptShift: -0.16 },
    { activeShift:  0.11, adoptShift:  0.05 },
    { activeShift: -0.17, adoptShift:  0.06 },
    { activeShift:  0.08, adoptShift: -0.17 },
    // 2025:
    { activeShift: -0.17, adoptShift:  0.04 },
    { activeShift:  0.13, adoptShift: -0.19 },
    { activeShift:  0.11, adoptShift: -0.19 },
    { activeShift: -0.15, adoptShift:  0.14 },
    { activeShift: -0.19, adoptShift:  0.05 },
    { activeShift:  0.13, adoptShift: -0.21 },
    { activeShift:  0.11, adoptShift:  0.07 },
    { activeShift: -0.16, adoptShift:  0.05 },
    { activeShift:  0.10, adoptShift: -0.17 },
    { activeShift:  0.12, adoptShift:  0.06 },
    { activeShift: -0.18, adoptShift:  0.07 },
    { activeShift:  0.09, adoptShift: -0.18 },
    // 2026:
    { activeShift: -0.18, adoptShift:  0.05 },
    { activeShift:  0.14, adoptShift: -0.20 },
    { activeShift:  0.12, adoptShift: -0.20 },
    { activeShift: -0.16, adoptShift:  0.15 },
    { activeShift: -0.20, adoptShift:  0.06 },
    { activeShift:  0.14, adoptShift: -0.22 },
    { activeShift:  0.12, adoptShift:  0.08 },
    { activeShift: -0.17, adoptShift:  0.06 },
    { activeShift:  0.11, adoptShift: -0.18 },
    { activeShift:  0.13, adoptShift:  0.07 },
    { activeShift: -0.19, adoptShift:  0.08 },
    { activeShift:  0.10, adoptShift: -0.19 }
  ];

  const TRANSACCIONES = [];

  MESES.forEach((m, mIdx) => {
    const baseMacroRate = BASE_CURVE_36M[mIdx] || 0.55;
    const funnelShift = MONTHLY_FUNNEL_SHIFTS[mIdx] || { activeShift: 0, adoptShift: 0 };
    const seasonality = 1 + (Math.sin((m.mesNum - 2) * 0.52) * 0.12); // Winter dip in Jan/Feb, summer peak

    CLIENTES.forEach(cli => {
      const blShifts = BL_MONTHLY_SHIFTS[cli.lineaNegocio] || [];
      const blShift = blShifts[mIdx] || 0;
      const blCfg = LINEAS_CONFIG[cli.lineaNegocio] || LINEAS_CONFIG.readymix;
      const p = cli.profile;

      // 1. Lifecycle Onboarding Check
      const estaIncorporadoMes = (cli.onboardingMonthIndex !== null) && (mIdx >= cli.onboardingMonthIndex);

      // 2. Active Status in Month m
      let esActivoMes = false;
      let esRevertidoMes = false;

      if (estaIncorporadoMes) {
        // Active conversion target with monthly noise and funnel shift
        const activeTarget = Math.min(0.96, Math.max(0.25, p.activeConversionTarget + funnelShift.activeShift + ((rand() - 0.5) * 0.16)));
        esActivoMes = rand() < activeTarget;
        esRevertidoMes = !esActivoMes;
      }

      // 3. Orders & Volume for Month m
      const volMes = Math.max(15, Math.round(cli.volumenBase * seasonality * (rand() * 0.28 + 0.86)));
      const avgOrderSize = cli.isTopPareto ? blCfg.avgOrderSize * 1.8 : blCfg.avgOrderSize;
      const baseOrders = Math.max(1, Math.round(volMes / avgOrderSize));
      const pedidosTotales = Math.max(1, Math.round(baseOrders * (rand() * 0.30 + 0.85)));

      let pedidosDigitales = 0;
      let pedidosAnalogos = pedidosTotales;
      let volDigital = 0;
      let volAnalogo = volMes;

      if (estaIncorporadoMes && esActivoMes) {
        // Organic volatility per client (+/- 12% to +/- 24%)
        const clientVol = (rand() - 0.5) * 0.22;
        const targetRate = baseMacroRate + blShift + funnelShift.adoptShift + cli.marketPace;
        const clientAdoptionRate = Math.min(0.98, Math.max(0.12, (targetRate * 0.55) + (cli.basePropensity * 0.45) + clientVol));

        pedidosDigitales = Math.round(pedidosTotales * clientAdoptionRate);
        if (pedidosDigitales > pedidosTotales) pedidosDigitales = pedidosTotales;
        if (pedidosDigitales === 0 && pedidosTotales > 0) pedidosDigitales = 1; // At least 1 order if active
        pedidosAnalogos = pedidosTotales - pedidosDigitales;

        volDigital = Math.round(volMes * (pedidosDigitales / pedidosTotales));
        volAnalogo = volMes - volDigital;
      }

      // 4. Channel Breakdown for Digital Orders
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