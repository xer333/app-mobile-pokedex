import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { usePersistedState, type PersistenceStatus } from './use-persisted-state';

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

type AdventureState = {
  activeGameId: string;
};

type AdventureContextValue = AdventureState & {
  activeGame: GameOption;
  isReady: boolean;
  persistenceStatus: PersistenceStatus;
  persistenceError: string | null;
  retryPersistence: () => void;
  setActiveGame: (gameId: string) => void;
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

const STORAGE_KEY = 'pokedex.adventure.v1';
const defaultState: AdventureState = { activeGameId: 'national' };
const AdventureContext = createContext<AdventureContextValue | null>(null);

export function AdventureProvider({ children }: { children: ReactNode }) {
  const {
    state,
    setState,
    isReady,
    persistenceStatus,
    persistenceError,
    retryPersistence,
  } = usePersistedState(STORAGE_KEY, defaultState, parseAdventureState);
  const activeGame = getGameOption(state.activeGameId);

  const value = useMemo<AdventureContextValue>(
    () => ({
      ...state,
      activeGame,
      isReady,
      persistenceStatus,
      persistenceError,
      retryPersistence,
      setActiveGame: (gameId) => {
        setState({ activeGameId: getGameOption(gameId).id });
      },
    }),
    [
      activeGame,
      isReady,
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

function parseAdventureState(rawValue: string): AdventureState {
  const parsed = JSON.parse(rawValue) as Partial<AdventureState>;
  return {
    activeGameId:
      typeof parsed.activeGameId === 'string'
        ? getGameOption(parsed.activeGameId).id
        : defaultState.activeGameId,
  };
}
