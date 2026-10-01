import assert from 'node:assert/strict';
import test from 'node:test';

import { analyzeComparison } from '../src/_shared/comparison-analysis.ts';

test('la comparaison associe les statistiques par libellé et non par position', () => {
  const result = analyzeComparison(
    { name: 'A', stats: [{ label: 'Vitesse', value: 90 }], weaknesses: [], resistances: [] },
    { name: 'B', stats: [{ label: 'Vitesse', value: 70 }], weaknesses: [], resistances: [] },
  );
  assert.equal(result.statDifferences[0].delta, 20);
});

test('les faiblesses communes et résistances propres restent distinctes', () => {
  const result = analyzeComparison(
    { name: 'A', stats: [], weaknesses: [{ type: 'Feu', multiplier: 2 }], resistances: [{ type: 'Eau', multiplier: 0.5 }] },
    { name: 'B', stats: [], weaknesses: [{ type: 'Feu', multiplier: 2 }], resistances: [{ type: 'Plante', multiplier: 0.5 }] },
  );
  assert.deepEqual(result.commonWeaknesses, ['Feu']);
  assert.deepEqual(result.leftUniqueResistances, ['Eau']);
  assert.deepEqual(result.rightUniqueResistances, ['Plante']);
});
