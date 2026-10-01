import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { applyStateUpdates } from './persisted-state-updates';

export type PersistenceStatus = 'loading' | 'ready' | 'saving' | 'saved' | 'error';

type PersistedStateResult<T> = {
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  isReady: boolean;
  persistenceStatus: PersistenceStatus;
  persistenceError: string | null;
  retryPersistence: () => void;
};

export function usePersistedState<T>(
  storageKey: string,
  initialState: T,
  deserialize: (rawValue: string) => T,
): PersistedStateResult<T> {
  const [state, setStoredState] = useState<T>(initialState);
  const [isReady, setIsReady] = useState(false);
  const [persistenceStatus, setPersistenceStatus] =
    useState<PersistenceStatus>('loading');
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [readRetryToken, setReadRetryToken] = useState(0);
  const [writeRetryToken, setWriteRetryToken] = useState(0);
  const skipInitialWrite = useRef(true);
  const writeRevision = useRef(0);
  const deserializeRef = useRef(deserialize);
  const initialStateRef = useRef(initialState);
  const readyRef = useRef(false);
  const pendingUpdates = useRef<SetStateAction<T>[]>([]);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());
  deserializeRef.current = deserialize;

  const setState = useCallback<Dispatch<SetStateAction<T>>>((update) => {
    if (!readyRef.current) {
      pendingUpdates.current.push(update);
      return;
    }
    setStoredState(update);
  }, []);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(storageKey)
      .then((rawValue) => {
        if (cancelled) {
          return;
        }

        const restored = rawValue ? deserializeRef.current(rawValue) : initialStateRef.current;
        const updates = pendingUpdates.current;
        pendingUpdates.current = [];
        skipInitialWrite.current = updates.length === 0;
        setStoredState(applyStateUpdates(restored, updates));
        readyRef.current = true;
        setIsReady(true);
        setPersistenceStatus('ready');
        setPersistenceError(null);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setPersistenceStatus('error');
        setPersistenceError(
          'Impossible de lire les données locales. Rien n’a été remplacé automatiquement.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [readRetryToken, storageKey]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (skipInitialWrite.current && writeRetryToken === 0) {
      skipInitialWrite.current = false;
      return;
    }

    skipInitialWrite.current = false;
    const revision = writeRevision.current + 1;
    writeRevision.current = revision;
    setPersistenceStatus('saving');
    setPersistenceError(null);

    const serialized = JSON.stringify(state);
    writeQueue.current = writeQueue.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(storageKey, serialized));
    writeQueue.current
      .then(() => {
        if (writeRevision.current === revision) {
          setPersistenceStatus('saved');
        }
      })
      .catch(() => {
        if (writeRevision.current === revision) {
          setPersistenceStatus('error');
          setPersistenceError(
            'La modification reste visible, mais sa sauvegarde locale a échoué. Réessaie avant de fermer l’application.',
          );
        }
      });
  }, [isReady, writeRetryToken, state, storageKey]);

  const retryPersistence = useCallback(() => {
    if (readyRef.current) {
      setWriteRetryToken((current) => current + 1);
    } else {
      setPersistenceStatus('loading');
      setReadRetryToken((current) => current + 1);
    }
  }, []);

  return {
    state,
    setState,
    isReady,
    persistenceStatus,
    persistenceError,
    retryPersistence,
  };
}
