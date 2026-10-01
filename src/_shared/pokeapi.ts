import {
  findCatalogPokemonBySlug,
  getCatalogPokemonBySlug,
  type PokemonCatalogItem,
} from './catalog';
import {
  formatGenderRate,
  prettifySlug,
  translateCategory,
  translateEggGroup,
  translateGeneration,
  translateGrowthRate,
  translateHabitat,
  translateRegion,
  translateStat,
  translateType,
} from './pokedex';
import { classifyEvolutionContext, type EvolutionContextStatus } from './evolution-context';

type NamedResource = {
  name: string;
  url: string;
};

type LocalizedNameEntry = {
  language: {
    name: string;
  };
  name: string;
};

type PokemonApiResponse = {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  location_area_encounters: string;
  types: Array<{ slot: number; type: NamedResource }>;
  stats: Array<{ base_stat: number; stat: NamedResource }>;
  abilities: Array<{
    ability: NamedResource;
    is_hidden: boolean;
    slot: number;
  }>;
  moves: Array<{
    move: NamedResource;
    version_group_details: Array<{
      level_learned_at: number;
      move_learn_method: NamedResource;
      version_group: NamedResource;
    }>;
  }>;
  forms: NamedResource[];
  species: NamedResource;
  sprites: {
    other?: {
      home?: {
        front_default: string | null;
        front_shiny?: string | null;
      };
      'official-artwork'?: {
        front_default: string | null;
        front_shiny?: string | null;
      };
    };
    front_default: string | null;
    front_shiny?: string | null;
  };
};

type PokemonSpeciesResponse = {
  generation: NamedResource;
  growth_rate: NamedResource;
  egg_groups: NamedResource[];
  gender_rate: number;
  varieties: Array<{
    is_default: boolean;
    pokemon: NamedResource;
  }>;
};

type EvolutionChainResponse = {
  chain: EvolutionChainNode;
};

type EvolutionChainNode = {
  species: NamedResource;
  evolves_to: EvolutionChainNode[];
  evolution_details: EvolutionDetailApi[];
};

type EvolutionDetailApi = {
  version_group?: NamedResource | null;
  is_default?: boolean;
  trigger: NamedResource;
  min_level: number | null;
  item: NamedResource | null;
  held_item: NamedResource | null;
  known_move: NamedResource | null;
  known_move_type: NamedResource | null;
  location: NamedResource | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  party_species: NamedResource | null;
  party_type: NamedResource | null;
  trade_species: NamedResource | null;
  gender: number | null;
  needs_overworld_rain: boolean;
  time_of_day: string;
  relative_physical_stats: number | null;
  turn_upside_down: boolean;
};

type MoveApiResponse = {
  name: string;
  names: LocalizedNameEntry[];
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: {
      name: string;
    };
  }>;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  effect_chance?: number | null;
  type: NamedResource;
  damage_class: NamedResource;
  target: NamedResource;
  generation: NamedResource;
  machines?: Array<{
    machine: { url: string };
    version_group: NamedResource;
  }>;
};

type MachineApiResponse = {
  item: NamedResource;
};

type AbilityApiResponse = {
  names: LocalizedNameEntry[];
};

type TypeApiResponse = {
  damage_relations: {
    double_damage_from: NamedResource[];
    half_damage_from: NamedResource[];
    no_damage_from: NamedResource[];
  };
};

type EncounterApiResponse = Array<{
  location_area: NamedResource;
  version_details: Array<{
    encounter_details: Array<{
      chance: number;
      max_level: number;
      min_level: number;
      method: NamedResource;
    }>;
    max_chance: number;
    version: NamedResource;
  }>;
}>;

type LocationAreaApiResponse = {
  location: NamedResource;
  names?: LocalizedNameEntry[];
  name: string;
};

type LocationApiResponse = {
  region: NamedResource | null;
  names?: LocalizedNameEntry[];
  name: string;
};

type VersionApiResponse = {
  names?: LocalizedNameEntry[];
  name: string;
};

type ResourceWithNames = {
  names?: LocalizedNameEntry[];
  name?: string;
};

type PokemonFormApiResponse = {
  form_name: string;
  form_names: LocalizedNameEntry[];
};

type PokemonSpeciesIndexResponse = {
  count: number;
  results: NamedResource[];
};

export type PokemonMoveSummary = {
  slug: string;
  name: string;
  type: string;
  category: string;
  power: string;
  accuracy: string;
  pp: string;
  level: number | null;
  learnMethod: string;
  learnMethodLabel: string;
  versionGroup: string | null;
  acquisitionLabel: string;
  acquisitionStatus: 'exact' | 'contextual' | 'unverified';
};

export type MoveDetailData = {
  slug: string;
  name: string;
  type: string;
  category: string;
  power: string;
  accuracy: string;
  pp: string;
  priority: number;
  target: string;
  generation: string;
  effect: string;
  shortEffect: string;
};

export type PokemonEvolutionSummary = {
  slug: string;
  name: string;
  image: string;
};

export type PokemonEvolutionStep = {
  fromSlug: string;
  fromName: string;
  toSlug: string;
  toName: string;
  toImage: string;
  description: string;
  contextStatus: EvolutionContextStatus;
  introducedVersionGroups: string[];
};

export type PokemonVariantSummary = {
  slug: string;
  name: string;
  image: string;
  isDefault: boolean;
  types: string[];
  speciesSlug: string;
};

export type PokemonEncounterSummary = {
  location: string;
  versions: string[];
};

export type PokemonAtlasLocation = {
  key: string;
  areaName: string;
  locationName: string;
  regionKey: string;
  regionLabel: string;
  versions: string[];
  versionSlugs: string[];
  versionDetails: PokemonAtlasVersionDetail[];
  methods: string[];
  minLevel: number | null;
  maxLevel: number | null;
  chance: number;
};

