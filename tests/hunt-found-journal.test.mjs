import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createHuntFoundJournal,
  getFoundSpecimen,
  getHuntRecoveryState,
  parseHuntFoundJournal,
} from '../src/_shared/hunt-found-journal.ts';
import { createShinyHunt } from '../src/_shared/shiny-hunts.ts';

test('le journal retrouve une trouvaille identique après relecture', () => {
  const hunt = createShinyHunt('eevee', 'violet', 'Œufs', 4096, 100);
  const journal = createHuntFoundJournal(hunt, 'eevee', 'received', 200);
  const restored = parseHuntFoundJournal(JSON.stringify(journal));
  assert.deepEqual(restored, journal);
  assert.equal(restored.foundHunt.status, 'found');
  assert.equal(restored.foundHunt.foundAt, 200);
  assert.deepEqual(getFoundSpecimen(restored), {
    speciesSlug: 'eevee', formSlug: 'eevee', shiny: true,
    gameId: 'violet', origin: 'received',
  });
});

test('un journal incomplet ou une chasse déjà terminée sont refusés', () => {
  const hunt = createShinyHunt('eevee', 'violet');
  const journal = createHuntFoundJournal(hunt, 'eevee', 'captured');
  assert.throws(() => createHuntFoundJournal(journal.foundHunt, 'eevee', 'captured'));
  assert.throws(() => parseHuntFoundJournal('{"schemaVersion":1,"foundHunt":{}}'));
  assert.throws(() => parseHuntFoundJournal(JSON.stringify({ ...journal, foundHunt: { ...journal.foundHunt, foundSpecimenId: null } })));
});

test('la reprise n’ajoute que la moitié absente et détecte un conflit', () => {
  const hunt = createShinyHunt('eevee', 'violet');
  const journal = createHuntFoundJournal(hunt, 'eevee', 'received', 200);
  const specimen = {
    id: journal.foundHunt.foundSpecimenId,
    ...getFoundSpecimen(journal),
    obtainedAt: 200,
  };
  assert.deepEqual(getHuntRecoveryState(journal, hunt, undefined), {
    huntComplete: false, specimenComplete: false, conflict: false,
  });
  assert.equal(getHuntRecoveryState(journal, journal.foundHunt, undefined).huntComplete, true);
  assert.equal(getHuntRecoveryState(journal, hunt, specimen).specimenComplete, true);
  assert.deepEqual(getHuntRecoveryState(journal, journal.foundHunt, specimen), {
    huntComplete: true, specimenComplete: true, conflict: false,
  });
  assert.equal(getHuntRecoveryState(journal, journal.foundHunt, { ...specimen, gameId: 'scarlet' }).conflict, true);
});

test('la reprise complète un lien de partie manquant sans remplacer une autre attribution explicite', () => {
  const hunt = createShinyHunt('eevee', 'violet', 'Œufs', null, 100, 'save-legacy-violet');
  const journal = createHuntFoundJournal(hunt, 'eevee', 'received', 200);
  const specimen = {
    id: journal.foundHunt.foundSpecimenId,
    ...getFoundSpecimen(journal),
    obtainedAt: 200,
  };
  assert.equal(getHuntRecoveryState(journal, journal.foundHunt, specimen).specimenComplete, true);
  const missingLink = { ...specimen, saveId: undefined };
  const recoverable = getHuntRecoveryState(journal, journal.foundHunt, missingLink);
  assert.equal(recoverable.specimenComplete, false);
  assert.equal(recoverable.conflict, false);
  assert.equal(getHuntRecoveryState(journal, journal.foundHunt, { ...specimen, saveId: null }).conflict, true);
});
