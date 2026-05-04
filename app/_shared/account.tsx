import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type AccountProfile = {
  firstName: string;
  lastName: string;
  nickname: string;
};

type AccountContextValue = {
  isReady: boolean;
  profile: AccountProfile;
  displayName: string;
  initials: string;
  replaceProfile: (nextProfile: AccountProfile) => void;
  resetProfile: () => void;
};

const STORAGE_KEY = 'pokedex.account.v1';

const defaultProfile: AccountProfile = {
  firstName: 'Stanly',
  lastName: '',
  nickname: 'stanly',
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AccountProfile>(defaultProfile);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((rawValue) => {
        if (!rawValue) {
          return;
        }

        const parsed = JSON.parse(rawValue) as Partial<AccountProfile>;

        setProfile({
          firstName: normalizeValue(parsed.firstName, defaultProfile.firstName),
          lastName: normalizeValue(parsed.lastName, ''),
          nickname: normalizeValue(parsed.nickname, defaultProfile.nickname),
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

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch(() => {
      // No-op: profile still works in memory even if persistence fails.
    });
  }, [isReady, profile]);

  const value = useMemo<AccountContextValue>(() => {
    const displayName = getAccountDisplayName(profile);
    const initials = getAccountInitials(profile);

    return {
      isReady,
      profile,
      displayName,
      initials,
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
  }, [isReady, profile]);

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