export type PokemonAtlasData = {
  slug: string;
  name: string;
  image: string;
  encounterable: boolean;
  locations: PokemonAtlasLocation[];
  regions: Array<{
    key: string;
    label: string;
    count: number;
  }>;
  versions: string[];
  versionOptions: Array<{ slug: string; label: string }>;
};

export type PokemonAtlasVersionDetail = {
  slug: string;
  label: string;
  methods: string[];
  minLevel: number | null;
  maxLevel: number | null;
  chance: number;
};

export type PokemonDamageBucket = {
  type: string;
  multiplier: number;
};

export type PokemonDetailStat = {
  label: string;
  value: number;
  fill: number;
  color: string;
};

export type PokemonDetailData = {
  slug: string;
  speciesSlug: string;
  isForm: boolean;
  id: number;
  name: string;
  image: string;
  shinyImage: string | null;
  description: string;
  genus: string;
  habitat: string;
  generation: string;
  generationLabel: string;
  regions: string[];
  eggGroups: string[];
  growthRate: string;
  gender: string;
  size: string;
  weight: string;
  baseExperience: number;
  types: string[];
  abilities: string[];
  speciesFlags: string[];
  stats: PokemonDetailStat[];
  weaknesses: PokemonDamageBucket[];
  resistances: PokemonDamageBucket[];
  immunities: PokemonDamageBucket[];
  moves: PokemonMoveSummary[];
  moveSummaryTotal: number;
  moveSummaryIsPartial: boolean;
  moveContextStatus: 'national' | 'contextual' | 'unverified';
  moveVersionGroup: string | null;
  evolutions: PokemonEvolutionSummary[];
  evolutionSteps: PokemonEvolutionStep[];
  varieties: PokemonVariantSummary[];
  varietySummaryTotal: number;
  varietySummaryIsPartial: boolean;
  encounters: PokemonEncounterSummary[];
};

const API_BASE = 'https://pokeapi.co/api/v2';
const POKEMON_SPECIES_INDEX_LIMIT = 2000;
const VERSION_PRIORITY = [
  'scarlet-violet',
  'sword-shield',
  'brilliant-diamond-shining-pearl',
  'sun-moon',
  'ultra-sun-ultra-moon',
  'x-y',
];
const MOVE_SUMMARY_LIMIT = 18;

const detailCache = new Map<string, Promise<PokemonDetailData>>();
const atlasCache = new Map<string, Promise<PokemonAtlasData>>();
type CachedMoveSummary = Omit<
  PokemonMoveSummary,
  | 'level'
  | 'learnMethod'
  | 'learnMethodLabel'
  | 'versionGroup'
  | 'acquisitionLabel'
  | 'acquisitionStatus'
> & { machines: NonNullable<MoveApiResponse['machines']> };

const moveSummaryCache = new Map<string, Promise<CachedMoveSummary>>();
const moveDetailCache = new Map<string, Promise<MoveDetailData>>();
const speciesCache = new Map<string, Promise<PokemonSpeciesResponse>>();
const typeCache = new Map<string, Promise<TypeApiResponse>>();
const evolutionCache = new Map<string, Promise<EvolutionChainResponse>>();
const resourceNameCache = new Map<string, Promise<string>>();
const pokemonResourceCache = new Map<string, Promise<PokemonApiResponse>>();
const pokemonSpeciesIndexCache = new Map<string, Promise<{
  count: number;
  slugs: string[];
}>>();
const formLabelCache = new Map<string, Promise<string>>();
const locationAreaCache = new Map<string, Promise<LocationAreaApiResponse>>();
const locationCache = new Map<string, Promise<LocationApiResponse>>();
const machineCache = new Map<string, Promise<MachineApiResponse>>();

export async function fetchPokemonDetail(
  slug: string,
  versionGroup: string | null = null,
  moveLimit: number = MOVE_SUMMARY_LIMIT,
): Promise<PokemonDetailData> {
  const normalizedMoveLimit = Math.max(1, Math.round(moveLimit));
  const cacheKey = `${slug}:${versionGroup ?? 'national'}:${normalizedMoveLimit}`;
  const cached = detailCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = loadPokemonDetail(slug, versionGroup, normalizedMoveLimit).catch((error) => {
    detailCache.delete(cacheKey);
    throw error;
  });

  detailCache.set(cacheKey, promise);
  return promise;
}

export async function fetchMoveDetail(slug: string): Promise<MoveDetailData> {
  const cached = moveDetailCache.get(slug);
  if (cached) {
    return cached;
  }

  const promise = loadMoveDetail(slug).catch((error) => {
    moveDetailCache.delete(slug);
    throw error;
  });

  moveDetailCache.set(slug, promise);
  return promise;
}

export async function fetchPokemonMoveAcquisition(
  pokemonSlug: string,
  moveSlug: string,
  versionGroup: string | null = null,
) {
  const pokemon = await fetchPokemonResource(`${API_BASE}/pokemon/${pokemonSlug}`);
  const selectedMoves = selectRelevantMoves(pokemon, versionGroup);
  const selectedMove = selectedMoves.items.find((entry) => entry.move.name === moveSlug);

  if (!selectedMove) {
    return null;
  }

  return fetchMoveSummary(
    selectedMove.move.url,
    selectedMove.move.name,
    selectedMove.level,
    selectedMove.learnMethod,
    selectedMove.versionGroup,
  );
}

export async function fetchPokemonAtlas(slug: string): Promise<PokemonAtlasData> {
  const cached = atlasCache.get(slug);
  if (cached) {
    return cached;
  }

  const promise = loadPokemonAtlas(slug).catch((error) => {
    atlasCache.delete(slug);
    throw error;
  });

  atlasCache.set(slug, promise);
  return promise;
}

