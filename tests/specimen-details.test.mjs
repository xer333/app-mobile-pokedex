import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createSpecimenDetailsDraft,
  parseSpecimenDetailsDraft,
} from '../src/_shared/specimen-details.ts';
import { createPokemonSpecimen, isPokemonSpecimen } from '../src/_shared/specimens.ts';
import { parsePortableBackup, serializeFullBackup } from '../src/_shared/full-backup.ts';

const specimen = createPokemonSpecimen({
  speciesSlug: 'eevee', formSlug: 'eevee', shiny: false,
  gameId: 'violet', origin: 'captured',
  nickname: 'Luna', boxName: 'Équipe B', boxSlot: 3,
  ball: 'Luxe Ball', language: 'FR', obtainedPlace: 'Paldea', notes: 'Élevé à la main',
}, 100, 0.1);

test('le passeport et le rangement survivent à la sérialisation', () => {
  assert.equal(isPokemonSpecimen(specimen), true);
  const draft = createSpecimenDetailsDraft(specimen);
  assert.equal(draft.boxSlot, '3');
  assert.deepEqual(parseSpecimenDetailsDraft(draft), {
    nickname: 'Luna', boxName: 'Équipe B', boxSlot: 3,
    ball: 'Luxe Ball', language: 'FR', obtainedPlace: 'Paldea', notes: 'Élevé à la main',
  });
  const backup = parsePortableBackup(serializeFullBackup({
    profile: { firstName: 'A', lastName: '', nickname: 'a' },
    activity: { lastRoute: null, lastLabel: null, lastPokemonSlug: null, recentPokemonSlugs: [], updatedAt: null },
    adventure: { activeGameId: 'violet' },
    collections: { favorites: [], team: [], comparisonTarget: null, specimens: [specimen] },
    planning: { goals: [] }, shinyHunts: { hunts: [] },
  }));
  assert.equal(backup.kind, 'full');
  assert.deepEqual(backup.backup.collections.specimens[0], specimen);
});

test('un emplacement sans boîte ou non entier est refusé', () => {
  const draft = createSpecimenDetailsDraft(specimen);
  assert.throws(() => parseSpecimenDetailsDraft({ ...draft, boxSlot: '0' }));
  assert.throws(() => parseSpecimenDetailsDraft({ ...draft, boxSlot: '2.5' }));
  assert.throws(() => parseSpecimenDetailsDraft({ ...draft, boxName: '', boxSlot: '2' }));
  assert.equal(isPokemonSpecimen({ ...specimen, boxSlot: -1 }), false);
});
