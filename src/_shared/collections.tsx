import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { usePersistedState, type PersistenceStatus } from './use-persisted-state';
import {
  createPokemonSpecimen,
  isPokemonSpecimen,
  type NewPokemonSpecimen,
  type PokemonSpecimen,
} from './specimens';
import { mergeSpecimens } from './collection-backup';

type CollectionsState = {
  favorites: string[];
  team: string[];
  comparisonTarget: string | null;
  specimens: PokemonSpecimen[];
};

type CollectionsContextValue = CollectionsState & {
  isReady: boolean;
  persistenceStatus: PersistenceStatus;
  persistenceError: string | null;
  retryPersistence: () => void;
  isFavorite: (slug: string) => boolean;
  isInTeam: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  toggleTeamMember: (slug: string) => boolean;
  replaceTeamMember: (slugToRemove: string, slugToAdd: string) => boolean;
  setComparisonTarget: (slug: string | null) => void;
  clearComparisonTarget: () => void;
  addSpecimen: (specimen: NewPokemonSpecimen, specimenId?: string) => string;
  removeSpecimen: (specimenId: string) => void;
  updateSpecimen: (
    specimenId: string,
    changes: Partial<Pick<PokemonSpecimen, 'origin' | 'gameId' | 'shiny'>>,
  ) => void;
  importSpecimens: (specimens: PokemonSpecimen[]) => number;
};

const STORAGE_KEY = 'pokedex.collections.v1';
const TEAM_LIMIT = 6;
const defaultState: CollectionsState = {
  favorites: [],
  team: [],
  comparisonTarget: null,
  specimens: [],
};

const CollectionsContext = createContext<CollectionsContextValue | null>(null);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const {
    state,
    setState,
    isReady,
    persistenceStatus,
    persistenceError,
    retryPersistence,
  } = usePersistedState(STORAGE_KEY, defaultState, parseCollectionsState);

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

  const replaceTeamMember = useCallback((slugToRemove: string, slugToAdd: string) => {
    let didUpdate = false;

    setState((current) => {
      if (
        !current.team.includes(slugToRemove) ||
        current.team.includes(slugToAdd)
      ) {
        return current;
      }

      didUpdate = true;
      return {
        ...current,
        team: current.team.map((entry) =>
          entry === slugToRemove ? slugToAdd : entry,
        ),
      };
    });

    return didUpdate;
  }, []);

  const clearComparisonTarget = useCallback(() => {
    setComparisonTarget(null);
  }, [setComparisonTarget]);

  const addSpecimen = useCallback((specimen: NewPokemonSpecimen, specimenId?: string) => {
    const createdSpecimen = createPokemonSpecimen(specimen);
    if (specimenId) createdSpecimen.id = specimenId;
    setState((current) => current.specimens.some((entry) => entry.id === createdSpecimen.id)
      ? current
      : { ...current, specimens: [...current.specimens, createdSpecimen] });
    return createdSpecimen.id;
  }, []);

  const removeSpecimen = useCallback((specimenId: string) => {
    setState((current) => ({
      ...current,
      specimens: current.specimens.filter((specimen) => specimen.id !== specimenId),
    }));
  }, []);

  const updateSpecimen = useCallback(
    (
      specimenId: string,
      changes: Partial<Pick<PokemonSpecimen, 'origin' | 'gameId' | 'shiny'>>,
    ) => {
      setState((current) => ({
        ...current,
        specimens: current.specimens.map((specimen) =>
          specimen.id === specimenId ? { ...specimen, ...changes } : specimen,
        ),
      }));
    },
    [],
  );

  const importSpecimens = useCallback((incoming: PokemonSpecimen[]) => {
    let importedCount = 0;
    setState((current) => {
      const merged = mergeSpecimens(current.specimens, incoming);
      importedCount = merged.importedCount;
      return { ...current, specimens: merged.specimens };
    });
    return importedCount;
  }, []);

  const value = useMemo<CollectionsContextValue>(
    () => ({
      ...state,
      isReady,
      persistenceStatus,
      persistenceError,
      retryPersistence,
      isFavorite,
      isInTeam,
      toggleFavorite,
      toggleTeamMember,
      replaceTeamMember,
      setComparisonTarget,
      clearComparisonTarget,
      addSpecimen,
      removeSpecimen,
      updateSpecimen,
      importSpecimens,
    }),
    [
      clearComparisonTarget,
      addSpecimen,
      isFavorite,
      importSpecimens,
      isInTeam,
      isReady,
      persistenceError,
      persistenceStatus,
      retryPersistence,
      removeSpecimen,
      replaceTeamMember,
      setComparisonTarget,
      state,
      toggleFavorite,
      toggleTeamMember,
      updateSpecimen,
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

function parseCollectionsState(rawValue: string): CollectionsState {
  const parsed = JSON.parse(rawValue) as Partial<CollectionsState>;

  return {
    favorites: Array.isArray(parsed.favorites)
      ? parsed.favorites.filter((entry): entry is string => typeof entry === 'string')
      : [],
    team: Array.isArray(parsed.team)
      ? parsed.team
          .filter((entry): entry is string => typeof entry === 'string')
          .slice(0, TEAM_LIMIT)
      : [],
    comparisonTarget:
      typeof parsed.comparisonTarget === 'string' ? parsed.comparisonTarget : null,
    specimens: Array.isArray(parsed.specimens)
      ? parsed.specimens.filter(isPokemonSpecimen)
      : [],
  };
}