export async function fetchPokemonSpeciesIndex() {
  const cacheKey = 'default';
  const cached = pokemonSpeciesIndexCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const data = (await fetchJson(
      `${API_BASE}/pokemon-species?limit=${POKEMON_SPECIES_INDEX_LIMIT}&offset=0`,
    )) as PokemonSpeciesIndexResponse;

    return {
      count: data.count,
      slugs: data.results.map((entry) => entry.name),
    };
  })().catch((error) => {
    pokemonSpeciesIndexCache.delete(cacheKey);
    throw error;
  });

  pokemonSpeciesIndexCache.set(cacheKey, promise);
  return promise;
}

async function loadPokemonDetail(
  slug: string,
  versionGroup: string | null,
  moveLimit: number,
): Promise<PokemonDetailData> {
  const pokemon = await fetchPokemonResource(`${API_BASE}/pokemon/${slug}`);
  const speciesSlug = pokemon.species.name;
  const catalogPokemon =
    findCatalogPokemonBySlug(slug) ?? findCatalogPokemonBySlug(speciesSlug);
  if (!catalogPokemon) {
    throw new Error(`Le Pokémon « ${slug} » n'existe pas dans le catalogue local.`);
  }
  const species = await fetchPokemonSpecies(speciesSlug);
  const isForm = pokemon.name !== speciesSlug;
  const formLabel = isForm
    ? await fetchFormLabel(pokemon.forms[0]?.url, pokemon.name)
    : '';

  const selectedMoves = selectRelevantMoves(pokemon, versionGroup);
  const evolutionDataPromise = catalogPokemon.evolutionChainUrl
    ? fetchEvolutionChain(catalogPokemon.evolutionChainUrl)
    : Promise.resolve(null);

  const [
    abilities,
    moves,
    typeMatchups,
    evolutionData,
    varieties,
    encounters,
  ] = await Promise.all([
    Promise.all(pokemon.abilities.map((entry) => fetchAbilityName(entry.ability.url))),
    Promise.all(
      selectedMoves.items.slice(0, moveLimit).map((entry) =>
        fetchMoveSummary(
          entry.move.url,
          entry.move.name,
          entry.level,
          entry.learnMethod,
          entry.versionGroup,
        ),
      ),
    ),
    fetchTypeMatchups(pokemon.types.map((entry) => entry.type.name)),
    evolutionDataPromise,
    fetchVarietySummaries(species.varieties, catalogPokemon).catch(() => []),
    fetchEncounterSummaries(pokemon.location_area_encounters).catch(() => []),
  ]);

  const evolutions = evolutionData ? collectEvolutionSummaries(evolutionData.chain) : [];
  const evolutionSteps = evolutionData
    ? await collectEvolutionSteps(evolutionData.chain, versionGroup)
    : [];

  return {
    slug: pokemon.name,
    speciesSlug,
    isForm,
    id: pokemon.id,
    name: isForm ? `${catalogPokemon.nameFr} ${formLabel}`.trim() : catalogPokemon.nameFr,
    image:
      pokemon.sprites.other?.home?.front_default ??
      pokemon.sprites.other?.['official-artwork']?.front_default ??
      pokemon.sprites.front_default ??
      catalogPokemon.image,
    shinyImage:
      pokemon.sprites.other?.home?.front_shiny ??
      pokemon.sprites.other?.['official-artwork']?.front_shiny ??
      pokemon.sprites.front_shiny ??
      null,
    description: catalogPokemon.flavorFr || 'Aucune description disponible.',
    genus: catalogPokemon.genusFr || 'Pokémon',
    habitat: translateHabitat(catalogPokemon.habitat),
    generation: catalogPokemon.generation,
    generationLabel: translateGeneration(catalogPokemon.generation),
    regions: catalogPokemon.regionLabelsFr,
    eggGroups:
      catalogPokemon.eggGroups.length > 0
        ? catalogPokemon.eggGroups.map((eggGroup) => translateEggGroup(eggGroup))
        : ['Inconnu'],
    growthRate: translateGrowthRate(catalogPokemon.growthRate),
    gender: formatGenderRate(catalogPokemon.genderRate),
    size: `${(pokemon.height / 10).toFixed(1)} m`,
    weight: `${(pokemon.weight / 10).toFixed(1)} kg`,
    baseExperience: pokemon.base_experience,
    types: pokemon.types
      .slice()
      .sort((left, right) => left.slot - right.slot)
      .map((entry) => translateType(entry.type.name)),
    abilities: abilities.filter(Boolean),
    speciesFlags: buildSpeciesFlags(catalogPokemon),
    stats: pokemon.stats.map((entry) => ({
      label: translateStat(entry.stat.name),
      value: entry.base_stat,
      fill: Math.min(100, Math.max(10, Math.round((entry.base_stat / 160) * 100))),
      color: entry.base_stat < 45 ? '#e67f87' : entry.base_stat < 70 ? '#e5b65f' : '#73d178',
    })),
    weaknesses: typeMatchups.weaknesses,
    resistances: typeMatchups.resistances,
    immunities: typeMatchups.immunities,
    moves,
    moveSummaryTotal: selectedMoves.total,
    moveSummaryIsPartial: moves.length < selectedMoves.total,
    moveContextStatus: selectedMoves.status,
    moveVersionGroup: versionGroup,
    evolutions,
    evolutionSteps,
    varieties,
    varietySummaryTotal: species.varieties.length,
    varietySummaryIsPartial: varieties.length < species.varieties.length,
    encounters,
  };
}

