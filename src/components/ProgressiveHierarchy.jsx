import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomTooltip } from '@/components/ui/tooltip';
import {
  ChevronRight,
  ChevronDown,
  Download,
  Layers,
  Globe,
  Building,
  Briefcase,
  Users,
  User,
  Sparkles,
  Check,
  ShoppingCart,
  PhoneCall,
  PhoneOff,
  UserX,
  Laptop,
  Smartphone,
  Server,
  Clock,
  Info,
  ArrowRight,
  Maximize2,
  Minimize2,
  Workflow,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Zap,
  MapPin,
  Target,
  Mail,
  ShieldAlert,
  RotateCcw,
  MoreVertical
} from 'lucide-react';
import { formatNumber, formatCompactNumber, formatPct, cn } from '@/lib/utils';
import { adopcionRepo } from '@/domain/adopcionRepo';
import { exclusionManager, EXCLUSION_REASONS } from '@/domain/exclusionManager';

// Unified single-clock FLIP transition
const FLIP_TRANSITION = {
  type: 'spring',
  stiffness: 350,
  damping: 30
};

const BL_SHORT = {
  'readymix': 'RMX',
  'cemento': 'CEM',
  'agregados': 'AGG',
  'Ready-Mix Concrete': 'RMX',
  'Cement Bulk': 'CEM',
  'Aggregates': 'AGG'
};

