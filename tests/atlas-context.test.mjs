import assert from 'node:assert/strict';
import test from 'node:test';

import { applyAtlasContext } from '../src/_shared/atlas-context.ts';

const location = {
  key: 'route-test',
  areaName: 'Route test',
  locationName: 'Zone test',
  regionKey: 'kanto',
  regionLabel: 'Kanto',
  versions: ['Rouge', 'Bleu'],
  versionSlugs: ['red', 'blue'],
  versionDetails: [
    {
      slug: 'red',
      label: 'Rouge',
      methods: ['Marche'],
      minLevel: 3,
      maxLevel: 5,
      chance: 20,
    },
    {
      slug: 'blue',
      label: 'Bleu',
      methods: ['Pêche'],
      minLevel: 8,
      maxLevel: 12,
      chance: 5,
    },
  ],
  methods: ['Marche', 'Pêche'],
  minLevel: 3,
  maxLevel: 12,
  chance: 20,
};

test('un filtre de version ne mélange plus les détails des rencontres', () => {
  const [red] = applyAtlasContext([location], 'kanto', 'red');
  const [blue] = applyAtlasContext([location], 'kanto', 'blue');

  assert.deepEqual(red.methods, ['Marche']);
  assert.equal(red.minLevel, 3);
  assert.equal(red.maxLevel, 5);
  assert.equal(red.chance, 20);
  assert.deepEqual(blue.methods, ['Pêche']);
  assert.equal(blue.minLevel, 8);
  assert.equal(blue.maxLevel, 12);
  assert.equal(blue.chance, 5);
});

test('une version absente ne produit aucun faux lieu', () => {
  assert.deepEqual(applyAtlasContext([location], 'kanto', 'yellow'), []);
});

test('le référentiel général conserve la synthèse multi-version', () => {
  assert.equal(applyAtlasContext([location], 'all', 'all')[0], location);
});