async function loadMoveDetail(slug: string): Promise<MoveDetailData> {
  const data = (await fetchJson(`${API_BASE}/move/${slug}`)) as MoveApiResponse;
  const effectEntry = data.effect_entries.find((entry) => entry.language.name === 'fr');
  const englishEffectEntry = data.effect_entries.find((entry) => entry.language.name === 'en');
  const effect = normalizeEffectText(
    effectEntry?.effect ?? englishEffectEntry?.effect ?? 'Aucun effet détaillé disponible.',
    data.effect_chance ?? null,
  );
  const shortEffect = normalizeEffectText(
    effectEntry?.short_effect ??
      englishEffectEntry?.short_effect ??
      'Aucun résumé disponible.',
    data.effect_chance ?? null,
  );

  const target = await fetchLocalizedResourceName(data.target.url, data.target.name).catch(() =>
    prettifySlug(data.target.name),
  );

  return {
    slug: data.name,
    name: getFrenchName(data.names, prettifySlug(data.name)),
    type: translateType(data.type.name),
    category: translateCategory(data.damage_class.name),
    power: data.power ? String(data.power) : '—',
    accuracy: data.accuracy ? `${data.accuracy}%` : '—',
    pp: data.pp ? String(data.pp) : '—',
    priority: data.priority,
    target,
    generation: translateGeneration(data.generation.name),
    effect,
    shortEffect,
  };
}

async function loadPokemonAtlas(slug: string): Promise<PokemonAtlasData> {
  const catalogPokemon = findCatalogPokemonBySlug(slug);
  if (!catalogPokemon) {
    throw new Error(`Le Pokémon « ${slug} » n'existe pas dans le catalogue local.`);
  }
  const pokemon = await fetchPokemonResource(`${API_BASE}/pokemon/${slug}`);
  const locations = await fetchAtlasLocations(pokemon.location_area_encounters).catch(() => []);

  const regions = Array.from(
    locations.reduce((accumulator, location) => {
      const current = accumulator.get(location.regionKey);

      accumulator.set(location.regionKey, {
        key: location.regionKey,
        label: location.regionLabel,
        count: (current?.count ?? 0) + 1,
      });

      return accumulator;
    }, new Map<string, { key: string; label: string; count: number }>()),
  ).map(([, value]) => value);

  const versions = uniqueStrings(locations.flatMap((location) => location.versions)).sort(
    compareFrenchLabels,
  );
  const versionOptions = Array.from(
    locations.reduce((options, location) => {
      location.versionSlugs.forEach((slug, index) => {
        options.set(slug, location.versions[index] ?? prettifySlug(slug));
      });
      return options;
    }, new Map<string, string>()),
  )
    .map(([slug, label]) => ({ slug, label }))
    .sort((left, right) => compareFrenchLabels(left.label, right.label));

  return {
    slug: catalogPokemon.slug,
    name: catalogPokemon.nameFr,
    image:
      pokemon.sprites.other?.home?.front_default ??
      pokemon.sprites.other?.['official-artwork']?.front_default ??
      pokemon.sprites.front_default ??
      catalogPokemon.image,
    encounterable: locations.length > 0,
    locations: locations.sort(orderAtlasLocations),
    regions: regions.sort((left, right) => compareFrenchLabels(left.label, right.label)),
    versions,
    versionOptions,
  };
}

async function fetchMoveSummary(
  url: string,
  fallbackSlug: string,
  level: number | null,
  learnMethod: string,
  versionGroup: string | null,
) {
  const cached = moveSummaryCache.get(url);
  const summary = cached
    ? await cached
    : await createMoveSummary(url, fallbackSlug);
  const { machines, ...baseSummary } = summary;
  const acquisition = await resolveMoveAcquisition(
    machines,
    learnMethod,
    level,
    versionGroup,
  );

  return {
    ...baseSummary,
    level,
    learnMethod,
    learnMethodLabel: translateLearnMethod(learnMethod),
    versionGroup,
    ...acquisition,
  };
}

async function createMoveSummary(url: string, fallbackSlug: string) {
  const cached = moveSummaryCache.get(url);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    try {
      const data = (await fetchJson(url)) as MoveApiResponse;
      return {
        slug: data.name,
        name: getFrenchName(data.names, prettifySlug(data.name)),
        type: translateType(data.type.name),
        category: translateCategory(data.damage_class.name),
        power: data.power ? String(data.power) : '—',
        accuracy: data.accuracy ? `${data.accuracy}%` : '—',
        pp: data.pp ? String(data.pp) : '—',
        machines: data.machines ?? [],
      };
    } catch {
      return {
        slug: fallbackSlug,
        name: prettifySlug(fallbackSlug),
        type: 'Inconnu',
        category: 'Inconnue',
        power: '—',
        accuracy: '—',
        pp: '—',
        machines: [],
      };
    }
  })();

  moveSummaryCache.set(url, promise);
  return promise;
}

async function resolveMoveAcquisition(
  machines: NonNullable<MoveApiResponse['machines']>,
  learnMethod: string,
  level: number | null,
  versionGroup: string | null,
) {
  if (learnMethod === 'level-up') {
    return {
      acquisitionLabel: level !== null ? `Niveau ${level}` : 'Niveau non renseigné',
      acquisitionStatus: level !== null ? ('exact' as const) : ('unverified' as const),
    };
  }

  if (learnMethod !== 'machine') {
    return {
      acquisitionLabel: translateLearnMethod(learnMethod),
      acquisitionStatus: versionGroup ? ('contextual' as const) : ('unverified' as const),
    };
  }

  if (!versionGroup) {
    return {
      acquisitionLabel: 'Machine variable selon le jeu',
      acquisitionStatus: 'unverified' as const,
    };
  }

  const machineReference = machines.find(
    (entry) => entry.version_group.name === versionGroup,
  );
  if (!machineReference) {
    return {
      acquisitionLabel: 'Machine non renseignée pour ce jeu',
      acquisitionStatus: 'unverified' as const,
    };
  }

  try {
    const machine = await fetchMachineResource(machineReference.machine.url);
    const itemName = await fetchLocalizedResourceName(machine.item.url, machine.item.name);
    return {
      acquisitionLabel: itemName,
      acquisitionStatus: 'exact' as const,
    };
  } catch {
    return {
      acquisitionLabel: 'Machine non vérifiée',
      acquisitionStatus: 'unverified' as const,
    };
  }
}

