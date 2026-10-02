export const backupStorageKeys = {
  profile: 'pokedex.account.v1',
  activity: 'pokedex.activity.v1',
  adventure: 'pokedex.adventure.v1',
  collections: 'pokedex.collections.v1',
  planning: 'pokedex.planning.v1',
  shinyHunts: 'pokedex.shiny-hunts.v1',
} as const;

export const restoreJournalKey = 'pokedex.pending-full-restore.v1';
export const recoveryBackupKey = 'pokedex.recovery-backup.v1';
