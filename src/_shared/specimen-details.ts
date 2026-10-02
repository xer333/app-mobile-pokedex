import type { PokemonSpecimen } from './specimens.ts';

export type SpecimenDetailsDraft = {
  nickname: string;
  boxName: string;
  boxSlot: string;
  ball: string;
  language: string;
  obtainedPlace: string;
  notes: string;
};

export function createSpecimenDetailsDraft(specimen: PokemonSpecimen): SpecimenDetailsDraft {
  return {
    nickname: specimen.nickname ?? '',
    boxName: specimen.boxName ?? '',
    boxSlot: specimen.boxSlot?.toString() ?? '',
    ball: specimen.ball ?? '',
    language: specimen.language ?? '',
    obtainedPlace: specimen.obtainedPlace ?? '',
    notes: specimen.notes ?? '',
  };
}

export function parseSpecimenDetailsDraft(draft: SpecimenDetailsDraft): Partial<PokemonSpecimen> {
  const boxName = draft.boxName.trim();
  const rawSlot = draft.boxSlot.trim();
  const boxSlot = rawSlot ? Number(rawSlot) : undefined;
  if (boxSlot !== undefined && (!Number.isInteger(boxSlot) || boxSlot < 1)) {
    throw new Error('L’emplacement doit être un entier positif.');
  }
  if (boxSlot !== undefined && !boxName) {
    throw new Error('Indique une boîte avant de renseigner un emplacement.');
  }
  return {
    nickname: optional(draft.nickname),
    boxName: boxName || undefined,
    boxSlot,
    ball: optional(draft.ball),
    language: optional(draft.language),
    obtainedPlace: optional(draft.obtainedPlace),
    notes: optional(draft.notes),
  };
}

function optional(value: string): string | undefined {
  return value.trim() || undefined;
}