async function fetchMachineResource(url: string) {
  const cached = machineCache.get(url);
  if (cached) {
    return cached;
  }

  const promise = fetchJson(url) as Promise<MachineApiResponse>;
  machineCache.set(url, promise);
  return promise;
}

async function fetchAbilityName(url: string): Promise<string> {
  try {
    const data = (await fetchJson(url)) as AbilityApiResponse;
    return getFrenchName(data.names, prettifySlug(url.split('/').filter(Boolean).at(-1) ?? ''));
  } catch {
    return 'Talent inconnu';
  }
}

async function fetchPokemonSpecies(slug: string) {
  const cached = speciesCache.get(slug);
  if (cached) {
    return cached;
  }

  const promise = fetchJson(`${API_BASE}/pokemon-species/${slug}`) as Promise<PokemonSpeciesResponse>;
  speciesCache.set(slug, promise);
  return promise;
}

async function fetchTypeData(typeName: string) {
  const cached = typeCache.get(typeName);
  if (cached) {
    return cached;
  }

  const promise = fetchJson(`${API_BASE}/type/${typeName}`) as Promise<TypeApiResponse>;
  typeCache.set(typeName, promise);
  return promise;
}

async function fetchEvolutionChain(url: string) {
  const cached = evolutionCache.get(url);
  if (cached) {
    return cached;
  }

  const promise = fetchJson(url) as Promise<EvolutionChainResponse>;
  evolutionCache.set(url, promise);
  return promise;
}

async function fetchPokemonResource(url: string) {
  const cached = pokemonResourceCache.get(url);
  if (cached) {
    return cached;
  }

  const promise = fetchJson(url) as Promise<PokemonApiResponse>;
  pokemonResourceCache.set(url, promise);
  return promise;
}

async function fetchLocalizedResourceName(url: string, fallback: string) {
  const cached = resourceNameCache.get(url);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const data = (await fetchJson(url)) as ResourceWithNames;
    return getFrenchName(data.names ?? [], prettifySlug(data.name ?? fallback));
  })();

  resourceNameCache.set(url, promise);
  return promise;
}

async function fetchFormLabel(url: string | undefined, fallbackSlug: string) {
  if (!url) {
    return prettifyVariantSuffix(fallbackSlug);
  }

  const cached = formLabelCache.get(url);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    try {
      const data = (await fetchJson(url)) as PokemonFormApiResponse;
      const label = getFrenchName(
        data.form_names,
        data.form_name ? prettifySlug(data.form_name) : prettifyVariantSuffix(fallbackSlug),
      );
      return label || prettifyVariantSuffix(fallbackSlug);
    } catch {
      return prettifyVariantSuffix(fallbackSlug);
    }
  })();

  formLabelCache.set(url, promise);
  return promise;
}

async function fetchTypeMatchups(typeNames: string[]) {
  const types = await Promise.all(typeNames.map((typeName) => fetchTypeData(typeName)));
  const multiplierByType = new Map<string, number>();

  Object.keys({
    normal: true,
    fire: true,
    water: true,
    electric: true,
    grass: true,
    ice: true,
    fighting: true,
    poison: true,
    ground: true,
    flying: true,
    psychic: true,
    bug: true,
    rock: true,
    ghost: true,
    dragon: true,
    dark: true,
    steel: true,
    fairy: true,
  }).forEach((type) => {
    multiplierByType.set(type, 1);
  });

  types.forEach((typeData) => {
    typeData.damage_relations.double_damage_from.forEach((entry) => {
      multiplierByType.set(entry.name, (multiplierByType.get(entry.name) ?? 1) * 2);
    });
    typeData.damage_relations.half_damage_from.forEach((entry) => {
      multiplierByType.set(entry.name, (multiplierByType.get(entry.name) ?? 1) * 0.5);
    });
    typeData.damage_relations.no_damage_from.forEach((entry) => {
      multiplierByType.set(entry.name, 0);
    });
  });

  const buckets = Array.from(multiplierByType.entries()).map(([type, multiplier]) => ({
    type: translateType(type),
    multiplier,
  }));

  return {
    weaknesses: buckets
      .filter((entry) => entry.multiplier > 1)
      .sort((left, right) => right.multiplier - left.multiplier),
    resistances: buckets
      .filter((entry) => entry.multiplier > 0 && entry.multiplier < 1)
      .sort((left, right) => left.multiplier - right.multiplier),
    immunities: buckets.filter((entry) => entry.multiplier === 0),
  };
}

async function fetchVarietySummaries(
  varieties: PokemonSpeciesResponse['varieties'],
  catalogPokemon: PokemonCatalogItem,
): Promise<PokemonVariantSummary[]> {
  const summaries = await Promise.all(
    varieties.slice(0, 8).map(async (variety) => {
      const pokemon = await fetchPokemonResource(variety.pokemon.url);
      const formLabel = variety.is_default
        ? ''
        : await fetchFormLabel(pokemon.forms[0]?.url, pokemon.name);
      const label = variety.is_default
        ? catalogPokemon.nameFr
        : `${catalogPokemon.nameFr} ${formLabel}`.trim();

      return {
        slug: pokemon.name,
        name: label,
        image:
          pokemon.sprites.other?.home?.front_default ??
          pokemon.sprites.other?.['official-artwork']?.front_default ??
          pokemon.sprites.front_default ??
          catalogPokemon.image,
        isDefault: variety.is_default,
        speciesSlug: catalogPokemon.slug,
        types: pokemon.types
          .slice()
          .sort((left, right) => left.slot - right.slot)
          .map((entry) => translateType(entry.type.name)),
      };
    }),
  );

  return summaries;
}

