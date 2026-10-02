import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { usePersistedState, type PersistenceStatus } from './use-persisted-state';
import {
  createAdventureSave,
  createLegacyAdventure,
  activateAdventureGame,
  activateAdventureSave,
  archiveAdventureSave,
  parseAdventureState,
  restoreAdventureSave,
  type AdventureSave,
  type AdventureState,
} from './adventure-saves';
import { mergeRegisteredSlugs } from './registered-dex';
import { backupStorageKeys } from './backup-storage-keys';
export type { AdventureSave, AdventureState } from './adventure-saves';

export type GameCoverage = 'reference' | 'partial';

export type GameOption = {
  id: string;
  label: string;
  shortLabel: string;
  versionGroup: string | null;
  versionSlug: string | null;
  region: string | null;
  coverage: GameCoverage;
};

type AdventureContextValue = AdventureState & {
  activeGame: GameOption;
  activeSave: AdventureSave;
  isReady: boolean;
  isSynced: boolean;
  persistenceStatus: PersistenceStatus;
  persistenceError: string | null;
  retryPersistence: () => void;
  setActiveGame: (gameId: string) => void;
  setActiveSave: (saveId: string) => void;
  addSave: (gameId: string, name: string) => string;
  archiveSave: (saveId: string) => void;
  restoreSave: (saveId: string) => void;
  renameSave: (saveId: string, name: string) => void;
  setSaveRules: (saveId: string, rules: AdventureSave['rules']) => void;
  setSaveDlcIds: (saveId: string, dlcIds: string[]) => void;
  isRegistered: (slug: string) => boolean;
  toggleRegistered: (slug: string) => void;
  registerSlugs: (saveId: string, slugs: string[]) => void;
  replaceAdventure: (nextState: AdventureState) => void;
};

export const gameOptions: GameOption[] = [
  { id: 'national', label: 'Référentiel national', shortLabel: 'National', versionGroup: null, versionSlug: null, region: null, coverage: 'reference' },
  { id: 'scarlet', label: 'Pokémon Écarlate', shortLabel: 'Écarlate', versionGroup: 'scarlet-violet', versionSlug: 'scarlet', region: 'paldea', coverage: 'partial' },
  { id: 'violet', label: 'Pokémon Violet', shortLabel: 'Violet', versionGroup: 'scarlet-violet', versionSlug: 'violet', region: 'paldea', coverage: 'partial' },
  { id: 'sword', label: 'Pokémon Épée', shortLabel: 'Épée', versionGroup: 'sword-shield', versionSlug: 'sword', region: 'galar', coverage: 'partial' },
  { id: 'shield', label: 'Pokémon Bouclier', shortLabel: 'Bouclier', versionGroup: 'sword-shield', versionSlug: 'shield', region: 'galar', coverage: 'partial' },
  { id: 'brilliant-diamond', label: 'Diamant Étincelant', shortLabel: 'Diamant', versionGroup: 'brilliant-diamond-shining-pearl', versionSlug: 'brilliant-diamond', region: 'sinnoh', coverage: 'partial' },
  { id: 'shining-pearl', label: 'Perle Scintillante', shortLabel: 'Perle', versionGroup: 'brilliant-diamond-shining-pearl', versionSlug: 'shining-pearl', region: 'sinnoh', coverage: 'partial' },
  { id: 'legends-arceus', label: 'Légendes Pokémon : Arceus', shortLabel: 'Légendes Arceus', versionGroup: 'legends-arceus', versionSlug: 'legends-arceus', region: 'hisui', coverage: 'partial' },
  { id: 'lets-go-pikachu', label: 'Pokémon : Let’s Go, Pikachu', shortLabel: 'Let’s Go Pikachu', versionGroup: 'lets-go-pikachu-lets-go-eevee', versionSlug: 'lets-go-pikachu', region: 'kanto', coverage: 'partial' },
  { id: 'lets-go-eevee', label: 'Pokémon : Let’s Go, Évoli', shortLabel: 'Let’s Go Évoli', versionGroup: 'lets-go-pikachu-lets-go-eevee', versionSlug: 'lets-go-eevee', region: 'kanto', coverage: 'partial' },
  { id: 'ultra-sun', label: 'Pokémon Ultra-Soleil', shortLabel: 'Ultra-Soleil', versionGroup: 'ultra-sun-ultra-moon', versionSlug: 'ultra-sun', region: 'alola', coverage: 'partial' },
  { id: 'ultra-moon', label: 'Pokémon Ultra-Lune', shortLabel: 'Ultra-Lune', versionGroup: 'ultra-sun-ultra-moon', versionSlug: 'ultra-moon', region: 'alola', coverage: 'partial' },
];

