import type { PokemonSpecimen } from './specimens.ts';

export type SpecimenImportReview = {
  additions: number;
  identical: number;
  collisions: number;
  possibleDuplicates: number;
};

export function reviewSpecimenImport(current: PokemonSpecimen[], incoming: PokemonSpecimen[]): SpecimenImportReview {
  const existing = new Map(current.map((specimen) => [specimen.id, specimen]));
  const seen = new Map(existing);
  const knownIdentities = new Set(current.map(identityKey));
  let additions = 0;
  let identical = 0;
  let collisions = 0;
  let possibleDuplicates = 0;

  for (const specimen of incoming) {
    const previous = seen.get(specimen.id);
    if (previous) {
      if (sameSpecimen(previous, specimen)) identical += 1;
      else collisions += 1;
      continue;
    }
    additions += 1;
    if (knownIdentities.has(identityKey(specimen))) possibleDuplicates += 1;
    seen.set(specimen.id, specimen);
  }

  return { additions, identical, collisions, possibleDuplicates };
}

export function prepareSpecimenImport(
  current: PokemonSpecimen[],
  incoming: PokemonSpecimen[],
  collisionAction: 'skip' | 'copy',
) {
  const existing = new Map(current.map((specimen) => [specimen.id, specimen]));
  const prepared: PokemonSpecimen[] = [];
  let copies = 0;

  for (const specimen of incoming) {
    const previous = existing.get(specimen.id);
    if (!previous) {
      existing.set(specimen.id, specimen);
      prepared.push(specimen);
      continue;
    }
    if (sameSpecimen(previous, specimen) || collisionAction === 'skip') continue;

    const baseId = `${specimen.id}-import-${fingerprint(specimen)}`;
    let candidateId = baseId;
    let suffix = 2;
    while (existing.has(candidateId)
      && !sameSpecimenIgnoringId(existing.get(candidateId)!, specimen)) {
      candidateId = `${baseId}-${suffix}`;
      suffix += 1;
    }
    if (existing.has(candidateId)) continue;
    const copy = { ...specimen, id: candidateId };
    existing.set(candidateId, copy);
    prepared.push(copy);
    copies += 1;
  }

  return { specimens: prepared, copies };
}

function sameSpecimen(left: PokemonSpecimen, right: PokemonSpecimen) {
  return stableSpecimen(left) === stableSpecimen(right);
}

function sameSpecimenIgnoringId(left: PokemonSpecimen, right: PokemonSpecimen) {
  return sameSpecimen({ ...left, id: right.id }, right);
}

function identityKey(specimen: PokemonSpecimen) {
  return JSON.stringify([
    specimen.speciesSlug, specimen.formSlug, specimen.shiny,
    specimen.gameId, specimen.saveId, specimen.obtainedAt,
  ]);
}

function stableSpecimen(specimen: PokemonSpecimen) {
  return JSON.stringify(Object.entries(specimen).sort(([left], [right]) => left.localeCompare(right)));
}

function fingerprint(specimen: PokemonSpecimen) {
  const value = stableSpecimen(specimen);
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
