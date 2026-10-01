import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyEvolutionContext,
  getEvolutionContextLabel,
} from '../src/_shared/evolution-context.ts';

test('le référentiel national ne prétend pas vérifier un jeu précis', () => {
  assert.equal(classifyEvolutionContext(['sun-moon'], null), 'reference');
});

test('une correspondance exacte signifie seulement que la condition a été introduite là', () => {
  const status = classifyEvolutionContext(['red-blue', 'scarlet-violet'], 'scarlet-violet');

  assert.equal(status, 'introduced');
  assert.match(getEvolutionContextLabel(status, 'Écarlate'), /introduite/i);
  assert.match(getEvolutionContextLabel(status, 'Écarlate'), /à vérifier/i);
});

test('une condition sans groupe correspondant reste non vérifiée', () => {
  const status = classifyEvolutionContext(['sun-moon'], 'sword-shield');

  assert.equal(status, 'unverified');
  assert.match(getEvolutionContextLabel(status, 'Épée'), /non vérifiée/i);
});

test('une donnée ancienne sans groupe de version ne devient jamais une compatibilité', () => {
  assert.equal(classifyEvolutionContext([], 'ultra-sun-ultra-moon'), 'unverified');
});
