import { createSpeciesLookup, normalizeSpeciesKey, type LookupSpecies } from './catalog-species-lookup.ts';
import type { PokemonSpecimen } from './specimens.ts';

export type UnrecognizedRegistration = { line: number; value: string; reason: 'unknown' | 'ambiguous' };

export function parseRegisteredList(raw: string, catalog: LookupSpecies[]) {
  if (raw.length > 2_000_000) throw new Error('La liste dépasse la limite de 2 Mo.');
  const byName = createSpeciesLookup(catalog);
  const slugs: string[] = [];
  const seen = new Set<string>();
  const unrecognized: UnrecognizedRegistration[] = [];
  let duplicates = 0;
  const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/);
  if (lines.length > 10_001) throw new Error('La liste dépasse la limite de 10 000 lignes.');
  for (const [index, line] of lines.entries()) {
    const value = line.trim();
    if (!value) continue;
    if (index === 0 && ['species', 'specieslug', 'pokemon'].includes(normalizeSpeciesKey(value))) continue;
    const matches = byName.get(normalizeSpeciesKey(value));
    if (!matches?.length) {
      unrecognized.push({ line: index + 1, value, reason: 'unknown' });
      continue;
    }
    if (matches.length !== 1) {
      unrecognized.push({ line: index + 1, value, reason: 'ambiguous' });
      continue;
    }
    const slug = matches[0].slug;
    if (seen.has(slug)) duplicates += 1;
    else { seen.add(slug); slugs.push(slug); }
  }
  if (!slugs.length && !unrecognized.length) throw new Error('La liste est vide.');
  return { slugs, duplicates, unrecognized };
}

export function mergeRegisteredSlugs(current: string[], incoming: string[]) {
  const merged = new Set(current);
  for (const slug of incoming) merged.add(slug);
  return [...merged];
}

export function buildDexStatuses<TSpecies extends LookupSpecies>(
  catalog: TSpecies[],
  registeredSlugs: string[],
  specimens: PokemonSpecimen[],
  saveId: string,
  gameId: string,
) {
  const registered = new Set(registeredSlugs);
  const owned = new Map<string, number>();
  for (const specimen of specimens) {
    if (specimen.saveId !== saveId || specimen.gameId !== gameId) continue;
    owned.set(specimen.speciesSlug, (owned.get(specimen.speciesSlug) ?? 0) + 1);
  }
  return catalog.map((species) => ({
    species,
    registered: registered.has(species.slug),
    ownedCount: owned.get(species.slug) ?? 0,
  }));
}
