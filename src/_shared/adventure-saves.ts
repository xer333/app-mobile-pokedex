export type AdventureRules = {
  allowTrades: boolean;
  allowTransfers: boolean;
};

export type AdventureSave = {
  id: string;
  gameId: string;
  name: string;
  createdAt: number;
  dlcIds: string[];
  rules: AdventureRules;
  registeredSlugs: string[];
  archivedAt?: number;
};

export type AdventureState = {
  activeGameId: string;
  activeSaveId: string;
  saves: AdventureSave[];
};

export function legacySaveId(gameId: string) {
  return `save-legacy-${gameId}`;
}

export function createLegacyAdventure(gameId: string): AdventureState {
  const save: AdventureSave = {
    id: legacySaveId(gameId),
    gameId,
    name: 'Partie principale',
    createdAt: 0,
    dlcIds: [],
    rules: { allowTrades: true, allowTransfers: true },
    registeredSlugs: [],
  };
  return { activeGameId: gameId, activeSaveId: save.id, saves: [save] };
}

export function createAdventureSave(gameId: string, name: string, now = Date.now()): AdventureSave {
  return {
    id: `save-${now}-${Math.random().toString(36).slice(2, 8)}`,
    gameId,
    name: name.trim() || 'Nouvelle partie',
    createdAt: now,
    dlcIds: [],
    rules: { allowTrades: true, allowTransfers: true },
    registeredSlugs: [],
  };
}

export function activateAdventureGame(state: AdventureState, gameId: string): AdventureState {
  const existing = state.saves.find((save) => save.gameId === gameId && save.archivedAt === undefined);
  const save = existing ?? createAdventureSave(gameId, 'Partie principale');
  return {
    activeGameId: gameId,
    activeSaveId: save.id,
    saves: existing ? state.saves : [...state.saves, save],
  };
}

export function activateAdventureSave(state: AdventureState, saveId: string): AdventureState {
  const save = state.saves.find((entry) => entry.id === saveId && entry.archivedAt === undefined);
  return save ? { ...state, activeSaveId: save.id, activeGameId: save.gameId } : state;
}

export function archiveAdventureSave(state: AdventureState, saveId: string, now = Date.now()): AdventureState {
  const save = state.saves.find((entry) => entry.id === saveId);
  if (!save || save.archivedAt !== undefined) return state;
  const remaining = state.saves.filter((entry) => entry.id !== saveId && entry.archivedAt === undefined);
  if (!remaining.length) return state;
  const nextActive = saveId === state.activeSaveId
    ? remaining.find((entry) => entry.gameId === save.gameId) ?? remaining[0]
    : null;
  return {
    activeGameId: nextActive?.gameId ?? state.activeGameId,
    activeSaveId: nextActive?.id ?? state.activeSaveId,
    saves: state.saves.map((entry) => entry.id === saveId ? { ...entry, archivedAt: now } : entry),
  };
}

export function restoreAdventureSave(state: AdventureState, saveId: string): AdventureState {
  const save = state.saves.find((entry) => entry.id === saveId && entry.archivedAt !== undefined);
  if (!save) return state;
  return {
    activeGameId: save.gameId,
    activeSaveId: save.id,
    saves: state.saves.map((entry) => {
      if (entry.id !== saveId) return entry;
      const { archivedAt: _archivedAt, ...restored } = entry;
      return restored;
    }),
  };
}

export function parseAdventureState(rawValue: string): AdventureState {
  const parsed: unknown = JSON.parse(rawValue);
  if (!isRecord(parsed)) return createLegacyAdventure('national');
  if (parsed.saves !== undefined && (
    !Array.isArray(parsed.saves) || parsed.saves.length === 0
    || !parsed.saves.every(isAdventureSave)
    || new Set(parsed.saves.map((save: AdventureSave) => save.id)).size !== parsed.saves.length
  )) {
    throw new Error('Parties locales invalides.');
  }
  if (Array.isArray(parsed.saves) && parsed.saves.length > 0
    && parsed.saves.every(isAdventureSave)) {
    const saves = parsed.saves as AdventureSave[];
    const available = saves.filter((save) => save.archivedAt === undefined);
    if (!available.length) throw new Error('Toutes les parties sont archivées.');
    const active = available.find((save) => save.id === parsed.activeSaveId) ?? available[0];
    return { activeGameId: active.gameId, activeSaveId: active.id, saves };
  }
  return createLegacyAdventure(typeof parsed.activeGameId === 'string'
    ? parsed.activeGameId : 'national');
}

export function isAdventureSave(value: unknown): value is AdventureSave {
  if (!isRecord(value) || !isRecord(value.rules)) return false;
  return isNonemptyString(value.id) && isNonemptyString(value.gameId)
    && isNonemptyString(value.name)
    && typeof value.createdAt === 'number' && Number.isFinite(value.createdAt)
    && Array.isArray(value.dlcIds) && value.dlcIds.every(isNonemptyString)
    && new Set(value.dlcIds).size === value.dlcIds.length
    && typeof value.rules.allowTrades === 'boolean'
    && typeof value.rules.allowTransfers === 'boolean'
    && Array.isArray(value.registeredSlugs)
    && value.registeredSlugs.every(isNonemptyString)
    && new Set(value.registeredSlugs).size === value.registeredSlugs.length
    && (value.archivedAt === undefined || (typeof value.archivedAt === 'number'
      && Number.isFinite(value.archivedAt) && value.archivedAt >= 0));
}

function isRecord(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}
