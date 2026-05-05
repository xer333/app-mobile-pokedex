import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

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
  const [state, setState] = useState<ActivityState>(defaultState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((rawValue) => {
        if (!rawValue) {
          return;
        }

        const parsed = JSON.parse(rawValue) as Partial<ActivityState>;
        setState({
          lastRoute: typeof parsed.lastRoute === 'string' ? parsed.lastRoute : null,
          lastLabel: typeof parsed.lastLabel === 'string' ? parsed.lastLabel : null,
          lastPokemonSlug:
            typeof parsed.lastPokemonSlug === 'string' ? parsed.lastPokemonSlug : null,
          recentPokemonSlugs: Array.isArray(parsed.recentPokemonSlugs)
            ? parsed.recentPokemonSlugs.slice(0, RECENT_POKEMON_LIMIT)
            : [],
          updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : null,
        });
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      // No-op: if persistence fails, the in-memory state still works.
    });
  }, [isReady, state]);

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
      recordActivity,
    }),
    [isReady, recordActivity, state],
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
