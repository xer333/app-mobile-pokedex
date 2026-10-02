import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { usePersistedState, type PersistenceStatus } from './use-persisted-state';
import { backupStorageKeys } from './backup-storage-keys';

export type AccountProfile = {
  firstName: string;
  lastName: string;
  nickname: string;
};

type AccountContextValue = {
  isReady: boolean;
  isSynced: boolean;
  profile: AccountProfile;
  displayName: string;
  initials: string;
  persistenceStatus: PersistenceStatus;
  persistenceError: string | null;
  retryPersistence: () => void;
  replaceProfile: (nextProfile: AccountProfile) => void;
  resetProfile: () => void;
};

const STORAGE_KEY = backupStorageKeys.profile;

const defaultProfile: AccountProfile = {
  firstName: 'Stanly',
  lastName: '',
  nickname: 'stanly',
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const {
    state: profile,
    setState: setProfile,
    isReady,
    isSynced,
    persistenceStatus,
    persistenceError,
    retryPersistence,
  } = usePersistedState(STORAGE_KEY, defaultProfile, parseAccountProfile);

  const value = useMemo<AccountContextValue>(() => {
    const displayName = getAccountDisplayName(profile);
    const initials = getAccountInitials(profile);

    return {
      isReady,
      isSynced,
      profile,
      displayName,
      initials,
      persistenceStatus,
      persistenceError,
      retryPersistence,
      replaceProfile: (nextProfile) => {
        setProfile({
          firstName: normalizeValue(nextProfile.firstName, defaultProfile.firstName),
          lastName: normalizeValue(nextProfile.lastName, ''),
          nickname: normalizeValue(nextProfile.nickname, defaultProfile.nickname),
        });
      },
      resetProfile: () => {
        setProfile(defaultProfile);
      },
    };
  }, [
    isReady,
    isSynced,
    persistenceError,
    persistenceStatus,
    profile,
    retryPersistence,
    setProfile,
  ]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const context = useContext(AccountContext);

  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }

  return context;
}

export function getAccountDisplayName(profile: AccountProfile) {
  return profile.firstName || profile.nickname || 'Dresseur';
}

export function getAccountInitials(profile: AccountProfile) {
  const source = getAccountDisplayName(profile).trim();
  return source ? source.slice(0, 1).toUpperCase() : 'D';
}

function normalizeValue(value: unknown, fallback: string) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized || fallback;
}

function parseAccountProfile(rawValue: string): AccountProfile {
  const parsed = JSON.parse(rawValue) as Partial<AccountProfile>;

  return {
    firstName: normalizeValue(parsed.firstName, defaultProfile.firstName),
    lastName: normalizeValue(parsed.lastName, ''),
    nickname: normalizeValue(parsed.nickname, defaultProfile.nickname),
  };
}
