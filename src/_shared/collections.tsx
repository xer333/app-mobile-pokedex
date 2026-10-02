import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
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
import { useAdventure } from './adventure';
import { getTeamForSave, getTeamsBySaveId, setTeamForSave } from './team-by-save';
import { isCompatibleSave, migrateRecordsToSaves } from './record-save';
import { isCollectionProject, type CollectionProject, type ProjectTarget } from './collection-projects';
import { backupStorageKeys } from './backup-storage-keys';

export type CollectionsState = {
  favorites: string[];
  team: string[];
  teamsBySaveId?: Record<string, string[]>;
  comparisonTarget: string | null;
  specimens: PokemonSpecimen[];
  projects: CollectionProject[];
};

type CollectionsContextValue = CollectionsState & {
  isReady: boolean;
  isSynced: boolean;
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
  addSpecimen: (specimen: NewPokemonSpecimen, specimenId?: string, obtainedAt?: number) => string;
  removeSpecimen: (specimenId: string) => void;
  updateSpecimen: (
    specimenId: string,
    changes: Partial<Pick<PokemonSpecimen,
      'origin' | 'gameId' | 'saveId' | 'shiny' | 'nickname' | 'boxName' | 'boxSlot'
      | 'ball' | 'language' | 'obtainedPlace' | 'notes'>>,
  ) => void;
  importSpecimens: (specimens: PokemonSpecimen[]) => number;
  replaceCollections: (nextState: CollectionsState) => void;
  addProject: (project: CollectionProject) => void;
  removeProject: (projectId: string) => void;
  updateProject: (projectId: string, changes: Partial<Pick<CollectionProject,
    'title' | 'targets' | 'scopeLabel' | 'scopeRevision' | 'scopeGeneration' | 'scopeShiny'>>) => void;
  addProjectTarget: (projectId: string, target: ProjectTarget) => void;
};

const STORAGE_KEY = backupStorageKeys.collections;
const TEAM_LIMIT = 6;
const defaultState: CollectionsState = {
  favorites: [],
  team: [],
  teamsBySaveId: { 'save-legacy-national': [] },
  comparisonTarget: null,
  specimens: [],
  projects: [],
};

