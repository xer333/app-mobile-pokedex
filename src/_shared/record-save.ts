import { legacySaveId, type AdventureSave } from './adventure-saves.ts';

export type SaveLinkedRecord = { gameId: string; saveId?: string | null };

export function inferLegacySaveId(gameId: string, saves: Pick<AdventureSave, 'id' | 'gameId'>[]) {
  const matching = saves.filter((save) => save.gameId === gameId);
  const legacy = matching.find((save) => save.id === legacySaveId(gameId));
  if (legacy) return legacy.id;
  return matching.length === 1 ? matching[0].id : undefined;
}

export function migrateRecordsToSaves<T extends SaveLinkedRecord>(
  records: T[],
  saves: Pick<AdventureSave, 'id' | 'gameId'>[],
): T[] {
  let changed = false;
  const migrated = records.map((record) => {
    if (record.saveId !== undefined) return record;
    const saveId = inferLegacySaveId(record.gameId, saves);
    if (!saveId) return record;
    changed = true;
    return { ...record, saveId };
  });
  return changed ? migrated : records;
}

export function belongsToSave(record: SaveLinkedRecord, saveId: string) {
  return record.saveId === saveId;
}

export function isCompatibleSave(
  saveId: string | null | undefined,
  gameId: string,
  saves: Pick<AdventureSave, 'id' | 'gameId'>[],
) {
  return !saveId || saves.some((save) => save.id === saveId && save.gameId === gameId);
}
