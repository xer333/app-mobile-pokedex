export const typeTranslations: Record<string, string> = {
  normal: 'Normal',
  fire: 'Feu',
  water: 'Eau',
  electric: 'Électrik',
  grass: 'Plante',
  ice: 'Glace',
  fighting: 'Combat',
  poison: 'Poison',
  ground: 'Sol',
  flying: 'Vol',
  psychic: 'Psy',
  bug: 'Insecte',
  rock: 'Roche',
  ghost: 'Spectre',
  dragon: 'Dragon',
  dark: 'Ténèbres',
  steel: 'Acier',
  fairy: 'Fée',
};

export const habitatTranslations: Record<string, string> = {
  cave: 'Grotte',
  forest: 'Forêt',
  grassland: 'Prairie',
  mountain: 'Montagne',
  rare: 'Rare',
  'rough-terrain': 'Terrain accidenté',
  sea: 'Mer',
  urban: 'Ville',
  'waters-edge': "Bord de l'eau",
};

export const statTranslations: Record<string, string> = {
  hp: 'PV',
  attack: 'Attaque',
  defense: 'Défense',
  'special-attack': 'Att. Spé.',
  'special-defense': 'Déf. Spé.',
  speed: 'Vitesse',
};

export const categoryTranslations: Record<string, string> = {
  physical: 'Physique',
  special: 'Spéciale',
  status: 'Statut',
};

export const growthRateTranslations: Record<string, string> = {
  slow: 'Lente',
  medium: 'Moyenne',
  fast: 'Rapide',
  'medium-slow': 'Moyenne-lente',
  'slow-then-very-fast': 'Lente puis très rapide',
  'fast-then-very-slow': 'Rapide puis très lente',
  fluctuating: 'Variable',
};

export const eggGroupTranslations: Record<string, string> = {
  monster: 'Monstrueux',
  water1: 'Aquatique 1',
  bug: 'Insectoïde',
  flying: 'Aérien',
  field: 'Terrestre',
  fairy: 'Féerique',
  grass: 'Végétal',
  human-like: 'Humanoïde',
  water3: 'Aquatique 3',
  mineral: 'Minéral',
  amorphous: 'Amorphe',
  water2: 'Aquatique 2',
  ditto: 'Métamorph',
  dragon: 'Draconique',
  'no-eggs': 'Inconnu',
};

export const generationTranslations: Record<string, string> = {
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

export const regionTranslations: Record<string, string> = {
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

export function translateType(type: string) {
  return typeTranslations[type] ?? prettifySlug(type);
}

export function translateHabitat(habitat: string | null | undefined) {
  if (!habitat) {
    return 'Inconnu';
  }

  return habitatTranslations[habitat] ?? prettifySlug(habitat);
}

export function translateStat(stat: string) {
  return statTranslations[stat] ?? prettifySlug(stat);
}

export function translateCategory(category: string) {
  return categoryTranslations[category] ?? prettifySlug(category);
}

export function translateGeneration(generation: string) {
  return generationTranslations[generation] ?? prettifySlug(generation);
}

export function translateRegion(region: string) {
  return regionTranslations[region] ?? prettifySlug(region);
}

export function translateGrowthRate(growthRate: string) {
  return growthRateTranslations[growthRate] ?? prettifySlug(growthRate);
}

export function translateEggGroup(eggGroup: string) {
  return eggGroupTranslations[eggGroup] ?? prettifySlug(eggGroup);
}

export function regionFromGeneration(generation: string) {
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

export function formatGenderRate(genderRate: number) {
  if (genderRate === -1) {
    return 'Sans genre';
  }

  const femalePercentage = Math.round((genderRate / 8) * 100);
  const malePercentage = 100 - femalePercentage;
  return `${femalePercentage}% ♀ • ${malePercentage}% ♂`;
}

export function prettifySlug(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