async function fetchEncounterSummaries(encountersUrl: string): Promise<PokemonEncounterSummary[]> {
  const entries = (await fetchJson(encountersUrl)) as EncounterApiResponse;
  const limitedEntries = entries.slice(0, 6);

  return Promise.all(
    limitedEntries.map(async (entry) => {
      const [location, versions] = await Promise.all([
        fetchLocationName(entry.location_area),
        Promise.all(
          entry.version_details
            .slice(0, 3)
            .map((detail) => fetchVersionName(detail.version)),
        ),
      ]);

      return {
        location,
        versions: Array.from(new Set(versions)),
      };
    }),
  );
}

async function fetchAtlasLocations(encountersUrl: string): Promise<PokemonAtlasLocation[]> {
  const entries = (await fetchJson(encountersUrl)) as EncounterApiResponse;

  return Promise.all(
    entries.map(async (entry) => {
      const area = await fetchLocationAreaResource(entry.location_area.url);
      const location = area.location?.url
        ? await fetchLocationResource(area.location.url)
        : null;
      const encounterDetails = entry.version_details.flatMap((detail) => detail.encounter_details);
      const levels = encounterDetails.flatMap((detail) =>
        [detail.min_level, detail.max_level].filter((value) => value > 0),
      );
      const regionKey = location?.region?.name ?? 'unknown';
      const versionOptions = Array.from(
        new Map(
          await Promise.all(
            entry.version_details.map(async (detail) => [
              detail.version.name,
              {
                slug: detail.version.name,
                label: await fetchVersionName(detail.version),
              },
            ] as const),
          ),
        ).values(),
      ).sort((left, right) => compareFrenchLabels(left.label, right.label));
      const versionDetails = await Promise.all(
        entry.version_details.map(async (detail) => {
          const detailLevels = detail.encounter_details.flatMap((encounter) =>
            [encounter.min_level, encounter.max_level].filter((value) => value > 0),
          );

          return {
            slug: detail.version.name,
            label: await fetchVersionName(detail.version),
            methods: uniqueStrings(
              detail.encounter_details.map((encounter) =>
                translateEncounterMethod(encounter.method.name),
              ),
            ).sort(compareFrenchLabels),
            minLevel: detailLevels.length > 0 ? Math.min(...detailLevels) : null,
            maxLevel: detailLevels.length > 0 ? Math.max(...detailLevels) : null,
            chance: Math.max(
              detail.max_chance,
              ...detail.encounter_details.map((encounter) => encounter.chance),
            ),
          };
        }),
      );

      return {
        key: entry.location_area.name,
        areaName: getFrenchName(area.names ?? [], prettifySlug(area.name)),
        locationName: location
          ? getFrenchName(location.names ?? [], prettifySlug(location.name))
          : getFrenchName(area.names ?? [], prettifySlug(area.name)),
        regionKey,
        regionLabel: location?.region ? translateRegion(location.region.name) : 'Autres lieux',
        versions: versionOptions.map((version) => version.label),
        versionSlugs: versionOptions.map((version) => version.slug),
        versionDetails,
        methods: uniqueStrings(
          encounterDetails.map((detail) => translateEncounterMethod(detail.method.name)),
        ).sort(compareFrenchLabels),
        minLevel: levels.length > 0 ? Math.min(...levels) : null,
        maxLevel: levels.length > 0 ? Math.max(...levels) : null,
        chance: Math.max(
          0,
          ...entry.version_details.map((detail) =>
            Math.max(detail.max_chance, ...detail.encounter_details.map((item) => item.chance)),
          ),
        ),
      };
    }),
  );
}

async function fetchLocationName(locationArea: NamedResource) {
  try {
    const data = await fetchLocationAreaResource(locationArea.url);
    return getFrenchName(data.names ?? [], prettifySlug(data.name));
  } catch {
    return prettifySlug(locationArea.name);
  }
}

async function fetchVersionName(version: NamedResource) {
  try {
    const data = (await fetchJson(version.url)) as VersionApiResponse;
    return getFrenchName(data.names ?? [], prettifySlug(data.name));
  } catch {
    return prettifySlug(version.name);
  }
}

async function fetchLocationAreaResource(url: string) {
  const cached = locationAreaCache.get(url);
  if (cached) {
    return cached;
  }

  const promise = fetchJson(url) as Promise<LocationAreaApiResponse>;
  locationAreaCache.set(url, promise);
  return promise;
}

async function fetchLocationResource(url: string) {
  const cached = locationCache.get(url);
  if (cached) {
    return cached;
  }

  const promise = fetchJson(url) as Promise<LocationApiResponse>;
  locationCache.set(url, promise);
  return promise;
}

function collectEvolutionSummaries(chain: EvolutionChainNode): PokemonEvolutionSummary[] {
  const slugs = new Set<string>();
  collectEvolutionSlugs(chain, slugs);

  return Array.from(slugs).map((slug) => {
    const pokemon = getCatalogPokemonBySlug(slug);
    return {
      slug: pokemon.slug,
      name: pokemon.nameFr,
      image: pokemon.image,
    };
  });
}

async function collectEvolutionSteps(
  chain: EvolutionChainNode,
  requestedVersionGroup: string | null,
): Promise<PokemonEvolutionStep[]> {
  const results: PokemonEvolutionStep[] = [];
  await walkEvolutionSteps(chain, results, requestedVersionGroup);
  return results;
}

