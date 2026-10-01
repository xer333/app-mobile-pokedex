import type { PokemonCatalogItem } from '../_shared/catalog';

export function normalizePokemonSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('fr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getSearchScore(
  pokemon: Pick<PokemonCatalogItem, 'id' | 'nameFr' | 'nameEn' | 'slug'>,
  normalizedQuery: string,
  numericQuery: string,
) {
  if (String(pokemon.id) === numericQuery) {
    return 0;
  }

  const names = [pokemon.nameFr, pokemon.nameEn, pokemon.slug].map(normalizePokemonSearch);
  if (names.some((name) => name === normalizedQuery)) {
    return 0;
  }
  if (names.some((name) => name.startsWith(normalizedQuery))) {
    return 1;
  }
  return 2;
}