const STORAGE_KEY = backupStorageKeys.adventure;
const defaultState: AdventureState = createLegacyAdventure('national');
const AdventureContext = createContext<AdventureContextValue | null>(null);

export function AdventureProvider({ children }: { children: ReactNode }) {
  const {
    state,
    setState,
    isReady,
    isSynced,
    persistenceStatus,
    persistenceError,
    retryPersistence,
  } = usePersistedState(STORAGE_KEY, defaultState, parseAdventureState);
  const activeGame = getGameOption(state.activeGameId);
  const activeSave = state.saves.find((save) => save.id === state.activeSaveId) ?? state.saves[0];

  const value = useMemo<AdventureContextValue>(
    () => ({
      ...state,
      activeGame,
      activeSave,
      isReady,
      isSynced,
      persistenceStatus,
      persistenceError,
      retryPersistence,
      setActiveGame: (gameId) => {
        const normalizedGameId = getGameOption(gameId).id;
        setState((current) => activateAdventureGame(current, normalizedGameId));
      },
      setActiveSave: (saveId) => {
        setState((current) => activateAdventureSave(current, saveId));
      },
      addSave: (gameId, name) => {
        const save = createAdventureSave(getGameOption(gameId).id, name);
        setState((current) => ({
          activeGameId: save.gameId,
          activeSaveId: save.id,
          saves: [...current.saves, save],
        }));
        return save.id;
      },
      archiveSave: (saveId) => setState((current) => archiveAdventureSave(current, saveId)),
      restoreSave: (saveId) => setState((current) => restoreAdventureSave(current, saveId)),
      renameSave: (saveId, name) => {
        if (!name.trim()) return;
        setState((current) => ({
          ...current,
          saves: current.saves.map((save) => save.id === saveId
            ? { ...save, name: name.trim() } : save),
        }));
      },
      setSaveRules: (saveId, rules) => {
        setState((current) => ({
          ...current,
          saves: current.saves.map((save) => save.id === saveId
            ? { ...save, rules } : save),
        }));
      },
      setSaveDlcIds: (saveId, dlcIds) => {
        setState((current) => ({
          ...current,
          saves: current.saves.map((save) => save.id === saveId
            ? { ...save, dlcIds: [...new Set(dlcIds)] } : save),
        }));
      },
      isRegistered: (slug) => activeSave.registeredSlugs.includes(slug),
      toggleRegistered: (slug) => {
        setState((current) => ({
          ...current,
          saves: current.saves.map((save) => save.id === current.activeSaveId
            ? { ...save, registeredSlugs: save.registeredSlugs.includes(slug)
              ? save.registeredSlugs.filter((entry) => entry !== slug)
              : [...save.registeredSlugs, slug] }
            : save),
        }));
      },
      registerSlugs: (saveId, slugs) => {
        if (!slugs.length) return;
        setState((current) => ({
          ...current,
          saves: current.saves.map((save) => save.id === saveId
            ? { ...save, registeredSlugs: mergeRegisteredSlugs(save.registeredSlugs, slugs) }
            : save),
        }));
      },
      replaceAdventure: (nextState) => setState(parseAdventureState(JSON.stringify(nextState))),
    }),
    [
      activeGame,
      activeSave,
      isReady,
      isSynced,
      persistenceError,
      persistenceStatus,
      retryPersistence,
      setState,
      state,
    ],
  );

  return <AdventureContext.Provider value={value}>{children}</AdventureContext.Provider>;
}

export function useAdventure() {
  const context = useContext(AdventureContext);
  if (!context) {
    throw new Error('useAdventure must be used within an AdventureProvider');
  }
  return context;
}

export function getGameOption(gameId: string) {
  return gameOptions.find((game) => game.id === gameId) ?? gameOptions[0];
}
