import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

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

type ShinyHuntsState = { hunts: ShinyHunt[] };
type ShinyHuntsContextValue = ShinyHuntsState & {
  isReady: boolean;
  persistenceStatus: PersistenceStatus;
  persistenceError: string | null;
  retryPersistence: () => void;
  addHunt: (targetSlug: string, gameId: string, method: string, odds: number | null) => string;
  adjustAttempts: (huntId: string, delta: number) => void;
  changeMethod: (huntId: string, method: string, odds: number | null) => void;
  togglePause: (huntId: string) => void;
  markFound: (huntId: string, formSlug: string, origin: PokemonSpecimenOrigin) => void;
  removeHunt: (huntId: string) => void;
};

const ShinyHuntsContext = createContext<ShinyHuntsContextValue | null>(null);

export function ShinyHuntsProvider({ children }: { children: ReactNode }) {
  const persistence = usePersistedState<ShinyHuntsState>(
    'pokedex.shiny-hunts.v1',
    { hunts: [] },
    (rawValue) => {
      const parsed = JSON.parse(rawValue) as Partial<ShinyHuntsState>;
      return { hunts: Array.isArray(parsed.hunts) ? parsed.hunts.filter(isShinyHunt) : [] };
    },
  );

  const addHunt = useCallback((targetSlug: string, gameId: string, method: string, odds: number | null) => {
    const hunt = createShinyHunt(targetSlug, gameId, method, odds);
    persistence.setState((current) => ({ ...current, hunts: [hunt, ...current.hunts] }));
    return hunt.id;
  }, [persistence.setState]);

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

  const value = useMemo<ShinyHuntsContextValue>(() => ({
    ...persistence.state,
    isReady: persistence.isReady,
    persistenceStatus: persistence.persistenceStatus,
    persistenceError: persistence.persistenceError,
    retryPersistence: persistence.retryPersistence,
    addHunt,
    adjustAttempts,
    changeMethod,
    togglePause,
    markFound,
    removeHunt,
  }), [addHunt, adjustAttempts, changeMethod, markFound, persistence.isReady, persistence.persistenceError, persistence.persistenceStatus, persistence.retryPersistence, persistence.state, removeHunt, togglePause]);

  return <ShinyHuntsContext.Provider value={value}>{children}</ShinyHuntsContext.Provider>;
}

export function useShinyHunts() {
  const context = useContext(ShinyHuntsContext);
  if (!context) throw new Error('useShinyHunts must be used within a ShinyHuntsProvider');
  return context;
}
