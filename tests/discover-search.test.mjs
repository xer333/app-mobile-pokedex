import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getSearchScore,
  normalizePokemonSearch,
} from '../src/discover/search.ts';

const eevee = {
  id: 133,
  nameFr: 'Évoli',
  nameEn: 'Eevee',
  slug: 'eevee',
};

test('la recherche ignore les accents et les espaces externes', () => {
  assert.equal(normalizePokemonSearch(' Evoli '), normalizePokemonSearch('Évoli'));
});

test('un nom français exact est prioritaire', () => {
  assert.equal(getSearchScore(eevee, 'evoli', 'evoli'), 0);
});

test('le numéro national exact est prioritaire', () => {
  assert.equal(getSearchScore(eevee, '133', '133'), 0);
});

test('un début de nom précède une correspondance partielle', () => {
  assert.equal(getSearchScore(eevee, 'evo', 'evo'), 1);
  assert.equal(getSearchScore(eevee, 'vee', 'vee'), 2);
});
