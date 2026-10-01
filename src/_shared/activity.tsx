import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { usePersistedState, type PersistenceStatus } from './use-persisted-state';

type ActivityState = {
  lastRoute: string | null;
  lastLabel: string | null;
  lastPokemonSlug: string | null;
  recentPokemonSlugs: string[];
  updatedAt: number | null;
};

type RecordActivityInput = {
  route: string;
  label: string;
  pokemonSlug?: string | null;
};

type ActivityContextValue = ActivityState & {
  isReady: boolean;
  persistenceStatus: PersistenceStatus;
  persistenceError: string | null;
  retryPersistence: () => void;
  recordActivity: (input: RecordActivityInput) => void;
};

const STORAGE_KEY = 'pokedex.activity.v1';
const RECENT_POKEMON_LIMIT = 8;

const defaultState: ActivityState = {
  lastRoute: null,
  lastLabel: null,
  lastPokemonSlug: null,
  recentPokemonSlugs: [],
  updatedAt: null,
};

const ActivityContext = createContext<ActivityContextValue | null>(null);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const {
    state,
    setState,
    isReady,
    persistenceStatus,
    persistenceError,
    retryPersistence,
  } = usePersistedState(STORAGE_KEY, defaultState, parseActivityState);

  const recordActivity = useCallback(({ label, pokemonSlug, route }: RecordActivityInput) => {
    setState((current) => {
      const normalizedPokemon = pokemonSlug ?? undefined;
      const recentPokemonSlugs = normalizedPokemon
        ? [
            normalizedPokemon,
            ...current.recentPokemonSlugs.filter((entry) => entry !== normalizedPokemon),
          ].slice(0, RECENT_POKEMON_LIMIT)
        : current.recentPokemonSlugs;

      return {
        lastRoute: route,
        lastLabel: label,
        lastPokemonSlug: normalizedPokemon ?? current.lastPokemonSlug,
        recentPokemonSlugs,
        updatedAt: Date.now(),
      };
    });
  }, []);

  const value = useMemo<ActivityContextValue>(
    () => ({
      ...state,
      isReady,
      persistenceStatus,
      persistenceError,
      retryPersistence,
      recordActivity,
    }),
    [
      isReady,
      persistenceError,
      persistenceStatus,
      recordActivity,
      retryPersistence,
      state,
    ],
  );

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const context = useContext(ActivityContext);

  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }

  return context;
}

export function formatActivityTime(updatedAt: number | null) {
  if (!updatedAt) {
    return 'Aucune activite recente';
  }

  const delta = Math.max(0, Date.now() - updatedAt);
  const minutes = Math.floor(delta / 60000);

  if (minutes < 1) {
    return 'Il y a quelques secondes';
  }

  if (minutes < 60) {
    return `Il y a ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Il y a ${hours} h`;
  }

  const days = Math.floor(hours / 24);
  return `Il y a ${days} j`;
}

function parseActivityState(rawValue: string): ActivityState {
  const parsed = JSON.parse(rawValue) as Partial<ActivityState>;

  return {
    lastRoute: typeof parsed.lastRoute === 'string' ? parsed.lastRoute : null,
    lastLabel: typeof parsed.lastLabel === 'string' ? parsed.lastLabel : null,
    lastPokemonSlug:
      typeof parsed.lastPokemonSlug === 'string' ? parsed.lastPokemonSlug : null,
    recentPokemonSlugs: Array.isArray(parsed.recentPokemonSlugs)
      ? parsed.recentPokemonSlugs
          .filter((entry): entry is string => typeof entry === 'string')
          .slice(0, RECENT_POKEMON_LIMIT)
      : [],
    updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : null,
  };
}
