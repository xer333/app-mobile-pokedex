import { isPokemonSpecimen, type PokemonSpecimen } from './specimens.ts';

export type CollectionBackup = {
  schemaVersion: 1;
  exportedAt: number;
  specimens: PokemonSpecimen[];
};

export function serializeCollectionBackup(specimens: PokemonSpecimen[], now = Date.now()) {
  const backup: CollectionBackup = {
    schemaVersion: 1,
    exportedAt: now,
    specimens,
  };
  return JSON.stringify(backup, null, 2);
}

export function parseCollectionBackup(rawValue: string): CollectionBackup {
  const parsed = JSON.parse(rawValue) as Partial<CollectionBackup>;
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.specimens)) {
    throw new Error('Format de sauvegarde non reconnu.');
  }
  if (!parsed.specimens.every(isPokemonSpecimen)) {
    throw new Error('La sauvegarde contient un exemplaire invalide.');
  }

  return {
    schemaVersion: 1,
    exportedAt:
      typeof parsed.exportedAt === 'number' && Number.isFinite(parsed.exportedAt)
        ? parsed.exportedAt
        : 0,
    specimens: parsed.specimens,
  };
}

export function mergeSpecimens(
  current: PokemonSpecimen[],
  incoming: PokemonSpecimen[],
) {
  const merged = new Map(current.map((specimen) => [specimen.id, specimen]));
  let importedCount = 0;

  incoming.forEach((specimen) => {
    if (!merged.has(specimen.id)) {
      importedCount += 1;
      merged.set(specimen.id, specimen);
    }
  });

  return { specimens: Array.from(merged.values()), importedCount };
}
