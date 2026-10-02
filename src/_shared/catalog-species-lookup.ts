export type LookupSpecies = { id: number; slug: string; nameFr: string; nameEn: string };

export function normalizeSpeciesKey(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[\s_-]+/g, '');
}

export function createSpeciesLookup(catalog: LookupSpecies[]) {
  const byName = new Map<string, LookupSpecies[]>();
  for (const species of catalog) {
    for (const name of [species.slug, species.nameFr, species.nameEn, String(species.id)]) {
      const key = normalizeSpeciesKey(name);
      const matches = byName.get(key) ?? [];
      if (!matches.some((item) => item.slug === species.slug)) matches.push(species);
      byName.set(key, matches);
    }
  }
  return byName;
}
