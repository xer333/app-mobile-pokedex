import { finishShinyHunt, isShinyHunt, type ShinyHunt } from './shiny-hunts.ts';
import type { NewPokemonSpecimen, PokemonSpecimen, PokemonSpecimenOrigin } from './specimens.ts';

export type HuntFoundJournal = {
  schemaVersion: 1;
  foundHunt: ShinyHunt;
};

export function createHuntFoundJournal(
  hunt: ShinyHunt,
  formSlug: string,
  origin: PokemonSpecimenOrigin,
  now = Date.now(),
): HuntFoundJournal {
  if (hunt.status === 'found') throw new Error('Cette chasse est déjà terminée.');
  return { schemaVersion: 1, foundHunt: finishShinyHunt(hunt, formSlug, origin, now) };
}

export function parseHuntFoundJournal(rawValue: string): HuntFoundJournal {
  const parsed: unknown = JSON.parse(rawValue);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Journal de trouvaille invalide.');
  }
  const journal = parsed as Partial<HuntFoundJournal>;
  const hunt = journal.foundHunt;
  if (journal.schemaVersion !== 1 || !isShinyHunt(hunt)
    || hunt.status !== 'found' || !hunt.foundSpecimenId
    || !hunt.foundFormSlug || !hunt.foundOrigin
    || !Number.isFinite(hunt.foundAt)) {
    throw new Error('Journal de trouvaille invalide.');
  }
  return journal as HuntFoundJournal;
}

export function getFoundSpecimen(journal: HuntFoundJournal): NewPokemonSpecimen {
  const hunt = journal.foundHunt;
  return {
    speciesSlug: hunt.targetSlug,
    formSlug: hunt.foundFormSlug ?? hunt.targetSlug,
    shiny: true,
    gameId: hunt.gameId,
    ...(hunt.saveId !== undefined ? { saveId: hunt.saveId } : {}),
    origin: hunt.foundOrigin ?? 'unspecified',
  };
}

export function getHuntRecoveryState(
  journal: HuntFoundJournal,
  currentHunt: ShinyHunt | undefined,
  currentSpecimen: PokemonSpecimen | undefined,
) {
  const expected = journal.foundHunt;
  const huntIdentityMatch = currentHunt?.status === 'found'
    && currentHunt.foundSpecimenId === expected.foundSpecimenId;
  const huntComplete = huntIdentityMatch
    && (!expected.saveId || currentHunt?.saveId === expected.saveId);
  const specimenIdentityMatch = Boolean(currentSpecimen
    && currentSpecimen.speciesSlug === expected.targetSlug
    && currentSpecimen.formSlug === expected.foundFormSlug
    && currentSpecimen.shiny && currentSpecimen.gameId === expected.gameId
    && currentSpecimen.origin === expected.foundOrigin);
  const specimenComplete = specimenIdentityMatch
    && (!expected.saveId || currentSpecimen?.saveId === expected.saveId);
  return {
    huntComplete,
    specimenComplete,
    conflict: (currentHunt?.status === 'found' && (!huntIdentityMatch
      || (Boolean(expected.saveId) && currentHunt.saveId !== undefined
        && currentHunt.saveId !== expected.saveId)))
      || (Boolean(currentSpecimen) && (!specimenIdentityMatch
        || (Boolean(expected.saveId) && currentSpecimen?.saveId !== undefined
          && currentSpecimen?.saveId !== expected.saveId))),
  };
}
