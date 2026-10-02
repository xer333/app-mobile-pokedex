import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useAdventure } from './adventure';
import { useCollections } from './collections';
import { inferLegacySaveId, isCompatibleSave } from './record-save';
import {
  createHuntFoundJournal,
  getFoundSpecimen,
  getHuntRecoveryState,
  parseHuntFoundJournal,
  type HuntFoundJournal,
} from './hunt-found-journal';
import { useShinyHunts } from './shiny-hunts-provider';
import type { ShinyHunt } from './shiny-hunts';
import type { PokemonSpecimenOrigin } from './specimens';

const STORAGE_KEY = 'pokedex.pending-hunt-found.v1';

type HuntFoundContextValue = {
  isReady: boolean;
  pendingHuntId: string | null;
  error: string | null;
  completeHunt: (hunt: ShinyHunt, formSlug: string, origin: PokemonSpecimenOrigin) => Promise<void>;
  retryRecovery: () => void;
};

const HuntFoundContext = createContext<HuntFoundContextValue | null>(null);

export function HuntFoundCoordinator({ children }: { children: ReactNode }) {
  const adventure = useAdventure();
  const collections = useCollections();
  const hunts = useShinyHunts();
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState<HuntFoundJournal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [readToken, setReadToken] = useState(0);
  const [retryToken, setRetryToken] = useState(0);
  const operationInFlight = useRef(false);
  const clearing = useRef(false);
  const providersReady = adventure.isReady && collections.isReady && hunts.isReady;

  useEffect(() => {
    if (!providersReady) return;
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((rawValue) => {
        if (cancelled) return;
        setPending(rawValue ? parseHuntFoundJournal(rawValue) : null);
        setError(null);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Impossible de lire la trouvaille en attente. Réessaie avant de continuer.');
          setLoaded(false);
        }
      });
    return () => { cancelled = true; };
  }, [providersReady, readToken]);

  const completeHunt = useCallback(async (
    hunt: ShinyHunt, formSlug: string, origin: PokemonSpecimenOrigin,
  ) => {
    if (!providersReady || !loaded || pending || operationInFlight.current || error) {
      throw new Error('Une trouvaille est déjà en cours ou la récupération locale n’est pas prête.');
    }
    operationInFlight.current = true;
    try {
      const journal = createHuntFoundJournal(hunt, formSlug, origin);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(journal));
      setPending(journal);
      setError(null);
    } finally {
      operationInFlight.current = false;
    }
  }, [error, loaded, pending, providersReady]);

  const foundHunt = pending?.foundHunt;
  const currentHunt = hunts.hunts.find((hunt) => hunt.id === foundHunt?.id);
  const inferredSaveId = foundHunt?.saveId !== undefined
    ? foundHunt.saveId
    : currentHunt?.saveId !== undefined
      ? currentHunt.saveId
      : foundHunt ? inferLegacySaveId(foundHunt.gameId, adventure.saves) : undefined;
  const replayJournal = useMemo(() => pending && inferredSaveId !== undefined
    ? { ...pending, foundHunt: { ...pending.foundHunt, saveId: inferredSaveId } }
    : pending, [inferredSaveId, pending]);
  const currentSpecimen = collections.specimens.find((specimen) => specimen.id === foundHunt?.foundSpecimenId);
  const recovery = replayJournal
    ? getHuntRecoveryState(replayJournal, currentHunt, currentSpecimen)
    : { huntComplete: false, specimenComplete: false, conflict: false };
  const { huntComplete, specimenComplete } = recovery;
  const conflict = recovery.conflict || Boolean(replayJournal && !isCompatibleSave(
    replayJournal.foundHunt.saveId,
    replayJournal.foundHunt.gameId,
    adventure.saves,
  ));

  useEffect(() => {
    if (!replayJournal || !providersReady || conflict) return;
    if (!specimenComplete) {
      if (currentSpecimen && replayJournal.foundHunt.saveId) {
        collections.updateSpecimen(currentSpecimen.id, { saveId: replayJournal.foundHunt.saveId });
      } else {
        collections.addSpecimen(
          getFoundSpecimen(replayJournal),
          replayJournal.foundHunt.foundSpecimenId ?? undefined,
          replayJournal.foundHunt.foundAt ?? undefined,
        );
      }
    }
    if (!huntComplete) hunts.ensureFoundHunt(replayJournal.foundHunt);
  }, [replayJournal, providersReady, conflict, specimenComplete, huntComplete, currentSpecimen, collections.addSpecimen, collections.updateSpecimen, hunts.ensureFoundHunt]);

  useEffect(() => {
    if (conflict) {
      setError('Conflit entre la chasse et la collection. La trouvaille en attente est conservée.');
    }
  }, [conflict]);

  useEffect(() => {
    if (!pending || !huntComplete || !specimenComplete || !collections.isSynced
      || !hunts.isSynced || clearing.current) return;
    clearing.current = true;
    AsyncStorage.removeItem(STORAGE_KEY)
      .then(() => {
        setPending(null);
        setError(null);
      })
      .catch(() => {
        setError('La trouvaille est sauvegardée, mais le journal temporaire n’a pas pu être effacé. Réessaie.');
      })
      .finally(() => { clearing.current = false; });
  }, [pending, huntComplete, specimenComplete, collections.isSynced, hunts.isSynced, retryToken]);

  const retryRecovery = useCallback(() => {
    if (conflict) {
      setError('Conflit entre la chasse et la collection. La trouvaille en attente est conservée.');
      return;
    }
    setError(null);
    if (pending) setRetryToken((value) => value + 1);
    else {
      setLoaded(false);
      setReadToken((value) => value + 1);
    }
  }, [conflict, pending]);

  return (
    <HuntFoundContext.Provider value={{
      isReady: loaded && providersReady && !pending && !error,
      pendingHuntId: pending?.foundHunt.id ?? null,
      error,
      completeHunt,
      retryRecovery,
    }}>
      {children}
    </HuntFoundContext.Provider>
  );
}

export function useHuntFoundCoordinator() {
  const context = useContext(HuntFoundContext);
  if (!context) throw new Error('useHuntFoundCoordinator must be used within its provider');
  return context;
}
