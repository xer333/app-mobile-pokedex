import assert from 'node:assert/strict';
import test from 'node:test';

import { prepareSpecimenImport, reviewSpecimenImport } from '../src/_shared/collection-import.ts';
import { createPokemonSpecimen } from '../src/_shared/specimens.ts';

const original = createPokemonSpecimen({
  speciesSlug: 'eevee', formSlug: 'eevee', shiny: false,
  gameId: 'violet', saveId: 'save-1', origin: 'captured',
}, 10, 0.2);

test('l’aperçu distingue identiques, collisions et doublons possibles', () => {
  const collision = { ...original, shiny: true };
  const possibleDuplicate = { ...original, id: 'another-id' };
  assert.deepEqual(reviewSpecimenImport([original], [original, collision, possibleDuplicate]), {
    additions: 1, identical: 1, collisions: 1, possibleDuplicates: 1,
  });
});

test('la copie d’une collision n’écrase rien et un deuxième import est idempotent', () => {
  const collision = { ...original, shiny: true, notes: 'Copie distante' };
  const first = prepareSpecimenImport([original], [collision], 'copy');
  assert.equal(first.copies, 1);
  assert.equal(first.specimens.length, 1);
  assert.notEqual(first.specimens[0].id, original.id);
  assert.equal(first.specimens[0].shiny, true);
  const second = prepareSpecimenImport([original, ...first.specimens], [collision], 'copy');
  assert.deepEqual(second.specimens, []);
  assert.equal(second.copies, 0);
  assert.deepEqual(prepareSpecimenImport([original], [collision], 'skip').specimens, []);
});

test('l’ordre des propriétés JSON ne crée pas une fausse collision', () => {
  const reordered = Object.fromEntries(Object.entries(original).reverse());
  assert.equal(reviewSpecimenImport([original], [reordered]).identical, 1);
});
