export type PokemonSpecimenOrigin = 'unspecified' | 'captured' | 'received' | 'traded';

export type PokemonSpecimen = {
  id: string;
  speciesSlug: string;
  formSlug: string;
  shiny: boolean;
  gameId: string;
  obtainedAt: number;
  origin: PokemonSpecimenOrigin;
};

export type NewPokemonSpecimen = Omit<PokemonSpecimen, 'id' | 'obtainedAt'>;

export function createPokemonSpecimen(
  specimen: NewPokemonSpecimen,
  now: number = Date.now(),
  randomValue: number = Math.random(),
): PokemonSpecimen {
  return {
    ...specimen,
    id: `specimen-${now}-${randomValue.toString(36).slice(2, 9)}`,
    obtainedAt: now,
  };
}

export function isPokemonSpecimen(value: unknown): value is PokemonSpecimen {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const specimen = value as Partial<PokemonSpecimen>;
  return (
    typeof specimen.id === 'string' &&
    specimen.id.length > 0 &&
    typeof specimen.speciesSlug === 'string' &&
    specimen.speciesSlug.length > 0 &&
    typeof specimen.formSlug === 'string' &&
    specimen.formSlug.length > 0 &&
    typeof specimen.shiny === 'boolean' &&
    typeof specimen.gameId === 'string' &&
    specimen.gameId.length > 0 &&
    typeof specimen.obtainedAt === 'number' &&
    Number.isFinite(specimen.obtainedAt) &&
    ['unspecified', 'captured', 'received', 'traded'].includes(specimen.origin ?? '')
  );
}
