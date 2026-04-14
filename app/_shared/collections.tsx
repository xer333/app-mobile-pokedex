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

type CollectionsState = {
  favorites: string[];
  team: string[];
  comparisonTarget: string | null;
};

type CollectionsContextValue = CollectionsState & {
  isReady: boolean;
  isFavorite: (slug: string) => boolean;
  isInTeam: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  toggleTeamMember: (slug: string) => boolean;
  setComparisonTarget: (slug: string | null) => void;
  clearComparisonTarget: () => void;
};

const STORAGE_KEY = 'pokedex.collections.v1';
const TEAM_LIMIT = 6;
const defaultState: CollectionsState = {
  favorites: [],
  team: [],
  comparisonTarget: null,
};

const CollectionsContext = createContext<CollectionsContextValue | null>(null);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CollectionsState>(defaultState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((rawValue) => {
        if (!rawValue) {
          return;
        }

        const parsed = JSON.parse(rawValue) as Partial<CollectionsState>;
        setState({
          favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
          team: Array.isArray(parsed.team) ? parsed.team.slice(0, TEAM_LIMIT) : [],
          comparisonTarget: typeof parsed.comparisonTarget === 'string' ? parsed.comparisonTarget : null,
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

  const isFavorite = useCallback((slug: string) => state.favorites.includes(slug), [state.favorites]);
  const isInTeam = useCallback((slug: string) => state.team.includes(slug), [state.team]);

  const toggleFavorite = useCallback((slug: string) => {
    setState((current) => ({
      ...current,
      favorites: current.favorites.includes(slug)
        ? current.favorites.filter((entry) => entry !== slug)
        : [...current.favorites, slug],
    }));
  }, []);

  const toggleTeamMember = useCallback((slug: string) => {
    let didUpdate = false;

    setState((current) => {
      if (current.team.includes(slug)) {
        didUpdate = true;
        return {
          ...current,
          team: current.team.filter((entry) => entry !== slug),
        };
      }

      if (current.team.length >= TEAM_LIMIT) {
        return current;
      }

      didUpdate = true;
      return {
        ...current,
        team: [...current.team, slug],
      };
    });

    return didUpdate;
  }, []);

  const setComparisonTarget = useCallback((slug: string | null) => {
    setState((current) => ({
      ...current,
      comparisonTarget: slug,
    }));
  }, []);

  const clearComparisonTarget = useCallback(() => {
    setComparisonTarget(null);
  }, [setComparisonTarget]);

  const value = useMemo<CollectionsContextValue>(
    () => ({
      ...state,
      isReady,
      isFavorite,
      isInTeam,
      toggleFavorite,
      toggleTeamMember,
      setComparisonTarget,
      clearComparisonTarget,
    }),
    [
      clearComparisonTarget,
      isFavorite,
      isInTeam,
      isReady,
      setComparisonTarget,
      state,
      toggleFavorite,
      toggleTeamMember,
    ],
  );

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}

export function useCollections() {
  const context = useContext(CollectionsContext);

  if (!context) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }

  return context;
}

export const teamLimit = TEAM_LIMIT;
