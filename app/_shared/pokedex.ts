export const typeTranslations: Record<string, string> = {
  normal: 'Normal',
  fire: 'Feu',
  water: 'Eau',
  electric: '\u00c9lectrik',
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
  dark: 'T\u00e9n\u00e8bres',
  steel: 'Acier',
  fairy: 'F\u00e9e',
};

export const habitatTranslations: Record<string, string> = {
  cave: 'Grotte',
  forest: 'For\u00eat',
  grassland: 'Prairie',
  mountain: 'Montagne',
  rare: 'Rare',
  'rough-terrain': 'Terrain accident\u00e9',
  sea: 'Mer',
  urban: 'Ville',
  'waters-edge': "Bord de l'eau",
};

export const statTranslations: Record<string, string> = {
  hp: 'PV',
  attack: 'Attaque',
  defense: 'D\u00e9fense',
  'special-attack': 'Att. Sp\u00e9.',
  'special-defense': 'D\u00e9f. Sp\u00e9.',
  speed: 'Vitesse',
};

export const categoryTranslations: Record<string, string> = {
  physical: 'Physique',
  special: 'Sp\u00e9ciale',
  status: 'Statut',
};

export const growthRateTranslations: Record<string, string> = {
  slow: 'Lente',
  medium: 'Moyenne',
  fast: 'Rapide',
  'medium-slow': 'Moyenne-lente',
  'slow-then-very-fast': 'Lente puis tr\u00e8s rapide',
  'fast-then-very-slow': 'Rapide puis tr\u00e8s lente',
  fluctuating: 'Variable',
};

export const eggGroupTranslations: Record<string, string> = {
  monster: 'Monstrueux',
  water1: 'Aquatique 1',
  bug: 'Insecto\u00efde',
  flying: 'A\u00e9rien',
  field: 'Terrestre',
  fairy: 'F\u00e9erique',
  grass: 'V\u00e9g\u00e9tal',
  'human-like': 'Humano\u00efde',
  water3: 'Aquatique 3',
  mineral: 'Min\u00e9ral',
  amorphous: 'Amorphe',
  water2: 'Aquatique 2',
  ditto: 'M\u00e9tamorph',
  dragon: 'Draconique',
  'no-eggs': 'Inconnu',
  plant: 'V\u00e9g\u00e9tal',
};

export const generationTranslations: Record<string, string> = {
  'generation-i': 'G\u00e9n\u00e9ration I',
  'generation-ii': 'G\u00e9n\u00e9ration II',
  'generation-iii': 'G\u00e9n\u00e9ration III',
  'generation-iv': 'G\u00e9n\u00e9ration IV',
  'generation-v': 'G\u00e9n\u00e9ration V',
  'generation-vi': 'G\u00e9n\u00e9ration VI',
  'generation-vii': 'G\u00e9n\u00e9ration VII',
  'generation-viii': 'G\u00e9n\u00e9ration VIII',
  'generation-ix': 'G\u00e9n\u00e9ration IX',
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
  return `${femalePercentage}% \u2640 \u2022 ${malePercentage}% \u2642`;
}

export function prettifySlug(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