export const ProgressiveHierarchy = React.memo(function ProgressiveHierarchy({
  filtrosCompuestos = {},
  onHierarchyFilterChange,
  onOpenActionDrawer,
  onExportCsv
}) {
  // Multidimensional selection states derived directly from active filters (0ms sync latency)
  const selectedVpIds = useMemo(() => filtrosCompuestos?.vpIds || [], [filtrosCompuestos?.vpIds]);
  const selectedDirIds = useMemo(() => filtrosCompuestos?.directorIds || [], [filtrosCompuestos?.directorIds]);
  const selectedGerIds = useMemo(() => filtrosCompuestos?.gerenteIds || [], [filtrosCompuestos?.gerenteIds]);
  const selectedRepIds = useMemo(() => filtrosCompuestos?.vendedorIds || [], [filtrosCompuestos?.vendedorIds]);

  // Table sorting state: key, direction ('asc' | 'desc')
  const [sortConfig, setSortConfig] = useState({
    key: 'pedidosTotales',
    direction: 'desc'
  });

  // Navigation mode: 'all_columns' (default) | 'cascade'
  const [navMode, setNavMode] = useState('all_columns');

  // Drag-to-select state
  const [isDragging, setIsDragging] = useState(false);

  // Fixed body-level popover state (100% immune to clipping)
  const [hoveredPopover, setHoveredPopover] = useState(null);
  const popoverTimerRef = useRef(null);

  const clearPopoverTimer = useCallback(() => {
    if (popoverTimerRef.current) {
      clearTimeout(popoverTimerRef.current);
      popoverTimerRef.current = null;
    }
  }, []);

  const showPopoverWithDelay = useCallback((popoverData, delay = 450) => {
    clearPopoverTimer();
    popoverTimerRef.current = setTimeout(() => {
      setHoveredPopover(popoverData);
    }, delay);
  }, [clearPopoverTimer]);

  const hidePopover = useCallback(() => {
    clearPopoverTimer();
    setHoveredPopover(null);
  }, [clearPopoverTimer]);

  useEffect(() => {
    return () => {
      if (popoverTimerRef.current) {
        clearTimeout(popoverTimerRef.current);
      }
    };
  }, []);

  // Expandable table rows state
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  // Fast rep lookup map for cascading filter pruning and auto-selection
  const repMap = useMemo(() => {
    const list = adopcionRepo.getFiltrosDisponibles().vendedores || [];
    return new Map(list.map(v => [v.id, v]));
  }, []);

  const REGION_TO_MARKETS = useMemo(() => ({
    'Atlantic': ['New York', 'Boston'],
    'Sunbelt': ['Dallas', 'Houston'],
    'Midwest': ['Chicago', 'St. Louis'],
    'Mountain': ['Denver', 'Salt Lake'],
    'Pacific NW': ['Los Angeles', 'Phoenix']
  }), []);

  const MARKET_TO_REGION = useMemo(() => ({
    'New York': 'Atlantic',
    'Boston': 'Atlantic',
    'Dallas': 'Sunbelt',
    'Houston': 'Sunbelt',
    'Chicago': 'Midwest',
    'St. Louis': 'Midwest',
    'Denver': 'Mountain',
    'Salt Lake': 'Mountain',
    'Los Angeles': 'Pacific NW',
    'Phoenix': 'Pacific NW'
  }), []);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // BRUSH / DRAG MULTI-SELECTION CONTROLLER FOR HIERARCHY COLUMNS
  const isMouseDownRef = useRef(false);
  const dragColumnRef = useRef(null); // 'vp' | 'director' | 'gerente' | 'vendedor'
  const dragModeRef = useRef("select"); // "select" | "deselect"
  const dragTouchedRef = useRef(new Set());
  const dragSessionSetRef = useRef(null);

  const handleSetVps = useCallback((nextVps) => {
    let nextDirs = selectedDirIds;
    let nextGers = selectedGerIds;
    let nextReps = selectedRepIds;

    if (nextVps.length === 0 && navMode === 'cascade') {
      nextDirs = [];
      nextGers = [];
      nextReps = [];
    } else if (nextVps.length > 0) {
      const allowedVps = new Set(nextVps);
      nextReps = selectedRepIds.filter(rId => {
        const rep = repMap.get(rId);
        return rep ? allowedVps.has(rep.vpId) : true;
      });
    }

    onHierarchyFilterChange?.({
      vpIds: nextVps,
      directorIds: nextDirs,
      gerenteIds: nextGers,
      vendedorIds: nextReps
    });
  }, [selectedDirIds, selectedGerIds, selectedRepIds, navMode, repMap, onHierarchyFilterChange]);

  const handleSetDirs = useCallback((nextDirs) => {
    let nextGers = selectedGerIds;
    let nextReps = selectedRepIds;

    if (nextDirs.length === 0) {
      nextGers = [];
      nextReps = [];
    } else {
      const allowedMarkets = new Set();
      nextDirs.forEach(d => {
        const mkts = REGION_TO_MARKETS[d] || [];
        mkts.forEach(m => allowedMarkets.add(m));
      });
      nextGers = selectedGerIds.filter(g => allowedMarkets.has(g));

      if (nextGers.length > 0) {
        const mktSet = new Set(nextGers);
        nextReps = selectedRepIds.filter(rId => {
          const rep = repMap.get(rId);
          return rep ? mktSet.has(rep.plaza) : true;
        });
      } else {
        const regSet = new Set(nextDirs);
        nextReps = selectedRepIds.filter(rId => {
          const rep = repMap.get(rId);
          return rep ? regSet.has(rep.regionNombre) : true;
        });
      }
    }

    onHierarchyFilterChange?.({
      vpIds: selectedVpIds,
      directorIds: nextDirs,
      gerenteIds: nextGers,
      vendedorIds: nextReps
    });
  }, [selectedVpIds, selectedGerIds, selectedRepIds, REGION_TO_MARKETS, repMap, onHierarchyFilterChange]);

  const handleSetGers = useCallback((nextGers) => {
    let nextReps = selectedRepIds;
    let nextDirs = selectedDirIds;

    if (nextGers.length === 0) {
      nextReps = [];
    } else {
      const allowedMarkets = new Set(nextGers);
      nextReps = selectedRepIds.filter(rId => {
        const rep = repMap.get(rId);
        return rep ? allowedMarkets.has(rep.plaza) : true;
      });
      // Auto-seleccionar regiones correspondientes
      const inferredDirs = Array.from(new Set(nextGers.map(m => MARKET_TO_REGION[m]).filter(Boolean)));
      if (inferredDirs.length > 0) {
        nextDirs = Array.from(new Set([...selectedDirIds, ...inferredDirs]));
      }
    }

    onHierarchyFilterChange?.({
      vpIds: selectedVpIds,
      directorIds: nextDirs,
      gerenteIds: nextGers,
      vendedorIds: nextReps
    });
  }, [selectedVpIds, selectedDirIds, selectedRepIds, MARKET_TO_REGION, repMap, onHierarchyFilterChange]);

  const handleSetReps = useCallback((nextReps) => {
    let nextGers = selectedGerIds;
    let nextDirs = selectedDirIds;

    if (nextReps.length > 0) {
      const inferredMarkets = new Set(selectedGerIds);
      const inferredDirs = new Set(selectedDirIds);
      nextReps.forEach(rId => {
        const rep = repMap.get(rId);
        if (rep) {
          if (rep.plaza) {
            inferredMarkets.add(rep.plaza);
            if (MARKET_TO_REGION[rep.plaza]) inferredDirs.add(MARKET_TO_REGION[rep.plaza]);
          }
          if (rep.regionNombre) inferredDirs.add(rep.regionNombre);
        }
      });
      nextGers = Array.from(inferredMarkets);
      nextDirs = Array.from(inferredDirs);
    }

    onHierarchyFilterChange?.({
      vpIds: selectedVpIds,
      directorIds: nextDirs,
      gerenteIds: nextGers,
      vendedorIds: nextReps
    });
  }, [selectedVpIds, selectedDirIds, selectedGerIds, MARKET_TO_REGION, repMap, onHierarchyFilterChange]);

  const startDragSelect = useCallback((columnType, id, currentSelectedArray, onSetCallback) => {
    isMouseDownRef.current = true;
    dragColumnRef.current = columnType;
    const isCurrentlySelected = currentSelectedArray.includes(id);
    dragModeRef.current = isCurrentlySelected ? "deselect" : "select";

    const session = new Set(currentSelectedArray);
    if (isCurrentlySelected) {
      session.delete(id);
    } else {
      session.add(id);
    }
    dragSessionSetRef.current = session;
    dragTouchedRef.current = new Set([id]);

    onSetCallback(Array.from(session));

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      dragColumnRef.current = null;
      dragSessionSetRef.current = null;
      dragTouchedRef.current = new Set();
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mouseup", handleMouseUp);
  }, []);

  const handleDragEnter = useCallback((columnType, id, onSetCallback) => {
    if (!isMouseDownRef.current || dragColumnRef.current !== columnType) return;
    if (dragTouchedRef.current.has(id)) return;

    dragTouchedRef.current.add(id);
    const session = dragSessionSetRef.current;
    if (!session) return;

    if (dragModeRef.current === "select") {
      session.add(id);
    } else {
      session.delete(id);
    }

    onSetCallback(Array.from(session));
  }, []);

  const handleToggleVp = useCallback((id) => {
    const isCurrentlySelected = selectedVpIds.includes(id);
    const next = isCurrentlySelected ? selectedVpIds.filter(x => x !== id) : [...selectedVpIds, id];
    handleSetVps(next);
  }, [selectedVpIds, handleSetVps]);

  const handleToggleDir = useCallback((id) => {
    const isCurrentlySelected = selectedDirIds.includes(id);
    const next = isCurrentlySelected ? selectedDirIds.filter(x => x !== id) : [...selectedDirIds, id];
    handleSetDirs(next);
  }, [selectedDirIds, handleSetDirs]);

  const handleToggleGer = useCallback((id) => {
    const isCurrentlySelected = selectedGerIds.includes(id);
    const next = isCurrentlySelected ? selectedGerIds.filter(x => x !== id) : [...selectedGerIds, id];
    handleSetGers(next);
  }, [selectedGerIds, handleSetGers]);

  const handleToggleRep = useCallback((id) => {
    const isCurrentlySelected = selectedRepIds.includes(id);
    const next = isCurrentlySelected ? selectedRepIds.filter(x => x !== id) : [...selectedRepIds, id];
    handleSetReps(next);
  }, [selectedRepIds, handleSetReps]);

  const handleClearVps = useCallback(() => {
    onHierarchyFilterChange?.({
      vpIds: [],
      directorIds: navMode === 'cascade' ? [] : selectedDirIds,
      gerenteIds: navMode === 'cascade' ? [] : selectedGerIds,
      vendedorIds: navMode === 'cascade' ? [] : selectedRepIds
    });
  }, [selectedDirIds, selectedGerIds, selectedRepIds, navMode, onHierarchyFilterChange]);

  const handleClearDirs = useCallback(() => {
    onHierarchyFilterChange?.({
      vpIds: selectedVpIds,
      directorIds: [],
      gerenteIds: [],
      vendedorIds: []
    });
  }, [selectedVpIds, onHierarchyFilterChange]);

  const handleClearGers = useCallback(() => {
    onHierarchyFilterChange?.({
      vpIds: selectedVpIds,
      directorIds: selectedDirIds,
      gerenteIds: [],
      vendedorIds: []
    });
  }, [selectedVpIds, selectedDirIds, onHierarchyFilterChange]);

  const handleClearReps = useCallback(() => {
    onHierarchyFilterChange?.({
      vpIds: selectedVpIds,
      directorIds: selectedDirIds,
      gerenteIds: selectedGerIds,
      vendedorIds: []
    });
  }, [selectedVpIds, selectedDirIds, selectedGerIds, onHierarchyFilterChange]);

  const toggleRowExpanded = (id) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Base context filters (temporal/business line scope) to share single cached aggregate across all levels
  const baseContextFilters = useMemo(() => {
    return {
      anios: filtrosCompuestos.anios,
      meses: filtrosCompuestos.meses,
      lineasNegocio: filtrosCompuestos.lineasNegocio,
      onboarded: filtrosCompuestos.onboarded,
      activos: filtrosCompuestos.activos,
      excluirNoViables: filtrosCompuestos.excluirNoViables
    };
  }, [filtrosCompuestos.anios, filtrosCompuestos.meses, filtrosCompuestos.lineasNegocio, filtrosCompuestos.onboarded, filtrosCompuestos.activos, filtrosCompuestos.excluirNoViables]);

  // Instant 0ms Hierarchy queries
  const vps = useMemo(() => {
    return adopcionRepo.getJerarquia('nacional', null, baseContextFilters);
  }, [baseContextFilters]);

  const directores = useMemo(() => {
    if (selectedVpIds.length === 0 && navMode !== 'all_columns') return [];
    return adopcionRepo.getJerarquia('vp', selectedVpIds, { ...baseContextFilters, vpIds: selectedVpIds });
  }, [selectedVpIds, baseContextFilters, navMode]);

  const gerentes = useMemo(() => {
    if (selectedDirIds.length === 0 && navMode !== 'all_columns') return [];
    return adopcionRepo.getJerarquia('director', selectedDirIds, { ...baseContextFilters, vpIds: selectedVpIds });
  }, [selectedDirIds, selectedVpIds, baseContextFilters, navMode]);

  const vendedores = useMemo(() => {
    if (selectedGerIds.length === 0 && navMode !== 'all_columns') return [];
    return adopcionRepo.getJerarquia('gerente', selectedGerIds, { ...baseContextFilters, vpIds: selectedVpIds, directorIds: selectedDirIds });
  }, [selectedGerIds, selectedDirIds, selectedVpIds, baseContextFilters, navMode]);

  const activeContext = useMemo(() => {
    let fNode = {
      ...filtrosCompuestos,
      vpIds: selectedVpIds,
      directorIds: selectedDirIds,
      gerenteIds: selectedGerIds,
      vendedorIds: selectedRepIds
    };

    let titulo = "USA";
    let singleVp = null;
    if (selectedRepIds.length) titulo = `${selectedRepIds.length} Sales Rep(s)`;
    else if (selectedGerIds.length) titulo = `${selectedGerIds.length} Manager(s)`;
    else if (selectedDirIds.length) titulo = `${selectedDirIds.length} Director(s)`;
    else if (selectedVpIds.length === 1) {
      singleVp = vps.find(v => v.id === selectedVpIds[0]) || null;
      titulo = singleVp ? singleVp.nombre : `${selectedVpIds.length} Business Line(s)`;
    } else if (selectedVpIds.length > 1 && selectedVpIds.length < vps.length) {
      titulo = `${selectedVpIds.length} Business Lines`;
    } else {
      titulo = "USA";
    }

    const cartera = adopcionRepo.getCartera(null, fNode);

    return {
      fNode,
      titulo,
      singleVp,
      cartera
    };
  }, [selectedVpIds, selectedDirIds, selectedGerIds, selectedRepIds, filtrosCompuestos, vps]);

  // Weighted totals calculation for footer
  const totalesCartera = useMemo(() => {
    const cart = activeContext.cartera;
    if (!cart.length) return null;
    let totalPedidos = 0;
    let totalDigitales = 0;
    let totalAnalogos = 0;
    let onboardedCount = 0;

    const len = cart.length;
    for (let i = 0; i < len; i++) {
      const c = cart[i];
      totalPedidos += c.pedidosTotales;
      totalDigitales += c.pedidosDigitales;
      totalAnalogos += c.pedidosAnalogos;
      if (c.estaIncorporado) onboardedCount++;
    }

    const pctAdopcionPonderado = totalPedidos > 0 ? (totalDigitales / totalPedidos) * 100 : 0;
    const pctOnboarding = (onboardedCount / len) * 100;

    return {
      totalClientes: len,
      totalPedidos,
      totalDigitales,
      totalAnalogos,
      onboardedCount,
      pctOnboarding,
      pctAdopcionPonderado
    };
  }, [activeContext.cartera]);

  const handleSort = useCallback((columnKey) => {
    setSortConfig(prev => {
      if (prev.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      const initialDirection = (columnKey === 'nombreEmpresa' || columnKey === 'status') ? 'asc' : 'desc';
      return { key: columnKey, direction: initialDirection };
    });
  }, []);

  const sortedCartera = useMemo(() => {
    if (!activeContext.cartera) return [];
    const list = [...activeContext.cartera];
    if (!sortConfig.key) return list;

    const { key, direction } = sortConfig;
    const factor = direction === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      if (key === 'nombreEmpresa') {
        return factor * (a.nombreEmpresa || '').localeCompare(b.nombreEmpresa || '');
      }
      if (key === 'pedidosDigitales') {
        return factor * ((a.pedidosDigitales || 0) - (b.pedidosDigitales || 0));
      }
      if (key === 'pedidosAnalogos') {
        return factor * ((a.pedidosAnalogos || 0) - (b.pedidosAnalogos || 0));
      }
      if (key === 'pedidosTotales') {
        return factor * ((a.pedidosTotales || 0) - (b.pedidosTotales || 0));
      }
      if (key === 'pctAdopcionPedidos') {
        return factor * ((a.pctAdopcionPedidos || 0) - (b.pctAdopcionPedidos || 0));
      }
      if (key === 'status') {
        const getStatusRank = (c) => {
          if (!c.estaIncorporado) return 1;
          if (c.pedidosDigitales > 0) return 3;
          return 2;
        };
        return factor * (getStatusRank(a) - getStatusRank(b));
      }
      return 0;
    });

    return list;
  }, [activeContext.cartera, sortConfig]);

  // Integrated Right Panel State ('action_plan' | 'customer_detail')
  const [rightPanelTab, setRightPanelTab] = useState('action_plan');
  const [showAllActionPlan, setShowAllActionPlan] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Exclusion Menu State & Reactive Sync
  const [exclusionsVersion, setExclusionsVersion] = useState(0);
  const [exclusionMenuClient, setExclusionMenuClient] = useState(null);

  useEffect(() => {
    return exclusionManager.subscribe(() => {
      setExclusionsVersion(v => v + 1);
    });
  }, []);

  const handleOpenExclusionMenu = (cli, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const width = 230;
    // Align menu cleanly to the right edge of the button to avoid viewport overflow
    let left = rect.right - width;
    if (left < 10) left = 10;
    if (left + width > window.innerWidth - 10) left = window.innerWidth - width - 10;

    let top = rect.bottom + 4;
    if (top + 220 > window.innerHeight) {
      top = Math.max(10, rect.top - 220);
    }

    setExclusionMenuClient({
      id: cli.id,
      nombreEmpresa: cli.nombreEmpresa,
      x: left,
      y: top
    });
  };

  const handleSelectExclusionReason = (reason) => {
    if (exclusionMenuClient) {
      exclusionManager.excludeClient(exclusionMenuClient.id, reason);
      setExclusionMenuClient(null);
    }
  };

  // Safe Viewport Clamping for Leadership / Info Popovers (Zero Top/Bottom Clipping)
  const handleShowLeadershipPopover = (e, data) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const popoverHeight = Math.min(420, (data.personasDetalle?.length || 1) * 95 + 80);
    const popoverWidth = 340;

    let top = 0;
    let pos = 'bottom';

    // Prioritize opening below button if it fits, else open above, else clamp inside viewport
    if (rect.bottom + popoverHeight <= window.innerHeight - 15) {
      top = rect.bottom + 8;
      pos = 'bottom';
    } else if (rect.top - popoverHeight >= 65) {
      top = rect.top - 8;
      pos = 'top';
    } else {
      top = Math.max(65, Math.min(window.innerHeight - popoverHeight - 15, rect.top - 40));
      pos = 'bottom';
    }

    let left = rect.left + rect.width / 2;
    left = Math.max(popoverWidth / 2 + 15, Math.min(window.innerWidth - popoverWidth / 2 - 15, left));

    setHoveredPopover({
      ...data,
      x: left,
      y: top,
      pos
    });
  };

  const handleToggleLeadershipPopover = (e, data) => {
    e.stopPropagation();
    if (hoveredPopover) {
      setHoveredPopover(null);
    } else {
      handleShowLeadershipPopover(e, data);
    }
  };

  // Reset showAllActionPlan when hierarchy selection changes
  useEffect(() => {
    setShowAllActionPlan(false);
  }, [selectedVpIds, selectedDirIds, selectedGerIds, selectedRepIds, filtrosCompuestos]);

  const TARGET_ADOPTION_PCT = 85.0;

  const actionPlanData = useMemo(() => {
    const rawCart = activeContext.cartera || [];
    // If SAM mode is active (excluirNoViables === true), exclude non-viable accounts.
    // If ALL mode is active (excluirNoViables === false), include all accounts in the Action Plan.
    const isExcluding = Boolean(filtrosCompuestos.excluirNoViables);
    const cart = isExcluding ? rawCart.filter(c => !exclusionManager.isExcluded(c.id)) : rawCart;

    if (!cart.length) {
      return {
        allNeededClients: [],
        visibleClients: [],
        totalNeededCount: 0,
        currentPct: 0,
        targetPct: TARGET_ADOPTION_PCT,
        gapOrders: 0,
        targetReached: true
      };
    }

    let totalPedidos = 0;
    let currentDigitales = 0;

    const len = cart.length;
    for (let i = 0; i < len; i++) {
      const c = cart[i];
      totalPedidos += (c.pedidosTotales || 0);
      currentDigitales += (c.pedidosDigitales || 0);
    }

    const currentPct = totalPedidos > 0 ? (currentDigitales / totalPedidos) * 100 : 0;
    const targetDigitalOrders = Math.ceil((TARGET_ADOPTION_PCT / 100) * totalPedidos);
    const gapOrders = Math.max(0, targetDigitalOrders - currentDigitales);

    // Candidates: not onboarded OR have analog orders
    const candidates = [];
    for (let i = 0; i < len; i++) {
      const c = cart[i];
      const potentialOrdersGain = !c.estaIncorporado
        ? (c.pedidosTotales || c.volumenBase || 0)
        : (c.pedidosAnalogos || 0);

      if (potentialOrdersGain > 0) {
        const type = !c.estaIncorporado
          ? 'onboarding'
          : (c.pedidosAnalogos > 0 ? 'habit_shift' : 'retained');

        if (type !== 'retained') {
          candidates.push({
            ...c,
            potentialOrdersGain,
            currentAdoption: c.pctAdopcionPedidos || 0,
            type
          });
        }
      }
    }

    candidates.sort((a, b) => b.potentialOrdersGain - a.potentialOrdersGain);

    let allNeededClients = [];
    let targetReached = false;

    if (gapOrders === 0 || currentPct >= TARGET_ADOPTION_PCT) {
      // Already at or above 85% -> Show Top 3 stretch accounts
      allNeededClients = candidates.slice(0, 3);
      targetReached = true;
    } else {
      // Accumulate accounts until the gap for 85% is covered
      let accumulatedGain = 0;
      for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i];
        allNeededClients.push(cand);
        accumulatedGain += cand.potentialOrdersGain;
        if (accumulatedGain >= gapOrders) {
          break;
        }
      }
    }

    const totalNeededCount = allNeededClients.length;
    const visibleClients = showAllActionPlan ? allNeededClients : allNeededClients.slice(0, 15);

    return {
      allNeededClients,
      visibleClients,
      totalNeededCount,
      currentPct: Number(currentPct.toFixed(1)),
      targetPct: TARGET_ADOPTION_PCT,
      gapOrders,
      targetReached
    };
  }, [activeContext.cartera, showAllActionPlan, exclusionsVersion, filtrosCompuestos.excluirNoViables]);

  const actionableAccountsCount = actionPlanData.totalNeededCount;

  // Horizontal Orders Breakdown: Digital (Green), Low Adoption (Amber), Not Onboarded (Red), Excluded (Gray)
  const orderComposition = useMemo(() => {
    const cart = activeContext.cartera || [];
    let totalOrders = 0;
    let digitalOrders = 0;
    let lowAdoptionOrders = 0;
    let notOnboardedOrders = 0;
    let excludedOrders = 0;

    const len = cart.length;
    for (let i = 0; i < len; i++) {
      const c = cart[i];
      const orders = c.pedidosTotales || 0;
      totalOrders += orders;

      if (exclusionManager.isExcluded(c.id)) {
        excludedOrders += orders;
      } else if (!c.estaIncorporado) {
        notOnboardedOrders += orders;
      } else {
        digitalOrders += (c.pedidosDigitales || 0);
        lowAdoptionOrders += (c.pedidosAnalogos || 0);
      }
    }

    const pctDigital = totalOrders > 0 ? (digitalOrders / totalOrders) * 100 : 0;
    const pctLowAdopt = totalOrders > 0 ? (lowAdoptionOrders / totalOrders) * 100 : 0;
    const pctNotOnb = totalOrders > 0 ? (notOnboardedOrders / totalOrders) * 100 : 0;
    const pctExcluded = totalOrders > 0 ? (excludedOrders / totalOrders) * 100 : 0;

    return {
      totalOrders,
      digitalOrders,
      lowAdoptionOrders,
      notOnboardedOrders,
      excludedOrders,
      pctDigital,
      pctLowAdopt,
      pctNotOnb,
      pctExcluded
    };
  }, [activeContext.cartera, exclusionsVersion]);

  const [copiedEmailRepId, setCopiedEmailRepId] = useState(null);

  const handleSendRepEmail = useCallback((rep, e) => {
    e.stopPropagation();

    // Get rep's cartera (respecting current target base filter)
    const rawRepCartera = adopcionRepo.getCartera(null, {
      ...filtrosCompuestos,
      vendedorIds: [rep.id]
    }) || [];

    const isExcluding = Boolean(filtrosCompuestos.excluirNoViables);
    const repCartera = isExcluding ? rawRepCartera.filter(c => !exclusionManager.isExcluded(c.id)) : rawRepCartera;

    let totalOrders = 0;
    let currentDigital = 0;
    const len = repCartera.length;
    for (let i = 0; i < len; i++) {
      const c = repCartera[i];
      totalOrders += (c.pedidosTotales || 0);
      currentDigital += (c.pedidosDigitales || 0);
    }

    const currentPct = totalOrders > 0 ? ((currentDigital / totalOrders) * 100).toFixed(1) : '0.0';
    const targetDigital = Math.ceil(0.85 * totalOrders);
    const gap = Math.max(0, targetDigital - currentDigital);

    const candidates = [];
    for (let i = 0; i < len; i++) {
      const c = repCartera[i];
      const potentialOrdersGain = !c.estaIncorporado
        ? (c.pedidosTotales || c.volumenBase || 0)
        : (c.pedidosAnalogos || 0);
      if (potentialOrdersGain > 0) {
        const type = !c.estaIncorporado
          ? 'onboarding'
          : (c.pedidosAnalogos > 0 ? 'habit_shift' : 'retained');
        if (type !== 'retained') {
          candidates.push({ ...c, potentialOrdersGain, type });
        }
      }
    }
    candidates.sort((a, b) => b.potentialOrdersGain - a.potentialOrdersGain);

    let neededAccounts = [];
    if (gap === 0 || Number(currentPct) >= 85.0) {
      neededAccounts = candidates.slice(0, 3);
    } else {
      let accumulated = 0;
      for (let i = 0; i < candidates.length; i++) {
        neededAccounts.push(candidates[i]);
        accumulated += candidates[i].potentialOrdersGain;
        if (accumulated >= gap) break;
      }
    }

    const totalGain = neededAccounts.reduce((sum, a) => sum + a.potentialOrdersGain, 0);
    const projectedDigital = currentDigital + totalGain;
    const projectedPct = totalOrders > 0 ? Math.min(100, ((projectedDigital / totalOrders) * 100)).toFixed(1) : '100.0';

    const subject = `Action Plan: Path to 85% Digital Adoption | ${rep.nombre}`;

    const accountLines = neededAccounts.map((acc, i) => {
      const issue = acc.type === 'onboarding' ? 'Not Onboarded' : `Low Adoption (${acc.pedidosAnalogos} offline ord/mo)`;
      return `  ${i + 1}. ${acc.nombreEmpresa} [${issue}] -> Potential Gain: +${formatNumber(acc.potentialOrdersGain)} digital orders/mo`;
    }).join('\n');

    const body = `Hi ${rep.nombre},

Here is your focused digital adoption coaching plan to reach our 85.0% target:

• Current Digital Adoption: ${currentPct}% (${formatNumber(currentDigital)} of ${formatNumber(totalOrders)} orders)
• Target: 85.0% Digital Adoption
• Gap to Target: ${formatNumber(gap)} orders/month

Priority Action Items (${neededAccounts.length} Key Accounts):
${accountLines || '  (All accounts currently digital)'}

Projected Impact:
By converting these ${neededAccounts.length} accounts to digital ordering, your portfolio will reach ${projectedPct}% adoption.

Let me know how we can support you in onboarding and converting these accounts this month.

Best regards,
Commercial Leadership`;

    // Open default email client
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    // Also copy body text to clipboard as backup
    navigator.clipboard.writeText(body);
    setCopiedEmailRepId(rep.id);
    setTimeout(() => setCopiedEmailRepId(null), 2500);
  }, [filtrosCompuestos]);

  const handleCopyScript = useCallback((client) => {
    const isHabit = client.type === 'habit_shift';
    const repName = client.vendedorNombre || 'your sales rep';
    const script = isHabit
      ? `Hi ${client.nombreEmpresa}, this is ${repName} from Cemex. I noticed you've been placing orders via phone recently. Let's place your next order through the mobile app together in 30 seconds to save you time and get real-time tracking!`
      : `Hi ${client.nombreEmpresa}, this is ${repName} from Cemex. We have your digital ordering portal ready for you to place and track all orders 24/7 with zero waiting. Let me send your 1-click invite!`;

    navigator.clipboard.writeText(script);
    setCopiedId(client.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const renderSortIcon = useCallback((columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-2.5 h-2.5 opacity-35 group-hover:opacity-75 transition-opacity shrink-0 ml-0.5" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-2.5 h-2.5 text-primary shrink-0 ml-0.5" />
    ) : (
      <ArrowDown className="w-2.5 h-2.5 text-primary shrink-0 ml-0.5" />
    );
  }, [sortConfig]);

  return (
    <Card className="p-3.5 bg-card border border-border shadow-xs rounded-xl flex flex-col relative overflow-hidden select-none space-y-2.5 font-sans">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-700 via-indigo-500 to-sky-400" />

      {/* Header — 3 carriles fijos: Título (Izq), Business Line (Centro Anclado), Controles (Der) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-3 pb-3 border-b border-border">
        {/* CARRIL IZQUIERDO: Título y métricas */}
        <div className="flex items-center gap-2 min-w-0 justify-self-start">
          <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
          <h2 className="text-sm font-black text-foreground tracking-tight flex items-center gap-1.5 flex-wrap">
            <span>{activeContext.titulo}</span>
            {activeContext.singleVp ? (
              <span className="text-xs font-semibold text-muted-foreground">
                <span className="text-primary font-black">{formatPct(activeContext.singleVp.metricas.pedidos?.pctAdopcion || 0)} adopt</span>
                {' · '}{activeContext.singleVp.persona}
              </span>
            ) : (
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                {totalesCartera?.totalClientes || 0} customers · <CustomTooltip text={formatNumber(totalesCartera?.totalPedidos || 0)}><span>{formatCompactNumber(totalesCartera?.totalPedidos || 0)} orders</span></CustomTooltip>
              </span>
            )}
          </h2>
        </div>

        {/* CARRIL CENTRAL: Business Line — Anclado al centro para evitar cualquier brinco o movimiento */}
        <div className="justify-self-center">
          <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-border select-none">
            {vps.map((vp) => {
              const isSelected = selectedVpIds.includes(vp.id);
              return (
                <button
                  key={vp.id}
                  type="button"
                  onMouseDown={(e) => {
                    hidePopover();
                    if (e.button === 0) startDragSelect('vp', vp.id, selectedVpIds, handleSetVps);
                  }}
                  onMouseEnter={(e) => {
                    handleDragEnter('vp', vp.id, handleSetVps);
                    const rect = e.currentTarget.getBoundingClientRect();
                    showPopoverWithDelay({
                      title: vp.nombre,
                      tipo: 'Business Line Leadership',
                      personasDetalle: [{
                        bl: BL_SHORT[vp.lineaNegocio] || 'BL',
                        blFull: vp.nombre,
                        persona: vp.persona,
                        clientesAsignados: vp.metricas.clientes?.asignados,
                        clientesOnboarded: vp.metricas.clientes?.onboarded,
                        pctOnboarding: vp.metricas.clientes?.pctOnboarding,
                        digitales: vp.metricas.pedidos?.digitales,
                        totales: vp.metricas.pedidos?.totales,
                        pctAdopcion: vp.metricas.pedidos?.pctAdopcion
                      }],
                      x: rect.left + rect.width / 2,
                      y: rect.bottom + 8,
                      pos: 'bottom'
                    }, 450);
                  }}
                  onMouseLeave={hidePopover}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer select-none",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700"
                  )}
                >
                  <span>{vp.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CARRIL DERECHO: Controles de vista y enfoque */}
        <div className="flex items-center gap-2 justify-self-end">
          {/* MODE TOGGLE SWITCH: Columns: All Columns | Guided */}
          <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-border select-none">
            <button
              type="button"
              onClick={() => setNavMode('all_columns')}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none",
                navMode === 'all_columns'
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Columns</span>
            </button>
            <button
              type="button"
              onClick={() => setNavMode('cascade')}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none",
                navMode === 'cascade'
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700"
              )}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Guided</span>
            </button>
          </div>
        </div>
      </div>

      {/* HORIZONTAL CASCADED COLUMNS UNIFIED WITH LAYOUTGROUP AND POPLAYOUT */}
      <LayoutGroup>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin items-stretch h-[375px] max-h-[375px] relative">
          {/* LEVEL 2: REGIONS */}
          <AnimatePresence mode="popLayout">
            {(navMode === 'all_columns' || selectedVpIds.length > 0) && (
              <motion.div
                layout
                key="dir-col"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={FLIP_TRANSITION}
                className="min-w-[180px] max-w-[245px] flex-1 h-[365px] bg-slate-100/90 dark:bg-slate-950/45 p-2 rounded-xl border border-slate-200/90 dark:border-slate-800/80 flex flex-col shadow-2xs overflow-hidden"
              >
                <div className="w-full text-[12px] font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center justify-between pb-1 border-b border-border">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    <span>Regions</span>
                  </div>
                  {selectedDirIds.length > 0 && (
                    <button onClick={handleClearDirs} className="text-[12px] text-indigo-600 hover:underline font-bold cursor-pointer">
                      Clear
                    </button>
                  )}
                </div>

                <div className="w-full flex-1 flex flex-col justify-start space-y-1 py-1.5 overflow-y-auto scrollbar-thin select-none max-h-[305px] min-h-0">
                  {directores.map((dir) => {
                    const isSelected = selectedDirIds.includes(dir.id);
                    return (
                      <div key={dir.id} className="relative group">
                        <button
                          onMouseDown={(e) => { if (e.button === 0) startDragSelect('director', dir.id, selectedDirIds, handleSetDirs); }}
                          onMouseEnter={() => handleDragEnter('director', dir.id, handleSetDirs)}
                          className={cn(
                            "w-full h-[88px] min-h-[88px] text-left p-1.5 rounded-lg border transition-colors duration-150 flex flex-col justify-between cursor-pointer text-xs select-none",
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs"
                              : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                          )}
                        >
                          {/* RENGLÓN 1: NOMBRE + INFO */}
                          <div className="flex items-center justify-between h-[18px]">
                            <span className="font-bold text-[12px] truncate">{dir.nombre}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span
                                role="button"
                                tabIndex={0}
                                onMouseEnter={(e) => handleShowLeadershipPopover(e, {
                                  title: `${dir.nombre} Region`,
                                  tipo: 'Leadership',
                                  personasDetalle: dir.personasDetalle,
                                  totales: dir.metricas.pedidos.totales,
                                  pctAdopcion: dir.metricas.pedidos.pctAdopcion
                                })}
                                onMouseLeave={() => setHoveredPopover(null)}
                                onClick={(e) => handleToggleLeadershipPopover(e, {
                                  title: `${dir.nombre} Region`,
                                  tipo: 'Leadership',
                                  personasDetalle: dir.personasDetalle,
                                  totales: dir.metricas.pedidos.totales,
                                  pctAdopcion: dir.metricas.pedidos.pctAdopcion
                                })}
                                className={cn(
                                  "p-0.5 rounded transition-colors cursor-pointer shrink-0",
                                  isSelected ? "hover:bg-indigo-700 text-indigo-200" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground hover:text-primary"
                                )}
                              >
                                <Info className="w-3 h-3" />
                              </span>
                            </div>
                          </div>

                          {/* RENGLÓN 2: PERSONA O PILLS POR LÍNEA */}
                          <div className="h-[16px] flex items-center justify-between text-[11px] overflow-hidden">
                            {dir.isSingleVp ? (
                              <span className={cn("truncate font-medium", isSelected ? "text-indigo-100" : "text-muted-foreground")}>
                                {dir.persona}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1">
                                {dir.blPills?.map(pill => (
                                  <span
                                    key={pill}
                                    className={cn(
                                      "text-[9.5px] font-black px-1 py-0 rounded border uppercase shadow-2xs leading-tight",
                                      pill === 'RMX'
                                        ? (isSelected ? "bg-sky-300 text-slate-950 border-white/40" : "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30")
                                        : pill === 'CEM'
                                        ? (isSelected ? "bg-purple-300 text-slate-950 border-white/40" : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30")
                                        : (isSelected ? "bg-amber-300 text-slate-950 border-white/40" : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30")
                                    )}
                                  >
                                    {pill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* RENGLÓN 3: 2 COMPACT LINES (CUSTOMERS & ORDERS) */}
                          <div className={cn("pt-1 border-t flex flex-col gap-0.5 text-[11px] font-sans leading-tight", isSelected ? "border-indigo-400/30 text-indigo-100" : "border-border/60 text-foreground")}>
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-baseline gap-1 truncate">
                                <span className={cn("font-bold tabular-nums", isSelected ? "text-white" : "text-foreground")}>{dir.metricas.clientes?.asignados || 0}</span>
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-indigo-200" : "text-muted-foreground")}>cust</span>
                              </div>
                              <div className="flex items-baseline gap-1 shrink-0">
                                <span className={cn("font-bold text-[10.5px] tabular-nums", isSelected ? "text-white" : "text-foreground")}>{Math.round(dir.metricas.clientes?.pctOnboarding || 0)}%</span>
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-indigo-200" : "text-muted-foreground")}>onboard</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-baseline gap-1 truncate">
                                <span className={cn("font-bold tabular-nums", isSelected ? "text-white" : "text-foreground")}>{formatCompactNumber(dir.metricas.pedidos?.totales || 0)}</span>
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-indigo-200" : "text-muted-foreground")}>orders</span>
                              </div>
                              <div className="flex items-baseline gap-1 shrink-0">
                                <span className={cn("font-bold text-[10.5px] tabular-nums", isSelected ? "text-white" : "text-foreground")}>{Math.round(dir.metricas.pedidos?.pctAdopcion || 0)}%</span>
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-indigo-200" : "text-muted-foreground")}>adopt</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LEVEL 3: MARKETS */}
          <AnimatePresence mode="popLayout">
            {(navMode === 'all_columns' || selectedDirIds.length > 0) && (
              <motion.div
                layout
                key="ger-col"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={FLIP_TRANSITION}
                className="min-w-[180px] max-w-[245px] flex-1 h-[365px] bg-slate-100/90 dark:bg-slate-950/45 p-2 rounded-xl border border-slate-200/90 dark:border-slate-800/80 flex flex-col shadow-2xs overflow-hidden"
              >
                <div className="w-full text-[12px] font-bold uppercase text-sky-600 dark:text-sky-400 flex items-center justify-between pb-1 border-b border-border">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Markets</span>
                  </div>
                  {selectedGerIds.length > 0 && (
                    <button onClick={handleClearGers} className="text-[12px] text-sky-600 hover:underline font-bold cursor-pointer">
                      Clear
                    </button>
                  )}
                </div>

                <div className="w-full flex-1 flex flex-col justify-start space-y-1 py-1.5 overflow-y-auto scrollbar-thin select-none max-h-[305px] min-h-0">
                  {gerentes.map((ger) => {
                    const isSelected = selectedGerIds.includes(ger.id);
                    return (
                      <div key={ger.id} className="relative group">
                        <button
                          onMouseDown={(e) => { if (e.button === 0) startDragSelect('gerente', ger.id, selectedGerIds, handleSetGers); }}
                          onMouseEnter={() => handleDragEnter('gerente', ger.id, handleSetGers)}
                          className={cn(
                            "w-full h-[88px] min-h-[88px] text-left p-1.5 rounded-lg border transition-colors duration-150 flex flex-col justify-between cursor-pointer text-xs select-none",
                            isSelected
                              ? "bg-sky-600 text-white border-sky-700 font-bold shadow-xs"
                              : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                          )}
                        >
                          {/* RENGLÓN 1: NOMBRE + INFO */}
                          <div className="flex items-center justify-between h-[18px]">
                            <span className="font-bold text-[12px] truncate">{ger.nombre}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span
                                role="button"
                                tabIndex={0}
                                onMouseEnter={(e) => handleShowLeadershipPopover(e, {
                                  title: `${ger.nombre} Market`,
                                  tipo: 'Managers',
                                  personasDetalle: ger.personasDetalle,
                                  totales: ger.metricas.pedidos.totales,
                                  pctAdopcion: ger.metricas.pedidos.pctAdopcion
                                })}
                                onMouseLeave={() => setHoveredPopover(null)}
                                onClick={(e) => handleToggleLeadershipPopover(e, {
                                  title: `${ger.nombre} Market`,
                                  tipo: 'Managers',
                                  personasDetalle: ger.personasDetalle,
                                  totales: ger.metricas.pedidos.totales,
                                  pctAdopcion: ger.metricas.pedidos.pctAdopcion
                                })}
                                className={cn(
                                  "p-0.5 rounded transition-colors cursor-pointer shrink-0",
                                  isSelected ? "hover:bg-sky-700 text-sky-200" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground hover:text-primary"
                                )}
                              >
                                <Info className="w-3 h-3" />
                              </span>
                            </div>
                          </div>

                          {/* RENGLÓN 2: PERSONA O PILLS POR LÍNEA */}
                          <div className="h-[16px] flex items-center justify-between text-[11px] overflow-hidden">
                            {ger.isSingleVp ? (
                              <span className={cn("truncate font-medium", isSelected ? "text-sky-100" : "text-muted-foreground")}>
                                {ger.persona}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1">
                                {ger.blPills?.map(pill => (
                                  <span
                                    key={pill}
                                    className={cn(
                                      "text-[9.5px] font-black px-1 py-0 rounded border uppercase shadow-2xs leading-tight",
                                      pill === 'RMX'
                                        ? (isSelected ? "bg-sky-300 text-slate-950 border-white/40" : "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30")
                                        : pill === 'CEM'
                                        ? (isSelected ? "bg-purple-300 text-slate-950 border-white/40" : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30")
                                        : (isSelected ? "bg-amber-300 text-slate-950 border-white/40" : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30")
                                    )}
                                  >
                                    {pill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* RENGLÓN 3: 2 COMPACT LINES (CUSTOMERS & ORDERS) */}
                          <div className={cn("pt-1 border-t flex flex-col gap-0.5 text-[11px] font-sans leading-tight", isSelected ? "border-sky-400/30 text-sky-100" : "border-border/60 text-foreground")}>
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-baseline gap-1 truncate">
                                <span className={cn("font-bold tabular-nums", isSelected ? "text-white" : "text-foreground")}>{ger.metricas.clientes?.asignados || 0}</span>
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-sky-200" : "text-muted-foreground")}>cust</span>
                              </div>
                              <div className="flex items-baseline gap-1 shrink-0">
                                <span className={cn("font-bold text-[10.5px] tabular-nums", isSelected ? "text-white" : "text-foreground")}>{Math.round(ger.metricas.clientes?.pctOnboarding || 0)}%</span>
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-sky-200" : "text-muted-foreground")}>onboard</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-baseline gap-1 truncate">
                                <span className={cn("font-bold tabular-nums", isSelected ? "text-white" : "text-foreground")}>{formatCompactNumber(ger.metricas.pedidos?.totales || 0)}</span>
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-sky-200" : "text-muted-foreground")}>orders</span>
                              </div>
                              <div className="flex items-baseline gap-1 shrink-0">
                                <span className={cn("font-bold text-[10.5px] tabular-nums", isSelected ? "text-white" : "text-foreground")}>{Math.round(ger.metricas.pedidos?.pctAdopcion || 0)}%</span>
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-sky-200" : "text-muted-foreground")}>adopt</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LEVEL 4: SALES REPRESENTATIVES */}
          <AnimatePresence mode="popLayout">
            {(navMode === 'all_columns' || selectedGerIds.length > 0) && (
              <motion.div
                layout
                key="rep-col"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={FLIP_TRANSITION}
                className="min-w-[180px] max-w-[245px] flex-1 h-[365px] bg-slate-100/90 dark:bg-slate-950/45 p-2 rounded-xl border border-slate-200/90 dark:border-slate-800/80 flex flex-col shadow-2xs overflow-hidden"
              >
                <div className="w-full text-[12px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center justify-between pb-1 border-b border-border">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Sales Reps</span>
                  </div>
                  {selectedRepIds.length > 0 && (
                    <button onClick={handleClearReps} className="text-[12px] text-emerald-600 hover:underline font-bold cursor-pointer">
                      Clear
                    </button>
                  )}
                </div>

                <div className="w-full flex-1 flex flex-col justify-start space-y-1 py-1.5 overflow-y-auto scrollbar-thin select-none max-h-[305px] min-h-0">
                  {vendedores.map(rep => {
                    const isSelected = selectedRepIds.includes(rep.id);
                    return (
                      <div key={rep.id} className="relative group">
                        <button
                          onMouseDown={(e) => { if (e.button === 0) startDragSelect('vendedor', rep.id, selectedRepIds, handleSetReps); }}
                          onMouseEnter={() => handleDragEnter('vendedor', rep.id, handleSetReps)}
                          className={cn(
                            "w-full h-[88px] min-h-[88px] text-left p-1.5 rounded-lg border transition-colors duration-150 flex flex-col justify-between cursor-pointer text-xs select-none",
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs"
                              : "bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border-border font-medium"
                          )}
                        >
                          {/* RENGLÓN 1: NOMBRE + ACCIONES (EMAIL & INFO) */}
                          <div className="flex items-center justify-between h-[18px]">
                            <span className="font-bold text-[12px] truncate">{rep.nombre}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => handleSendRepEmail(rep, e)}
                                className={cn(
                                  "p-0.5 rounded transition-colors cursor-pointer shrink-0",
                                  copiedEmailRepId === rep.id
                                    ? "bg-emerald-500 text-white"
                                    : (isSelected ? "hover:bg-emerald-700 text-emerald-200" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground hover:text-primary")
                                )}
                              >
                                {copiedEmailRepId === rep.id ? <Check className="w-3 h-3 text-emerald-100" /> : <Mail className="w-3 h-3" />}
                              </span>

                              <span
                                role="button"
                                tabIndex={0}
                                onMouseEnter={(e) => handleShowLeadershipPopover(e, {
                                  title: rep.nombre,
                                  tipo: `${rep.plaza} · ${rep.regionNombre}`,
                                  personasDetalle: [{
                                    bl: rep.bl,
                                    blFull: rep.lineaNegocio || rep.bl,
                                    persona: rep.nombre,
                                    clientesAsignados: rep.metricas.clientes?.asignados,
                                    clientesOnboarded: rep.metricas.clientes?.onboarded,
                                    pctOnboarding: rep.metricas.clientes?.pctOnboarding,
                                    digitales: rep.metricas.pedidos?.digitales,
                                    totales: rep.metricas.pedidos?.totales,
                                    pctAdopcion: rep.metricas.pedidos?.pctAdopcion
                                  }]
                                })}
                                onMouseLeave={() => setHoveredPopover(null)}
                                onClick={(e) => handleToggleLeadershipPopover(e, {
                                  title: rep.nombre,
                                  tipo: `${rep.plaza} · ${rep.regionNombre}`,
                                  personasDetalle: [{
                                    bl: rep.bl,
                                    blFull: rep.lineaNegocio || rep.bl,
                                    persona: rep.nombre,
                                    clientesAsignados: rep.metricas.clientes?.asignados,
                                    clientesOnboarded: rep.metricas.clientes?.onboarded,
                                    pctOnboarding: rep.metricas.clientes?.pctOnboarding,
                                    digitales: rep.metricas.pedidos?.digitales,
                                    totales: rep.metricas.pedidos?.totales,
                                    pctAdopcion: rep.metricas.pedidos?.pctAdopcion
                                  }]
                                })}
                                className={cn(
                                  "p-0.5 rounded transition-colors cursor-pointer shrink-0",
                                  isSelected ? "hover:bg-emerald-700 text-emerald-200" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground hover:text-primary"
                                )}
                              >
                                <Info className="w-3 h-3" />
                              </span>
                            </div>
                          </div>

                          {/* RENGLÓN 2: PLAZA Y BL MICRO-PILL */}
                          <div className="h-[16px] flex items-center justify-between gap-1 text-[11px] overflow-hidden">
                            <span className={cn("truncate font-semibold", isSelected ? "text-white/90" : "text-muted-foreground")}>{rep.plaza}</span>
                            <span
                              className={cn(
                                "text-[9.5px] font-black px-1 py-0 rounded border uppercase shrink-0 shadow-2xs leading-tight",
                                rep.bl === 'RMX'
                                  ? (isSelected ? "bg-sky-300 text-slate-950 border-white/40" : "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30")
                                  : rep.bl === 'CEM'
                                  ? (isSelected ? "bg-purple-300 text-slate-950 border-white/40" : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30")
                                  : (isSelected ? "bg-amber-300 text-slate-950 border-white/40" : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30")
                              )}
                            >
                              {rep.bl}
                            </span>
                          </div>

                          {/* RENGLÓN 3: 2 COMPACT LINES (CUSTOMERS & ORDERS) */}
                          <div className={cn("pt-1 border-t flex flex-col gap-0.5 text-[11px] font-sans leading-tight", isSelected ? "border-emerald-400/30 text-emerald-100" : "border-border/60 text-foreground")}>
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-baseline gap-1 truncate">
                                <span className={cn("font-bold tabular-nums", isSelected ? "text-white" : "text-foreground")}>{rep.metricas.clientes?.asignados || 0}</span>
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-emerald-200" : "text-muted-foreground")}>cust</span>
                              </div>
                              <div className="flex items-baseline gap-1 shrink-0">
                                <span className={cn("font-bold text-[10.5px] tabular-nums", isSelected ? "text-white" : "text-foreground")}>{Math.round(rep.metricas.clientes?.pctOnboarding || 0)}%</span>
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-emerald-200" : "text-muted-foreground")}>onboard</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-baseline gap-1 truncate">
                                <span className={cn("font-bold tabular-nums", isSelected ? "text-white" : "text-foreground")}>{formatCompactNumber(rep.metricas.pedidos?.totales || 0)}</span>
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-emerald-200" : "text-muted-foreground")}>orders</span>
                              </div>
                              <div className="flex items-baseline gap-1 shrink-0">
                                <span className={cn("font-bold text-[10.5px] tabular-nums", isSelected ? "text-white" : "text-foreground")}>{Math.round(rep.metricas.pedidos?.pctAdopcion || 0)}%</span>
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-emerald-200" : "text-muted-foreground")}>adopt</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RIGHT HAND PERMANENT TABLE / ACTION PLAN PANEL */}
          <motion.div
            layout
            transition={FLIP_TRANSITION}
            className="flex-1 min-w-[340px] h-full bg-slate-100/90 dark:bg-slate-950/45 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800/80 flex flex-col shadow-2xs overflow-hidden"
          >
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* TOP HEADER WITH INTEGRATED TAB TOGGLE */}
              <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-border shrink-0">
                <div className="inline-flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-border select-none">
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('action_plan')}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer font-bold flex items-center gap-1.5",
                      rightPanelTab === 'action_plan'
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-slate-200/60 dark:hover:bg-slate-700"
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Action Plan</span>
                    <span className={cn(
                      "text-xs px-1 py-0.2 rounded font-black",
                      rightPanelTab === 'action_plan' ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-muted-foreground"
                    )}>
                      {actionableAccountsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRightPanelTab('customer_detail')}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer font-bold flex items-center gap-1.5",
                      rightPanelTab === 'customer_detail'
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-slate-200/60 dark:hover:bg-slate-700"
                    )}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Customer Detail</span>
                    <span className={cn(
                      "text-xs px-1 py-0.2 rounded font-black",
                      rightPanelTab === 'customer_detail' ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-muted-foreground"
                    )}>
                      {sortedCartera.length}
                    </span>
                  </button>
                </div>

                {/* ACTION PLAN CONTEXT LABEL */}
                {rightPanelTab === 'action_plan' ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium pr-1">
                    <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="hidden sm:inline">Action items to reach</span>
                    <span className="font-extrabold text-foreground bg-primary/10 text-primary dark:text-sky-400 px-1.5 py-0.2 rounded border border-primary/25 text-[11px]">
                      85% adoption
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground font-medium pr-1 hidden sm:block">
                    Full Customer Portfolio
                  </div>
                )}
              </div>

              {/* PANEL BODY: ACTION PLAN OR CUSTOMER DETAIL */}
              {rightPanelTab === 'action_plan' ? (
                <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 scrollbar-thin space-y-2 pr-0.5">
                  {/* HORIZONTAL ORDER MIX BREAKDOWN BAR */}
                  {orderComposition.totalOrders > 0 && (
                    <div className="p-2 rounded-xl bg-card border border-border shadow-2xs space-y-1.5 shrink-0">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Order Mix Breakdown</span>
                        <span className="font-extrabold text-foreground tabular-nums text-[11px]">
                          {formatNumber(orderComposition.totalOrders)} orders
                        </span>
                      </div>

                      {/* Segmented Stacked Progress Bar */}
                      <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
                        {orderComposition.digitalOrders > 0 && (
                          <CustomTooltip
                            className="h-full block shrink-0 cursor-pointer"
                            style={{ width: `${orderComposition.pctDigital}%` }}
                            text={`Digital: ${formatNumber(orderComposition.digitalOrders)} orders`}
                          >
                            <div className="w-full h-full bg-emerald-500 rounded-full transition-all duration-300 min-w-[6px] hover:opacity-90" />
                          </CustomTooltip>
                        )}

                        {orderComposition.lowAdoptionOrders > 0 && (
                          <CustomTooltip
                            className="h-full block shrink-0 cursor-pointer"
                            style={{ width: `${orderComposition.pctLowAdopt}%` }}
                            text={`Low Adoption: ${formatNumber(orderComposition.lowAdoptionOrders)} orders`}
                          >
                            <div className="w-full h-full bg-amber-500 rounded-full transition-all duration-300 min-w-[6px] hover:opacity-90" />
                          </CustomTooltip>
                        )}

                        {orderComposition.notOnboardedOrders > 0 && (
                          <CustomTooltip
                            className="h-full block shrink-0 cursor-pointer"
                            style={{ width: `${orderComposition.pctNotOnb}%` }}
                            text={`Not Onboarded: ${formatNumber(orderComposition.notOnboardedOrders)} orders`}
                          >
                            <div className="w-full h-full bg-rose-500 rounded-full transition-all duration-300 min-w-[6px] hover:opacity-90" />
                          </CustomTooltip>
                        )}

                        {orderComposition.excludedOrders > 0 && (
                          <CustomTooltip
                            className="h-full block shrink-0 cursor-pointer"
                            style={{ width: `${orderComposition.pctExcluded}%` }}
                            text={`Excluded: ${formatNumber(orderComposition.excludedOrders)} orders`}
                          >
                            <div className="w-full h-full bg-slate-400 dark:bg-slate-600 rounded-full transition-all duration-300 min-w-[6px] hover:opacity-90" />
                          </CustomTooltip>
                        )}
                      </div>

                      {/* Micro-Legend */}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground flex-wrap gap-x-2 gap-y-0.5 pt-0.5">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-foreground">Digital: <b>{orderComposition.pctDigital.toFixed(0)}%</b></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-foreground">Low Adopt: <b>{orderComposition.pctLowAdopt.toFixed(0)}%</b></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span className="text-foreground">Not Onb: <b>{orderComposition.pctNotOnb.toFixed(0)}%</b></span>
                        </div>
                        {orderComposition.excludedOrders > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 shrink-0" />
                            <span className="text-foreground">Excluded: <b>{orderComposition.pctExcluded.toFixed(0)}%</b></span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {actionPlanData.visibleClients.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground bg-card rounded-xl border border-border">
                      <Sparkles className="w-6 h-6 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                      <div className="font-bold text-foreground">All accounts at 100% digital adoption!</div>
                      <div className="text-muted-foreground mt-0.5">No immediate conversion gaps in this scope.</div>
                    </div>
                  ) : (
                    <>
                      {actionPlanData.visibleClients.map((cli, idx) => {
                        const shortBl = cli.lineaNegocio === 'readymix' ? 'RMX' : cli.lineaNegocio === 'cemento' ? 'CEM' : 'AGG';
                        const isCopied = copiedId === cli.id;
                        const isLowAdoption = cli.type === 'habit_shift';

                        return (
                          <div
                            key={cli.id}
                            className="p-2.5 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-xs transition-all flex flex-col gap-1.5 text-xs"
                          >
                            {/* Card Header: Rank + Customer Name + Growth Potential */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-slate-400 shrink-0">#{idx + 1}</span>
                                  <span className="font-extrabold text-foreground truncate text-xs">
                                    {cli.nombreEmpresa}
                                  </span>
                                  {cli.esTopPareto && (
                                    <CustomTooltip text="Top 20% Pareto Customer (Volume Leader)">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 cursor-help" />
                                    </CustomTooltip>
                                  )}
                                </div>

                                {/* Commercial Context */}
                                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                                  <span className={cn(
                                    "text-[10px] font-black px-1 py-0.2 rounded border uppercase shrink-0",
                                    shortBl === 'RMX' ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30" :
                                    shortBl === 'CEM' ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30" :
                                    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                  )}>
                                    {shortBl}
                                  </span>
                                  <span className="truncate">Rep: <b>{cli.vendedorNombre}</b></span>
                                  <span className="text-slate-300 dark:text-slate-600">·</span>
                                  <span className="truncate flex items-center gap-0.5 text-slate-500 dark:text-slate-400 font-medium">
                                    <MapPin className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                    <span>{cli.plaza}</span>
                                  </span>
                                </div>
                              </div>

                              {/* Growth / Improvement Potential Badge */}
                              <div className="text-right shrink-0">
                                <CustomTooltip text={`Potential gain: ${formatNumber(cli.potentialOrdersGain)} orders/mo to convert to digital`}>
                                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1 cursor-help tabular-nums">
                                    <Zap className="w-3 h-3 text-emerald-500" />
                                    <span>+{formatNumber(cli.potentialOrdersGain)} ord/mo</span>
                                  </div>
                                </CustomTooltip>
                              </div>
                            </div>

                            {/* Direct Diagnosis & Action Row */}
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                              {exclusionManager.isExcluded(cli.id) ? (
                                <div className="flex items-center gap-1.5 text-xs min-w-0">
                                  <CustomTooltip text={`Excluded: ${exclusionManager.getReason(cli.id)}`}>
                                    <Badge variant="warning" className="text-xs py-0.2 px-1.5 font-black bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 shrink-0 cursor-default">
                                      Excluded: {exclusionManager.getReason(cli.id)}
                                    </Badge>
                                  </CustomTooltip>
                                </div>
                              ) : isLowAdoption ? (
                                <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 min-w-0">
                                  <Badge variant="warning" className="text-xs py-0.2 px-1.5 font-bold shrink-0">
                                    Low Adoption
                                  </Badge>
                                  <span className="truncate"><b>{formatNumber(cli.pedidosAnalogos)}</b> offline orders/mo</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-300 min-w-0">
                                  <Badge variant="danger" className="text-xs py-0.2 px-1.5 font-bold shrink-0">
                                    Not Onboarded
                                  </Badge>
                                  <span className="truncate"><b>{formatNumber(cli.potentialOrdersGain)}</b> orders/mo</span>
                                </div>
                              )}

                              {/* Action Buttons: Quick Copy Script + Tooltip Details */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <CustomTooltip
                                  content={
                                    <div className="p-1 space-y-1.5 min-w-[170px]">
                                      <div className="font-bold text-xs text-primary dark:text-sky-300 pb-1 border-b border-border/70 truncate">
                                        {cli.nombreEmpresa}
                                      </div>
                                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                        <span className="text-muted-foreground">Digital orders:</span>
                                        <span className="font-bold text-right text-emerald-600 dark:text-emerald-400 tabular-nums">{formatNumber(cli.pedidosDigitales)}</span>
                                        <span className="text-muted-foreground">Offline orders:</span>
                                        <span className="font-bold text-right text-foreground tabular-nums">{formatNumber(cli.pedidosAnalogos)}</span>
                                        <span className="text-muted-foreground">Adoption:</span>
                                        <span className="font-bold text-right text-primary dark:text-sky-400 tabular-nums">{cli.pctAdopcionPedidos}%</span>
                                      </div>
                                    </div>
                                  }
                                >
                                  <div className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground hover:text-foreground cursor-help">
                                    <Info className="w-3.5 h-3.5" />
                                  </div>
                                </CustomTooltip>

                                {/* Exclude / Restore button */}
                                {exclusionManager.isExcluded(cli.id) ? (
                                  <CustomTooltip text="Restore customer into active adoption targets">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        exclusionManager.includeClient(cli.id);
                                      }}
                                      className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-600 transition-colors cursor-pointer"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  </CustomTooltip>
                                ) : (
                                  <CustomTooltip text="Tag customer as Non-Viable / Exclude with reason">
                                    <button
                                      type="button"
                                      onClick={(e) => handleOpenExclusionMenu(cli, e)}
                                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground hover:text-amber-600 transition-colors cursor-pointer"
                                    >
                                      <ShieldAlert className="w-3.5 h-3.5" />
                                    </button>
                                  </CustomTooltip>
                                )}

                                <CustomTooltip text="Copy 1-on-1 coaching script for sales rep">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCopyScript(cli)}
                                    className={cn(
                                      "h-6 px-2 text-xs font-bold gap-1 cursor-pointer transition-all shadow-2xs",
                                      isCopied
                                        ? "bg-emerald-500 text-white border-emerald-500"
                                        : "hover:bg-primary hover:text-primary-foreground"
                                    )}
                                  >
                                    {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    <span>{isCopied ? 'Copied' : 'Script'}</span>
                                  </Button>
                                </CustomTooltip>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {!showAllActionPlan && actionPlanData.totalNeededCount > 15 && (
                        <button
                          type="button"
                          onClick={() => setShowAllActionPlan(true)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-border mt-1"
                        >
                          <span>Show all {actionPlanData.totalNeededCount} accounts needed for 85% target</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* EXPANDABLE TABLE FILLING FULL VERTICAL CONTAINER HEIGHT WITH NO HORIZONTAL OVERFLOW */
                <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 scrollbar-thin">
                  <table className="w-full text-left text-xs border-collapse table-fixed">
                    <thead>
                      <tr className="border-b border-border text-xs font-bold text-muted-foreground bg-slate-100 dark:bg-slate-800 sticky top-0 z-10 h-7.5 select-none">
                        <th className="py-1.5 px-0.5 w-[5%] text-center"></th>
                        <th
                          onClick={() => handleSort('nombreEmpresa')}
                          className="py-1.5 px-1.5 w-[42%] font-bold cursor-pointer hover:text-foreground transition-colors group"
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span className="truncate">Customer</span>
                            {renderSortIcon('nombreEmpresa')}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('pedidosTotales')}
                          className="py-1.5 px-1.5 w-[20%] text-right font-bold cursor-pointer hover:text-foreground transition-colors group"
                        >
                          <div className="flex items-center justify-end gap-0.5">
                            <span>Orders</span>
                            {renderSortIcon('pedidosTotales')}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('pctAdopcionPedidos')}
                          className="py-1.5 px-1.5 w-[16%] text-right font-bold cursor-pointer hover:text-foreground transition-colors group"
                        >
                          <div className="flex items-center justify-end gap-0.5">
                            <span>Adoption</span>
                            {renderSortIcon('pctAdopcionPedidos')}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('status')}
                          className="py-1.5 px-1.5 w-[17%] text-center font-bold cursor-pointer hover:text-foreground transition-colors group"
                        >
                          <div className="flex items-center justify-center gap-0.5">
                            <span>Status</span>
                            {renderSortIcon('status')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {sortedCartera.slice(0, 50).map(cli => {
                        const isExpanded = expandedRowIds.has(cli.id);
                        const shortBl = cli.lineaNegocio === 'readymix' ? 'RMX' : cli.lineaNegocio === 'cemento' ? 'CEM' : 'AGG';

                        return (
                          <React.Fragment key={cli.id}>
                            <tr className={cn("hover:bg-card transition-colors cursor-pointer", isExpanded && "bg-slate-100/80 dark:bg-slate-800")} onClick={() => toggleRowExpanded(cli.id)}>
                              <td className="py-1.5 px-0.5 text-center">
                                <button
                                  type="button"
                                  className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground"
                                >
                                  {isExpanded ? <ChevronDown className="w-3 h-3 text-primary" /> : <ChevronRight className="w-3 h-3" />}
                                </button>
                              </td>
                              <td className="py-1.5 px-1.5 min-w-0">
                                <div className="font-bold text-foreground flex items-center gap-1 text-xs truncate">
                                  {cli.esTopPareto && (
                                    <CustomTooltip text="Top 20% Pareto Customer (Volume Leader)">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 cursor-help" />
                                    </CustomTooltip>
                                  )}
                                  <span className="truncate">{cli.nombreEmpresa}</span>
                                </div>
                                <div className="mt-0.5 flex items-center">
                                  <span className={cn(
                                    "text-[10px] font-black px-1 py-0.2 rounded border uppercase shrink-0",
                                    shortBl === 'RMX' ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30" :
                                    shortBl === 'CEM' ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30" :
                                    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                  )}>
                                    {shortBl}
                                  </span>
                                </div>
                              </td>
                              <td className="py-1.5 px-1.5 text-right font-bold tabular-nums text-foreground text-xs whitespace-nowrap">
                                <CustomTooltip text={`${formatNumber(cli.pedidosDigitales)} online · ${formatNumber(cli.pedidosAnalogos)} offline`}>
                                  <span>{formatCompactNumber(cli.pedidosTotales)}</span>
                                </CustomTooltip>
                              </td>
                              <td className="py-1.5 px-1.5 text-right font-bold tabular-nums text-xs whitespace-nowrap">
                                <span className={cn(
                                  cli.pctAdopcionPedidos >= 90 ? "text-emerald-600 dark:text-emerald-400" :
                                  cli.pctAdopcionPedidos >= 50 ? "text-amber-600 dark:text-amber-400" :
                                  "text-rose-600 dark:text-rose-400"
                                )}>
                                  {cli.pctAdopcionPedidos.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-1.5 px-1.5 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1">
                                  {exclusionManager.isExcluded(cli.id) ? (
                                    <div className="flex items-center gap-1">
                                      <CustomTooltip text={`Excluded: ${exclusionManager.getReason(cli.id)}`}>
                                        <Badge variant="warning" className="text-[10px] py-0.2 px-1.5 font-black bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 cursor-default">
                                          Excluded
                                        </Badge>
                                      </CustomTooltip>
                                      <CustomTooltip text="Restore customer into active adoption targets">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            exclusionManager.includeClient(cli.id);
                                          }}
                                          className="p-0.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-600 transition-colors cursor-pointer"
                                        >
                                          <RotateCcw className="w-3 h-3" />
                                        </button>
                                      </CustomTooltip>
                                    </div>
                                  ) : (
                                    <>
                                      {!cli.estaIncorporado ? (
                                        <Badge variant="danger" className="text-xs py-0.5 px-1.5 font-bold">
                                          Pending
                                        </Badge>
                                      ) : cli.pedidosDigitales > 0 ? (
                                        <Badge variant="success" className="text-xs py-0.5 px-1.5 font-bold">
                                          Active
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary" className="text-xs py-0.5 px-1.5 font-bold bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30">
                                          Onboarded
                                        </Badge>
                                      )}
                                      <CustomTooltip text="Tag customer as Non-Viable / Exclude with reason">
                                        <button
                                          type="button"
                                          onClick={(e) => handleOpenExclusionMenu(cli, e)}
                                          className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                                        >
                                          <ShieldAlert className="w-3 h-3" />
                                        </button>
                                      </CustomTooltip>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* EXPANDABLE DRAWER ROW WITH HIGH-CONTRAST VISUAL MICRO-PILLS */}
                            {isExpanded && (
                              <tr className="bg-slate-100/90 dark:bg-slate-950 border-b border-border">
                                <td colSpan={5} className="p-2.5">
                                  <div className="bg-card p-2.5 rounded-lg border border-border shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
                                    {/* Digital Channel Pills */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-bold text-muted-foreground uppercase mr-1">Digital:</span>
                                      <Badge variant="info" className="gap-1 text-xs font-bold py-0.5 px-2 bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30">
                                        <Laptop className="w-3 h-3 text-sky-500" />
                                        <span>Web: <b>{cli.pedidosWeb}</b></span>
                                      </Badge>
                                      <Badge variant="info" className="gap-1 text-xs font-bold py-0.5 px-2 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30">
                                        <Smartphone className="w-3 h-3 text-indigo-500" />
                                        <span>App: <b>{cli.pedidosApp}</b></span>
                                      </Badge>
                                      <Badge variant="info" className="gap-1 text-xs font-bold py-0.5 px-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                                        <Server className="w-3 h-3 text-emerald-500" />
                                        <span>EDI: <b>{cli.pedidosEdi}</b></span>
                                      </Badge>
                                    </div>

                                    {/* Offline Pill */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-bold text-muted-foreground uppercase mr-1">Offline:</span>
                                      <Badge variant="outline" className="gap-1 text-xs font-bold py-0.5 px-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700">
                                        <PhoneCall className="w-3 h-3 text-amber-500" />
                                        <span>Phone: <b>{cli.pedidosAnalogos}</b></span>
                                      </Badge>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>

                    {/* FOOTER ROW FOR WEIGHTED TOTALS */}
                    {totalesCartera && (
                      <tfoot className="sticky bottom-0 z-10 bg-slate-200 dark:bg-slate-800 font-bold border-t-2 border-primary/40 text-foreground text-xs shadow-md">
                        <tr>
                          <td colSpan={2} className="py-1.5 px-1.5">
                            <div className="font-black uppercase text-xs text-primary truncate">
                              TOTAL ({formatNumber(totalesCartera.totalClientes)})
                            </div>
                          </td>
                          <td className="py-1.5 px-1.5 text-right tabular-nums text-foreground font-black text-xs whitespace-nowrap">
                            <CustomTooltip text={`${formatNumber(totalesCartera.totalDigitales)} online · ${formatNumber(totalesCartera.totalAnalogos)} offline`}>
                              <span>{formatCompactNumber(totalesCartera.totalPedidos)}</span>
                            </CustomTooltip>
                          </td>
                          <td className="py-1.5 px-1.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-black text-xs whitespace-nowrap">
                            {totalesCartera.pctAdopcionPonderado.toFixed(1)}%
                          </td>
                          <td className="py-1.5 px-1.5"></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </LayoutGroup>

      {/* ZERO-CLIPPING VIEWPORT FIXED POPOVER */}
      {hoveredPopover && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredPopover.x}px`,
            top: `${hoveredPopover.y}px`,
            transform: hoveredPopover.pos === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)'
          }}
          className="z-[9999] w-84 max-h-[85vh] overflow-y-auto scrollbar-thin p-3.5 bg-card/98 text-foreground dark:bg-slate-900/98 dark:text-slate-100 rounded-xl shadow-2xl border-2 border-slate-300 dark:border-slate-600 pointer-events-none backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150 font-sans select-none"
        >
          <div className="font-black text-primary dark:text-sky-300 uppercase tracking-wider text-[12px] pb-2 border-b border-border/80 flex items-center justify-between">
            <span className="font-bold">{hoveredPopover.title}</span>
            <span className="text-muted-foreground font-semibold text-[12px]">{hoveredPopover.tipo}</span>
          </div>

          <div className="space-y-2.5 pt-2.5 divide-y divide-border/50">
            {hoveredPopover.personasDetalle?.map((p, idx) => (
              <div key={p.bl + idx} className={cn("space-y-1 text-[12px]", idx > 0 ? "pt-2" : "")}>
                {/* Header: Business Line & Persona */}
                <div className="flex items-center justify-between gap-1.5 font-bold">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn(
                      "text-[10px] font-black px-1 py-0.2 rounded border uppercase shrink-0",
                      p.bl === 'RMX' ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30" :
                      p.bl === 'CEM' ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30" :
                      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    )}>
                      {p.blFull || p.bl}
                    </span>
                    <span className="truncate text-foreground text-[12px]">{p.persona}</span>
                  </div>
                </div>

                {/* Metrics Details */}
                <div className="grid grid-cols-2 gap-2 text-[12px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-border/60">
                  <div>
                    <div className="text-muted-foreground font-semibold text-xs">Onboarded Customers</div>
                    <div className="font-bold text-foreground text-xs tabular-nums">
                      {formatNumber(p.clientesOnboarded || 0)} / {formatNumber(p.clientesAsignados || 0)}
                      <span className="text-emerald-600 dark:text-emerald-400 font-black ml-1">
                        (<b>{formatPct(p.pctOnboarding || 0)}</b>)
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground font-semibold text-xs">Orders Adoption</div>
                    <div className="font-bold text-foreground text-xs tabular-nums">
                      {formatNumber(p.digitales || 0)} / {formatNumber(p.totales || 0)}
                      <span className="text-indigo-600 dark:text-indigo-400 font-black ml-1">
                        (<b>{formatPct(p.pctAdopcion || 0)}</b>)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXCLUSION / OPT-OUT REASONS DROPDOWN MODAL POPOVER WITH OUTSIDE CLICK BACKDROP */}
      {exclusionMenuClient && (
        <>
          {/* Transparent full-viewport backdrop to close immediately on click outside */}
          <div
            className="fixed inset-0 z-[99998] cursor-default bg-black/5 dark:bg-black/20"
            onClick={(e) => {
              e.stopPropagation();
              setExclusionMenuClient(null);
            }}
          />

          <div
            style={{
              position: 'fixed',
              left: `${exclusionMenuClient.x}px`,
              top: `${exclusionMenuClient.y}px`
            }}
            className="z-[99999] w-[235px] p-1.5 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md text-foreground rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in-0 zoom-in-95 duration-100 font-sans select-none"
          >
            {/* Clean Header */}
            <div className="px-2 py-1 pb-1.5 border-b border-border/60 mb-1 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Exclude Account</span>
                <span className="text-xs font-bold truncate block text-slate-800 dark:text-slate-200">{exclusionMenuClient.nombreEmpresa}</span>
              </div>
              <button
                type="button"
                onClick={() => setExclusionMenuClient(null)}
                className="text-xs text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clean, icon-driven Reasons List */}
            <div className="space-y-0.5">
              {EXCLUSION_REASONS.map((r) => {
                const reasonLabel = typeof r === 'object' ? r.label : r;
                const icon = typeof r === 'object' ? r.icon : '🚫';
                return (
                  <button
                    key={reasonLabel}
                    type="button"
                    onClick={() => handleSelectExclusionReason(r)}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 group"
                  >
                    <span className="text-xs shrink-0">{icon}</span>
                    <span className="truncate flex-1">{reasonLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </Card>
  );
});

