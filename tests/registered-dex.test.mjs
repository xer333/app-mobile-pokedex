import assert from 'node:assert/strict';
import test from 'node:test';

import { buildDexStatuses, mergeRegisteredSlugs, parseRegisteredList } from '../src/_shared/registered-dex.ts';
import { createPokemonSpecimen } from '../src/_shared/specimens.ts';

const catalog = [
  { id: 133, slug: 'eevee', nameFr: 'Évoli', nameEn: 'Eevee' },
  { id: 25, slug: 'pikachu', nameFr: 'Pikachu', nameEn: 'Pikachu' },
];

test('la liste d’enregistrements reconnaît noms, slug et numéro sans dupliquer', () => {
  const parsed = parseRegisteredList('species\nÉvoli\neevee\n25\nInconnu', catalog);
  assert.deepEqual(parsed.slugs, ['eevee', 'pikachu']);
  assert.equal(parsed.duplicates, 1);
  assert.deepEqual(parsed.unrecognized, [{ line: 5, value: 'Inconnu', reason: 'unknown' }]);
});

test('fusionner des enregistrements est idempotent et ne retire rien', () => {
  assert.deepEqual(mergeRegisteredSlugs(['eevee'], ['eevee', 'pikachu']), ['eevee', 'pikachu']);
  assert.deepEqual(mergeRegisteredSlugs(['eevee', 'pikachu'], ['eevee']), ['eevee', 'pikachu']);
});

test('enregistré et possédé restent indépendants et propres à la partie', () => {
  const own = createPokemonSpecimen({
    speciesSlug: 'pikachu', formSlug: 'pikachu', shiny: false,
    gameId: 'violet', saveId: 'save-1', origin: 'traded',
  }, 10, 0.1);
  const otherSave = { ...own, id: 'other-save', speciesSlug: 'eevee', saveId: 'save-2' };
  const otherGame = { ...own, id: 'other-game', speciesSlug: 'eevee', gameId: 'scarlet' };
  const statuses = buildDexStatuses(catalog, ['eevee'], [own, otherSave, otherGame], 'save-1', 'violet');
  assert.deepEqual(statuses.map((row) => [row.species.slug, row.registered, row.ownedCount]), [
    ['eevee', true, 0],
    ['pikachu', false, 1],
  ]);
});

test('une liste vide ou trop grande est refusée', () => {
  assert.throws(() => parseRegisteredList('species\n', catalog), /vide/);
  assert.throws(() => parseRegisteredList('Évoli\n'.repeat(10_002), catalog), /10 000/);
});
