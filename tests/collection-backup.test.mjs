import assert from 'node:assert/strict';
import test from 'node:test';

import {
  mergeSpecimens,
  parseCollectionBackup,
  serializeCollectionBackup,
} from '../src/_shared/collection-backup.ts';
import { createPokemonSpecimen } from '../src/_shared/specimens.ts';

const specimen = createPokemonSpecimen({ speciesSlug: 'eevee', formSlug: 'eevee', shiny: false, gameId: 'violet', origin: 'captured' }, 10, 0.2);

test('un export réimporté restitue les exemplaires', () => {
  const parsed = parseCollectionBackup(serializeCollectionBackup([specimen], 20));
  assert.deepEqual(parsed.specimens, [specimen]);
  assert.equal(parsed.exportedAt, 20);
});

test('un import répété ne duplique pas le même identifiant', () => {
  const merged = mergeSpecimens([specimen], [specimen]);
  assert.equal(merged.specimens.length, 1);
  assert.equal(merged.importedCount, 0);
});

test('un fichier invalide est refusé avant toute fusion', () => {
  assert.throws(() => parseCollectionBackup('{"schemaVersion":2,"specimens":[]}'));
  assert.throws(() => parseCollectionBackup('{"schemaVersion":1,"specimens":[{}]}'));
});
