import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_BASE = 'https://pokeapi.co/api/v2';
const OUTPUT_DIR = path.resolve(process.cwd(), 'app', '_shared');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'pokemon-catalog.json');
const LIMIT = 2000;
const CONCURRENCY = 12;

const generationLabels = {
  'generation-i': 'Génération I',
  'generation-ii': 'Génération II',
  'generation-iii': 'Génération III',
  'generation-iv': 'Génération IV',
  'generation-v': 'Génération V',
  'generation-vi': 'Génération VI',
  'generation-vii': 'Génération VII',
  'generation-viii': 'Génération VIII',
  'generation-ix': 'Génération IX',
};

const regionLabels = {
  kanto: 'Kanto',
  johto: 'Johto',
  hoenn: 'Hoenn',
  sinnoh: 'Sinnoh',
  unova: 'Unys',
  kalos: 'Kalos',
  alola: 'Alola',
  galar: 'Galar',
  hisui: 'Hisui',
  paldea: 'Paldea',
};

async function main() {
  console.log('Fetching species list from PokeAPI...');
  const list = await fetchJson(`${API_BASE}/pokemon-species?limit=${LIMIT}`);

  const items = await mapLimit(list.results, CONCURRENCY, async (entry, index) => {
    const species = await fetchJson(entry.url);
    const defaultVarietyUrl =
      species.varieties?.find((variety) => variety.is_default)?.pokemon?.url ??
      `${API_BASE}/pokemon/${entry.name}`;
    const pokemon = await fetchJson(defaultVarietyUrl);

    const generation = species.generation?.name ?? 'generation-i';
    const regions = deriveRegions(species.pokedex_numbers, generation);
    const frName = getLocalizedValue(species.names, 'fr', species.name);
    const enName = getLocalizedValue(species.names, 'en', species.name);
    const genusFr = getLocalizedValue(species.genera, 'fr', '');
    const flavorFr = normalizeText(getLastLocalizedValue(species.flavor_text_entries, 'fr', ''));

    if ((index + 1) % 50 === 0) {
      console.log(`Processed ${index + 1}/${list.count}`);
    }

    return {
      id: species.id,
      slug: species.name,
      nameFr: frName,
      nameEn: enName,
      genusFr,
      flavorFr,
      color: species.color?.name ?? 'gray',
      habitat: species.habitat?.name ?? null,
      generation,
      generationLabelFr: generationLabels[generation] ?? generation,
      regions,
      regionLabelsFr: regions.map((region) => regionLabels[region] ?? region),
      types: pokemon.types
        .slice()
        .sort((left, right) => left.slot - right.slot)
        .map((entryType) => entryType.type.name),
      isLegendary: species.is_legendary,
      isMythical: species.is_mythical,
      isBaby: species.is_baby,
      eggGroups: species.egg_groups?.map((eggGroup) => eggGroup.name) ?? [],
      genderRate: species.gender_rate,
      growthRate: species.growth_rate?.name ?? 'medium',
      evolutionChainUrl: species.evolution_chain?.url ?? null,
      image: officialArtwork(species.id),
    };
  });

  const payload = {
    source: 'https://pokeapi.co/',
    generatedAt: new Date().toISOString(),
    count: list.count,
    items: items.sort((a, b) => a.id - b.id),
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Catalog written to ${OUTPUT_FILE}`);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

function getLocalizedValue(entries, language, fallback) {
  return (
    entries.find((entry) => entry.language?.name === language)?.name ??
    entries.find((entry) => entry.language?.name === language)?.genus ??
    entries.find((entry) => entry.language?.name === language)?.flavor_text ??
    fallback
  );
}

function getLastLocalizedValue(entries, language, fallback) {
  const filtered = entries.filter((entry) => entry.language?.name === language);
  return filtered.at(-1)?.flavor_text ?? fallback;
}

function normalizeText(value) {
  return value.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function officialArtwork(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function deriveRegions(pokedexNumbers, generation) {
  const regions = new Set();

  pokedexNumbers.forEach((entry) => {
    const name = entry.pokedex?.name ?? '';

    if (name.includes('kanto')) {
      regions.add('kanto');
    } else if (name.includes('johto')) {
      regions.add('johto');
    } else if (name.includes('hoenn')) {
      regions.add('hoenn');
    } else if (name.includes('sinnoh')) {
      regions.add('sinnoh');
    } else if (name.includes('unova')) {
      regions.add('unova');
    } else if (name.includes('kalos')) {
      regions.add('kalos');
    } else if (
      name.includes('alola') ||
      ['melemele', 'akala', 'ulaula', 'poni'].includes(name)
    ) {
      regions.add('alola');
    } else if (
      name.includes('galar') ||
      name.includes('armor') ||
      name.includes('crown')
    ) {
      regions.add('galar');
    } else if (name.includes('hisui')) {
      regions.add('hisui');
    } else if (
      name.includes('paldea') ||
      name.includes('kitakami') ||
      name.includes('blueberry')
    ) {
      regions.add('paldea');
    }
  });

  if (regions.size === 0) {
    regions.add(regionFromGeneration(generation));
  }

  return Array.from(regions);
}

function regionFromGeneration(generation) {
  switch (generation) {
    case 'generation-i':
      return 'kanto';
    case 'generation-ii':
      return 'johto';
    case 'generation-iii':
      return 'hoenn';
    case 'generation-iv':
      return 'sinnoh';
    case 'generation-v':
      return 'unova';
    case 'generation-vi':
      return 'kalos';
    case 'generation-vii':
      return 'alola';
    case 'generation-viii':
      return 'galar';
    case 'generation-ix':
      return 'paldea';
    default:
      return 'kanto';
  }
}

async function mapLimit(items, concurrency, mapper) {
  const results = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