async function walkEvolutionSteps(
  node: EvolutionChainNode,
  result: PokemonEvolutionStep[],
  requestedVersionGroup: string | null,
) {
  const fromPokemon = getCatalogPokemonBySlug(node.species.name);

  await Promise.all(
    node.evolves_to.map(async (nextNode) => {
      const toPokemon = getCatalogPokemonBySlug(nextNode.species.name);
      const description = await describeEvolutionDetails(nextNode.evolution_details);
      const introducedVersionGroups = uniqueStrings(
        nextNode.evolution_details
          .map((detail) => detail.version_group?.name)
          .filter((value): value is string => Boolean(value)),
      );

      result.push({
        fromSlug: fromPokemon.slug,
        fromName: fromPokemon.nameFr,
        toSlug: toPokemon.slug,
        toName: toPokemon.nameFr,
        toImage: toPokemon.image,
        description,
        contextStatus: classifyEvolutionContext(
          introducedVersionGroups,
          requestedVersionGroup,
        ),
        introducedVersionGroups,
      });

      await walkEvolutionSteps(nextNode, result, requestedVersionGroup);
    }),
  );
}

function collectEvolutionSlugs(node: EvolutionChainNode, result: Set<string>) {
  result.add(node.species.name);
  node.evolves_to.forEach((entry) => collectEvolutionSlugs(entry, result));
}

async function describeEvolutionDetails(details: EvolutionDetailApi[]) {
  if (details.length === 0) {
    return 'Évolution classique';
  }

  const descriptions = await Promise.all(
    details.map(async (detail) => {
      const parts = [translateEvolutionTrigger(detail.trigger.name)];

      if (detail.min_level) {
        parts.push(`niveau ${detail.min_level}`);
      }
      if (detail.item) {
        parts.push(`objet ${await fetchLocalizedResourceName(detail.item.url, detail.item.name)}`);
      }
      if (detail.held_item) {
        parts.push(
          `tenir ${await fetchLocalizedResourceName(detail.held_item.url, detail.held_item.name)}`,
        );
      }
      if (detail.known_move) {
        parts.push(
          `attaque ${await fetchLocalizedResourceName(
            detail.known_move.url,
            detail.known_move.name,
          )}`,
        );
      }
      if (detail.known_move_type) {
        parts.push(`type ${translateType(detail.known_move_type.name)}`);
      }
      if (detail.location) {
        parts.push(
          `lieu ${await fetchLocalizedResourceName(detail.location.url, detail.location.name)}`,
        );
      }
      if (detail.min_happiness) {
        parts.push(`bonheur ${detail.min_happiness}+`);
      }
      if (detail.min_beauty) {
        parts.push(`beauté ${detail.min_beauty}+`);
      }
      if (detail.min_affection) {
        parts.push(`affection ${detail.min_affection}+`);
      }
      if (detail.party_species) {
        parts.push(`avec ${prettifySlug(detail.party_species.name)} dans l'équipe`);
      }
      if (detail.party_type) {
        parts.push(`avec un type ${translateType(detail.party_type.name)} dans l'équipe`);
      }
      if (detail.trade_species) {
        parts.push(`contre ${prettifySlug(detail.trade_species.name)}`);
      }
      if (detail.gender === 1) {
        parts.push('forme femelle');
      }
      if (detail.gender === 2) {
        parts.push('forme mâle');
      }
      if (detail.needs_overworld_rain) {
        parts.push('sous la pluie');
      }
      if (detail.time_of_day) {
        parts.push(`moment ${translateTimeOfDay(detail.time_of_day)}`);
      }
      if (detail.relative_physical_stats === 1) {
        parts.push('Attaque > Défense');
      } else if (detail.relative_physical_stats === -1) {
        parts.push('Attaque < Défense');
      } else if (detail.relative_physical_stats === 0) {
        parts.push('Attaque = Défense');
      }
      if (detail.turn_upside_down) {
        parts.push('console retournée');
      }

      return parts.join(' • ');
    }),
  );

  return descriptions.filter(Boolean).join(' / ') || 'Condition spéciale';
}

type SelectedMoveCandidate = {
  move: NamedResource;
  rank: number;
  level: number | null;
  learnMethod: string;
  versionGroup: string | null;
};

function selectRelevantMoves(
  pokemon: PokemonApiResponse,
  requestedVersionGroup: string | null,
) {
  const selected = pokemon.moves
    .map<SelectedMoveCandidate | null>((entry) => {
      const compatibleDetails = entry.version_group_details.filter((detail) =>
        requestedVersionGroup
          ? detail.version_group.name === requestedVersionGroup
          : detail.move_learn_method.name === 'level-up' &&
            VERSION_PRIORITY.includes(detail.version_group.name),
      );

      const best = compatibleDetails
        .map((detail) => {
          const versionRank = requestedVersionGroup
            ? 0
            : VERSION_PRIORITY.indexOf(detail.version_group.name);
          const methodRank = getLearnMethodRank(detail.move_learn_method.name);

          return {
            detail,
            rank: versionRank * 10 + methodRank,
          };
        })
        .sort(
          (left, right) =>
            left.rank - right.rank ||
            left.detail.level_learned_at - right.detail.level_learned_at,
        )[0];

      return best
        ? {
            move: entry.move,
            rank: best.rank,
            level:
              best.detail.move_learn_method.name === 'level-up'
                ? best.detail.level_learned_at
                : null,
            learnMethod: best.detail.move_learn_method.name,
            versionGroup: best.detail.version_group.name,
          }
        : null;
    })
    .filter((entry): entry is SelectedMoveCandidate => Boolean(entry))
    .sort(
      (left, right) =>
        left.rank - right.rank ||
        (left.level ?? Number.MAX_SAFE_INTEGER) -
          (right.level ?? Number.MAX_SAFE_INTEGER),
    );

  if (selected.length === 0) {
    if (requestedVersionGroup) {
      return {
        items: [],
        total: 0,
        status: 'unverified' as const,
      };
    }

    const fallback = pokemon.moves.map((entry, index) => ({
      move: entry.move,
      rank: index,
      level: null,
      learnMethod: 'unknown',
      versionGroup: requestedVersionGroup,
    }));

    return {
      items: fallback,
      total: fallback.length,
      status: 'national' as const,
    };
  }

  return {
    items: selected,
    total: selected.length,
    status: requestedVersionGroup ? ('contextual' as const) : ('national' as const),
  };
}

