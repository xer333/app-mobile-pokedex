import catalogJson from './pokemon-catalog.json';
import { regionTranslations, translateGeneration, translateRegion, translateType } from './pokedex';

export type PokemonCatalogItem = {
  id: number;
  slug: string;
  nameFr: string;
  nameEn: string;
  genusFr: string;
  flavorFr: string;
  color: string;
  habitat: string | null;
  generation: string;
  generationLabelFr: string;
  regions: string[];
  regionLabelsFr: string[];
  types: string[];
  isLegendary: boolean;
  isMythical: boolean;
  isBaby: boolean;
  eggGroups: string[];
  genderRate: number;
  growthRate: string;
  evolutionChainUrl: string | null;
  image: string;
};

type PokemonCatalogFile = {
  source: string;
  generatedAt: string;
  count: number;
  items: PokemonCatalogItem[];
};

export type CatalogFilterOption = {
  key: string;
  label: string;
};

const catalog = catalogJson as PokemonCatalogFile;
const bySlug = new Map(catalog.items.map((item) => [item.slug, item] as const));

const cardPalette: Record<string, [string, string]> = {
  black: ['#4d4d4d', '#171717'],
  blue: ['#a9ebff', '#61c8ef'],
  brown: ['#d9b48e', '#9f6238'],
  gray: ['#dbdce2', '#9ca1b4'],
  green: ['#98ffcf', '#2bdf6f'],
  pink: ['#f7bfd6', '#f18ab3'],
  purple: ['#c9b2ff', '#8658e8'],
  red: ['#ff9388', '#ff5547'],
  white: ['#f7f7f7', '#d5d8eb'],
  yellow: ['#ffe88a', '#f8c330'],
};

const detailPalette: Record<string, [string, string, string]> = {
  black: ['#6c6c6c', '#bbbbbb', '#efefef'],
  blue: ['#8adaff', '#b8ecff', '#e6fbff'],
  brown: ['#dab88d', '#efd1ae', '#f9ecdb'],
  gray: ['#cfd3de', '#e8ebf4', '#f8f9fc'],
  green: ['#9af7cb', '#cbffd8', '#ecfff1'],
  pink: ['#f4a2c8', '#f7bfd8', '#fde0eb'],
  purple: ['#c7b9ff', '#e1d7ff', '#f4f0ff'],
  red: ['#ff9a8e', '#ffc5bc', '#ffe8e3'],
  white: ['#f4f4f4', '#fbfbfb', '#ffffff'],
  yellow: ['#ffd760', '#ffe38f', '#fff6c9'],
};

const typeFilters = buildTypeFilters(catalog.items);
const generationFilters = buildGenerationFilters(catalog.items);
const regionFilters = buildRegionFilters(catalog.items);

export const pokemonCatalog = catalog.items;
export const pokemonCatalogCount = catalog.count;
export const pokemonTypeFilters = typeFilters;
export const pokemonGenerationFilters = generationFilters;
export const pokemonRegionFilters = regionFilters;
export const featuredPokemonSlugs = [
  'jigglypuff',
  'bulbasaur',
  'pikachu',
  'poliwag',
  'squirtle',
  'gengar',
];

export function findCatalogPokemonBySlug(slug?: string | string[]) {
  const normalized = Array.isArray(slug) ? slug[0] : slug;
  return normalized ? bySlug.get(normalized) : undefined;
}

export function getCatalogPokemonBySlug(slug?: string | string[]) {
  return findCatalogPokemonBySlug(slug) ?? catalog.items[0];
}

export function getCardColors(color: string) {
  return cardPalette[color] ?? cardPalette.gray;
}

export function getDetailColors(color: string) {
  return detailPalette[color] ?? detailPalette.gray;
}

function buildTypeFilters(items: PokemonCatalogItem[]): CatalogFilterOption[] {
  const unique = new Set(items.flatMap((item) => item.types));
  return Array.from(unique)
    .sort((left, right) => translateType(left).localeCompare(translateType(right), 'fr'))
    .map((type) => ({
      key: type,
      label: translateType(type),
    }));
}

function buildGenerationFilters(items: PokemonCatalogItem[]): CatalogFilterOption[] {
  const unique = new Set(items.map((item) => item.generation));
  return Array.from(unique)
    .sort()
    .map((generation) => ({
      key: generation,
      label: translateGeneration(generation),
    }));
}

function buildRegionFilters(items: PokemonCatalogItem[]): CatalogFilterOption[] {
  const unique = new Set(items.flatMap((item) => item.regions));
  return Array.from(unique)
    .sort((left, right) =>
      (regionTranslations[left] ?? left).localeCompare(regionTranslations[right] ?? right, 'fr'),
    )
    .map((region) => ({
      key: region,
      label: translateRegion(region),
    }));
}
