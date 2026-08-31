/**
 * EXCLUSION MANAGER FOR NON-VIABLE DIGITAL ADOPTION ACCOUNTS
 * Persists custom client exclusions with commercial reasons to localStorage
 */

const STORAGE_KEY = 'dashboard_cx_excluded_clients_v1';

export const EXCLUSION_REASONS = [
  { id: 'procurement', label: 'Procurement Policy', icon: '🏛️' },
  { id: 'refusal', label: 'Client Refusal', icon: '🚫' },
  { id: 'edi', label: 'Requires EDI / ERP', icon: '🔌' },
  { id: 'dispute', label: 'Commercial Dispute', icon: '⚖️' },
  { id: 'field', label: 'Tech / Field Barrier', icon: '👷' },
  { id: 'other', label: 'Other Reason', icon: '📝' }
];

class ExclusionManager {
  constructor() {
    this.listeners = new Set();
    this.exclusions = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.exclusions));
    } catch (e) {
      console.warn('Could not save exclusions to localStorage', e);
    }
    this._notify();
  }

  _notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this.exclusions);
      } catch (e) {
        console.error(e);
      }
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getExclusions() {
    return this.exclusions;
  }

  getExcludedCount() {
    return Object.keys(this.exclusions).length;
  }

  isExcluded(clientId) {
    return Boolean(this.exclusions[clientId]);
  }

  getReason(clientId) {
    return this.exclusions[clientId]?.reason || null;
  }

  getDetails(clientId) {
    return this.exclusions[clientId] || null;
  }

  excludeClient(clientId, reason, note = '') {
    const reasonLabel = typeof reason === 'object' && reason !== null ? (reason.label || reason.id) : (reason || EXCLUSION_REASONS[0].label);
    this.exclusions = {
      ...this.exclusions,
      [clientId]: {
        reason: reasonLabel,
        note: note || '',
        excludedAt: new Date().toISOString()
      }
    };
    this._save();
  }

  includeClient(clientId) {
    if (this.exclusions[clientId]) {
      const next = { ...this.exclusions };
      delete next[clientId];
      this.exclusions = next;
      this._save();
    }
  }

  toggleClient(clientId, reason) {
    if (this.isExcluded(clientId)) {
      this.includeClient(clientId);
    } else {
      this.excludeClient(clientId, reason);
    }
  }

  clearAll() {
    this.exclusions = {};
    this._save();
  }
}

export const exclusionManager = new ExclusionManager();