function getLearnMethodRank(method: string) {
  const priority = ['level-up', 'machine', 'tutor', 'egg'];
  const rank = priority.indexOf(method);
  return rank === -1 ? priority.length : rank;
}

function translateLearnMethod(method: string) {
  const labels: Record<string, string> = {
    'level-up': 'Montée de niveau',
    machine: 'CT / CS',
    tutor: 'Maître des capacités',
    egg: 'Reproduction',
    'form-change': 'Changement de forme',
    'light-ball-egg': 'Reproduction avec Balle Lumière',
    unknown: 'Méthode non vérifiée',
  };
  return labels[method] ?? prettifySlug(method);
}

function getFrenchName(entries: LocalizedNameEntry[], fallback: string) {
  return (
    entries.find((entry) => entry.language.name === 'fr')?.name ??
    entries.find((entry) => entry.language.name === 'en')?.name ??
    fallback
  );
}

function buildSpeciesFlags(catalogPokemon: PokemonCatalogItem) {
  const flags = [];

  if (catalogPokemon.isLegendary) {
    flags.push('Légendaire');
  }
  if (catalogPokemon.isMythical) {
    flags.push('Fabuleux');
  }
  if (catalogPokemon.isBaby) {
    flags.push('Bébé');
  }

  return flags;
}

function translateEvolutionTrigger(trigger: string) {
  switch (trigger) {
    case 'level-up':
      return 'Montée de niveau';
    case 'trade':
      return 'Échange';
    case 'use-item':
      return "Utilisation d'un objet";
    case 'shed':
      return 'Mue';
    case 'spin':
      return 'Tour sur soi-même';
    case 'tower-of-darkness':
      return 'Tour des Ténèbres';
    case 'tower-of-waters':
      return 'Tour de l’Eau';
    case 'three-critical-hits':
      return 'Trois coups critiques';
    case 'take-damage':
      return 'Après avoir subi des dégâts';
    case 'other':
      return 'Condition spéciale';
    case 'agile-style-move':
      return 'Style agile';
    case 'strong-style-move':
      return 'Style puissant';
    case 'recoil-damage':
      return 'Dégâts de recul';
    default:
      return prettifySlug(trigger);
  }
}

function translateTimeOfDay(value: string) {
  switch (value) {
    case 'day':
      return 'jour';
    case 'night':
      return 'nuit';
    case 'dusk':
      return 'crépuscule';
    default:
      return value;
  }
}

function normalizeEffectText(value: string, effectChance: number | null) {
  const chanceLabel = effectChance !== null ? `${effectChance}%` : 'une certaine chance';
  return value.replace(/\$effect_chance/g, chanceLabel).replace(/\s+/g, ' ').trim();
}

function translateEncounterMethod(method: string) {
  switch (method) {
    case 'walk':
      return 'Marche';
    case 'surf':
      return 'Surf';
    case 'old-rod':
      return 'Vieille Canne';
    case 'good-rod':
      return 'Super Canne';
    case 'super-rod':
      return 'Mega Canne';
    case 'rock-smash':
      return 'Eclate-Roc';
    case 'headbutt':
      return 'Coup de Boule';
    case 'gift':
      return 'Don';
    case 'gift-egg':
      return 'Oeuf offert';
    case 'only-one':
      return 'Unique';
    case 'super-rod-spots':
      return 'Mega Canne (spot)';
    case 'good-rod-spots':
      return 'Super Canne (spot)';
    case 'old-rod-spots':
      return 'Vieille Canne (spot)';
    case 'surfing-spots':
      return 'Surf (spot)';
    case 'dark-grass':
      return 'Herbes sombres';
    case 'double-grass':
      return 'Double herbe';
    case 'special':
      return 'Speciale';
    case 'cave-spots':
      return 'Point de grotte';
    case 'bridge-spots':
      return 'Point de pont';
    case 'yellow-flowers':
      return 'Fleurs jaunes';
    case 'purple-flowers':
      return 'Fleurs violettes';
    case 'red-flowers':
      return 'Fleurs rouges';
    case 'rough-terrain':
      return 'Terrain rude';
    case 'grass':
      return 'Herbe';
    case 'water':
      return 'Eau';
    case 'seaweed':
      return 'Algues';
    case 'horde':
      return 'Horde';
    default:
      return prettifySlug(method);
  }
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function compareFrenchLabels(left: string, right: string) {
  return left.localeCompare(right, 'fr');
}

function orderAtlasLocations(left: PokemonAtlasLocation, right: PokemonAtlasLocation) {
  return (
    compareFrenchLabels(left.regionLabel, right.regionLabel) ||
    compareFrenchLabels(left.locationName, right.locationName) ||
    compareFrenchLabels(left.areaName, right.areaName)
  );
}

function prettifyVariantSuffix(slug: string) {
  const parts = slug.split('-');
  if (parts.length === 1) {
    return prettifySlug(slug);
  }

  return prettifySlug(parts.slice(1).join('-'));
}

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`La requête PokéAPI a échoué (${response.status}) pour ${url}`);
  }

  return response.json();
}