const CollectionsContext = createContext<CollectionsContextValue | null>(null);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const adventure = useAdventure();
  const {
    state,
    setState,
    isReady,
    isSynced,
    persistenceStatus,
    persistenceError,
    retryPersistence,
  } = usePersistedState(STORAGE_KEY, defaultState, parseCollectionsState);

  const activeSaveId = adventure.activeSaveId;
  const originalSaveId = adventure.saves[0].id;
  const team = getTeamForSave(state, activeSaveId, originalSaveId);
  const isFavorite = useCallback((slug: string) => state.favorites.includes(slug), [state.favorites]);
  const isInTeam = useCallback((slug: string) => team.includes(slug), [team]);

  useEffect(() => {
    if (!isReady || !adventure.isReady) return;
    setState((current) => {
      const migrated = migrateRecordsToSaves(current.specimens, adventure.saves);
      return migrated === current.specimens ? current : { ...current, specimens: migrated };
    });
  }, [adventure.isReady, adventure.saves, isReady, setState]);

  const toggleFavorite = useCallback((slug: string) => {
    setState((current) => ({
      ...current,
      favorites: current.favorites.includes(slug)
        ? current.favorites.filter((entry) => entry !== slug)
        : [...current.favorites, slug],
    }));
  }, []);

  const toggleTeamMember = useCallback((slug: string) => {
    if (!isReady || !adventure.isReady) return false;
    let didUpdate = false;

    setState((current) => {
      const currentTeam = getTeamForSave(current, activeSaveId, originalSaveId);
      if (currentTeam.includes(slug)) {
        didUpdate = true;
        return setTeamForSave(current, activeSaveId, originalSaveId,
          currentTeam.filter((entry) => entry !== slug));
      }

      if (currentTeam.length >= TEAM_LIMIT) {
        return current;
      }

      didUpdate = true;
      return setTeamForSave(current, activeSaveId, originalSaveId, [...currentTeam, slug]);
    });

    return didUpdate;
  }, [activeSaveId, originalSaveId, setState, isReady, adventure.isReady]);

  const setComparisonTarget = useCallback((slug: string | null) => {
    setState((current) => ({
      ...current,
      comparisonTarget: slug,
    }));
  }, []);

  const replaceTeamMember = useCallback((slugToRemove: string, slugToAdd: string) => {
    if (!isReady || !adventure.isReady) return false;
    let didUpdate = false;

    setState((current) => {
      const currentTeam = getTeamForSave(current, activeSaveId, originalSaveId);
      if (
        !currentTeam.includes(slugToRemove) ||
        currentTeam.includes(slugToAdd)
      ) {
        return current;
      }

      didUpdate = true;
      return setTeamForSave(current, activeSaveId, originalSaveId,
        currentTeam.map((entry) => entry === slugToRemove ? slugToAdd : entry));
    });

    return didUpdate;
  }, [activeSaveId, originalSaveId, setState, isReady, adventure.isReady]);

  const clearComparisonTarget = useCallback(() => {
    setComparisonTarget(null);
  }, [setComparisonTarget]);

  const addSpecimen = useCallback((specimen: NewPokemonSpecimen, specimenId?: string, obtainedAt?: number) => {
    const { saveId: requestedSaveId, ...details } = specimen;
    const saveId = requestedSaveId !== undefined ? requestedSaveId : (!specimenId && specimen.gameId === adventure.activeGameId
      ? adventure.activeSaveId : undefined);
    if (!isCompatibleSave(saveId, specimen.gameId, adventure.saves)) {
      throw new Error('Cette partie ne correspond pas au jeu de l’exemplaire.');
    }
    const createdSpecimen = createPokemonSpecimen({
      ...details,
      ...(saveId !== undefined ? { saveId } : {}),
    }, obtainedAt);
    if (specimenId) createdSpecimen.id = specimenId;
    setState((current) => current.specimens.some((entry) => entry.id === createdSpecimen.id)
      ? current
      : { ...current, specimens: [...current.specimens, createdSpecimen] });
    return createdSpecimen.id;
  }, [adventure.activeGameId, adventure.activeSaveId, adventure.saves, setState]);

  const removeSpecimen = useCallback((specimenId: string) => {
    setState((current) => ({
      ...current,
      specimens: current.specimens.filter((specimen) => specimen.id !== specimenId),
    }));
  }, []);

  const updateSpecimen = useCallback(
    (
      specimenId: string,
      changes: Partial<Pick<PokemonSpecimen,
        'origin' | 'gameId' | 'saveId' | 'shiny' | 'nickname' | 'boxName' | 'boxSlot'
        | 'ball' | 'language' | 'obtainedPlace' | 'notes'>>,
    ) => {
      setState((current) => ({
        ...current,
        specimens: current.specimens.map((specimen) => {
          if (specimen.id !== specimenId) return specimen;
          const updated = { ...specimen, ...changes };
          return isCompatibleSave(updated.saveId, updated.gameId, adventure.saves)
            ? updated : specimen;
        }),
      }));
    },
    [adventure.saves, setState],
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

  const replaceCollections = useCallback((nextState: CollectionsState) => {
    setState(nextState);
  }, [setState]);

  const addProject = useCallback((project: CollectionProject) => {
    if (!isCollectionProject(project)
      || !isCompatibleSave(project.saveId, project.gameId, adventure.saves)) {
      throw new Error('Projet de collection invalide ou lié au mauvais jeu.');
    }
    setState((current) => current.projects.some((entry) => entry.id === project.id)
      ? current : { ...current, projects: [...current.projects, project] });
  }, [adventure.saves, setState]);

  const removeProject = useCallback((projectId: string) => {
    setState((current) => ({
      ...current, projects: current.projects.filter((project) => project.id !== projectId),
    }));
  }, [setState]);

  const updateProject = useCallback((projectId: string, changes: Partial<Pick<CollectionProject,
    'title' | 'targets' | 'scopeLabel' | 'scopeRevision' | 'scopeGeneration' | 'scopeShiny'>>) => {
    setState((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== projectId) return project;
        const updated = { ...project, ...changes };
        return isCollectionProject(updated) ? updated : project;
      }),
    }));
  }, [setState]);

  const addProjectTarget = useCallback((projectId: string, target: ProjectTarget) => {
    setState((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== projectId || project.targets.some((entry) => entry.id === target.id)) return project;
        const updated = { ...project, targets: [...project.targets, target] };
        return isCollectionProject(updated) ? updated : project;
      }),
    }));
  }, [setState]);

  const value = useMemo<CollectionsContextValue>(
    () => ({
      ...state,
      team,
      teamsBySaveId: getTeamsBySaveId(state, originalSaveId),
      isReady,
      isSynced,
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
      replaceCollections,
      addProject,
      removeProject,
      updateProject,
      addProjectTarget,
    }),
    [
      clearComparisonTarget,
      addSpecimen,
      isFavorite,
      importSpecimens,
      isInTeam,
      isReady,
      isSynced,
      persistenceError,
      persistenceStatus,
      retryPersistence,
      removeSpecimen,
      replaceCollections,
      addProject,
      removeProject,
      updateProject,
      addProjectTarget,
      replaceTeamMember,
      setComparisonTarget,
      state,
      team,
      originalSaveId,
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
  const teamsBySaveId = parseTeamsBySaveId(parsed.teamsBySaveId);
  if (parsed.teamsBySaveId !== undefined && teamsBySaveId === undefined) {
    throw new Error('Équipes de parties invalides.');
  }
  if (parsed.projects !== undefined && (!Array.isArray(parsed.projects)
    || !parsed.projects.every(isCollectionProject))) {
    throw new Error('Projets de collection invalides.');
  }

  return {
    favorites: Array.isArray(parsed.favorites)
      ? parsed.favorites.filter((entry): entry is string => typeof entry === 'string')
      : [],
    team: Array.isArray(parsed.team)
      ? parsed.team
          .filter((entry): entry is string => typeof entry === 'string')
          .slice(0, TEAM_LIMIT)
      : [],
    teamsBySaveId,
    comparisonTarget:
      typeof parsed.comparisonTarget === 'string' ? parsed.comparisonTarget : null,
    specimens: Array.isArray(parsed.specimens)
      ? parsed.specimens.filter(isPokemonSpecimen)
      : [],
    projects: parsed.projects ?? [],
  };
}

function parseTeamsBySaveId(value: unknown): Record<string, string[]> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const entries = Object.entries(value);
  if (!entries.every(([saveId, team]) => saveId.length > 0 && Array.isArray(team)
    && team.length <= TEAM_LIMIT && team.every((entry) => typeof entry === 'string'))) {
    return undefined;
  }
  return Object.fromEntries(entries) as Record<string, string[]>;
}
