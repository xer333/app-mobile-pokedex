import { backupStorageKeys, restoreJournalKey } from './backup-storage-keys.ts';
import { parsePortableBackup, serializeFullBackup, type FullBackup, type FullBackupData } from './full-backup.ts';

export type RestoreStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<unknown>;
  removeItem: (key: string) => Promise<unknown>;
};

export type RestoreWriters = {
  profile: (value: FullBackupData['profile']) => void;
  activity: (value: FullBackupData['activity']) => void;
  adventure: (value: FullBackupData['adventure']) => void;
  collections: (value: FullBackupData['collections']) => void;
  planning: (value: FullBackupData['planning']) => void;
  shinyHunts: (value: FullBackupData['shinyHunts']) => void;
};

const blockNames = ['profile', 'activity', 'adventure', 'collections', 'planning', 'shinyHunts'] as const;

export async function stageRestoreJournal(storage: RestoreStorage, backup: FullBackup) {
  const serialized = JSON.stringify(backup);
  const parsed = parsePortableBackup(serialized);
  if (parsed.kind !== 'full') throw new Error('Sauvegarde complète requise.');
  await storage.setItem(restoreJournalKey, serialized);
}

export async function replayRestoreJournal(storage: RestoreStorage) {
  const raw = await storage.getItem(restoreJournalKey);
  if (!raw) return false;
  const parsed = parsePortableBackup(raw);
  if (parsed.kind !== 'full') throw new Error('Journal de restauration invalide.');
  for (const name of blockNames) {
    await storage.setItem(backupStorageKeys[name], JSON.stringify(parsed.backup[name]));
  }
  await storage.removeItem(restoreJournalKey);
  return true;
}

export async function restoreFullBackup(
  backup: FullBackup,
  current: FullBackupData,
  saveRecovery: (serialized: string) => Promise<void>,
  storage: RestoreStorage,
  writers: RestoreWriters,
  preserveRecovery = false,
) {
  // The previous complete state is durable before the target journal is staged.
  if (!preserveRecovery) await saveRecovery(serializeFullBackup(current));
  await stageRestoreJournal(storage, backup);
  let replayError: unknown = null;
  try {
    await replayRestoreJournal(storage);
  } catch (error) {
    // Keep the journal for startup replay, but align this session with the target.
    replayError = error;
  }
  writers.profile(backup.profile);
  writers.activity(backup.activity);
  writers.adventure(backup.adventure);
  writers.collections(backup.collections);
  writers.planning(backup.planning);
  writers.shinyHunts(backup.shinyHunts);
  if (replayError) {
    throw new Error('Restauration locale incomplète. Le journal est conservé et sera rejoué au prochain démarrage.');
  }
}
