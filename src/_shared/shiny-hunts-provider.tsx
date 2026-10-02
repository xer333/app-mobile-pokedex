import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';

import { usePersistedState, type PersistenceStatus } from './use-persisted-state';
import {
  adjustCurrentSegment,
  createShinyHunt,
  finishShinyHunt,
  isShinyHunt,
  startHuntSegment,
  type ShinyHunt,
} from './shiny-hunts';
import type { PokemonSpecimenOrigin } from './specimens';
import { useAdventure } from './adventure';
import { isCompatibleSave, migrateRecordsToSaves } from './record-save';
import { backupStorageKeys } from './backup-storage-keys';

type ShinyHuntsState = { hunts: ShinyHunt[] };
type ShinyHuntsContextValue = ShinyHuntsState & {
  isReady: boolean;
  isSynced: boolean;
  persistenceStatus: PersistenceStatus;
  persistenceError: string | null;
  retryPersistence: () => void;
  addHunt: (targetSlug: string, gameId: string, method: string, odds: number | null) => string;
  adjustAttempts: (huntId: string, delta: number) => void;
  changeMethod: (huntId: string, method: string, odds: number | null) => void;
  togglePause: (huntId: string) => void;
  markFound: (huntId: string, formSlug: string, origin: PokemonSpecimenOrigin) => void;
  ensureFoundHunt: (foundHunt: ShinyHunt) => void;
  removeHunt: (huntId: string) => void;
  replaceHunts: (hunts: ShinyHunt[]) => void;
  assignHuntToSave: (huntId: string, saveId: string | null) => void;
  restoreHuntSnapshot: (snapshot: ShinyHunt) => void;
};

const ShinyHuntsContext = createContext<ShinyHuntsContextValue | null>(null);

export function ShinyHuntsProvider({ children }: { children: ReactNode }) {
  const adventure = useAdventure();
  const persistence = usePersistedState<ShinyHuntsState>(
    backupStorageKeys.shinyHunts,
    { hunts: [] },
    (rawValue) => {
      const parsed = JSON.parse(rawValue) as Partial<ShinyHuntsState>;
      return { hunts: Array.isArray(parsed.hunts) ? parsed.hunts.filter(isShinyHunt) : [] };
    },
  );

  useEffect(() => {
    if (!persistence.isReady || !adventure.isReady) return;
    persistence.setState((current) => {
      const hunts = migrateRecordsToSaves(current.hunts, adventure.saves);
      return hunts === current.hunts ? current : { ...current, hunts };
    });
  }, [adventure.isReady, adventure.saves, persistence.isReady, persistence.setState]);

  const addHunt = useCallback((targetSlug: string, gameId: string, method: string, odds: number | null) => {
    const hunt = createShinyHunt(targetSlug, gameId, method, odds, Date.now(),
      gameId === adventure.activeGameId ? adventure.activeSaveId : undefined);
    persistence.setState((current) => ({ ...current, hunts: [hunt, ...current.hunts] }));
    return hunt.id;
  }, [adventure.activeGameId, adventure.activeSaveId, persistence.setState]);

  const assignHuntToSave = useCallback((huntId: string, saveId: string | null) => {
    persistence.setState((current) => ({
      ...current,
      hunts: current.hunts.map((hunt) => hunt.id === huntId
        && isCompatibleSave(saveId, hunt.gameId, adventure.saves)
        ? { ...hunt, saveId } : hunt),
    }));
  }, [adventure.saves, persistence.setState]);

  const updateHunt = useCallback((huntId: string, update: (hunt: ShinyHunt) => ShinyHunt) => {
    persistence.setState((current) => ({
      ...current,
      hunts: current.hunts.map((hunt) => hunt.id === huntId ? update(hunt) : hunt),
    }));
  }, [persistence.setState]);

  const adjustAttempts = useCallback((huntId: string, delta: number) => {
    updateHunt(huntId, (hunt) => adjustCurrentSegment(hunt, delta));
  }, [updateHunt]);

  const changeMethod = useCallback((huntId: string, method: string, odds: number | null) => {
    updateHunt(huntId, (hunt) => startHuntSegment(hunt, method, odds));
  }, [updateHunt]);

  const togglePause = useCallback((huntId: string) => {
    updateHunt(huntId, (hunt) => hunt.status === 'found'
      ? hunt
      : { ...hunt, status: hunt.status === 'paused' ? 'active' : 'paused' });
  }, [updateHunt]);

  const markFound = useCallback((huntId: string, formSlug: string, origin: PokemonSpecimenOrigin) => {
    updateHunt(huntId, (hunt) => finishShinyHunt(hunt, formSlug, origin));
  }, [updateHunt]);

  const removeHunt = useCallback((huntId: string) => {
    persistence.setState((current) => ({
      ...current,
      hunts: current.hunts.filter((hunt) => hunt.id !== huntId),
    }));
  }, [persistence.setState]);

  const ensureFoundHunt = useCallback((foundHunt: ShinyHunt) => {
    persistence.setState((current) => {
      const existing = current.hunts.find((hunt) => hunt.id === foundHunt.id);
      if (existing?.status === 'found' && (
        !foundHunt.saveId || existing.saveId === foundHunt.saveId
      )) return current;
      const completed = existing && foundHunt.saveId === undefined && existing.saveId !== undefined
        ? { ...foundHunt, saveId: existing.saveId }
        : foundHunt;
      return {
        ...current,
        hunts: existing
          ? current.hunts.map((hunt) => hunt.id === foundHunt.id ? completed : hunt)
          : [completed, ...current.hunts],
      };
    });
  }, [persistence.setState]);

  const restoreHuntSnapshot = useCallback((snapshot: ShinyHunt) => {
    persistence.setState((current) => ({
      ...current,
      hunts: current.hunts.some((hunt) => hunt.id === snapshot.id)
        ? current.hunts.map((hunt) => hunt.id === snapshot.id ? snapshot : hunt)
        : [snapshot, ...current.hunts],
    }));
  }, [persistence.setState]);

  const value = useMemo<ShinyHuntsContextValue>(() => ({
    ...persistence.state,
    isReady: persistence.isReady,
    isSynced: persistence.isSynced,
    persistenceStatus: persistence.persistenceStatus,
    persistenceError: persistence.persistenceError,
    retryPersistence: persistence.retryPersistence,
    addHunt,
    adjustAttempts,
    changeMethod,
    togglePause,
    markFound,
    ensureFoundHunt,
    restoreHuntSnapshot,
    removeHunt,
    replaceHunts: (hunts) => persistence.setState({ hunts }),
    assignHuntToSave,
  }), [addHunt, adjustAttempts, assignHuntToSave, changeMethod, ensureFoundHunt, markFound, persistence.isReady, persistence.isSynced, persistence.persistenceError, persistence.persistenceStatus, persistence.retryPersistence, persistence.setState, persistence.state, removeHunt, restoreHuntSnapshot, togglePause]);

  return <ShinyHuntsContext.Provider value={value}>{children}</ShinyHuntsContext.Provider>;
}

export function useShinyHunts() {
  const context = useContext(ShinyHuntsContext);
  if (!context) throw new Error('useShinyHunts must be used within a ShinyHuntsProvider');
  return context;
}
