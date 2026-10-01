import assert from 'node:assert/strict';
import test from 'node:test';

import { getGameCoverage } from '../src/_shared/game-coverage.ts';

test('un jeu précis ne présente pas les évolutions et formes comme complètes', () => {
  const coverage = getGameCoverage(false);

  assert.equal(coverage.find((row) => row.key === 'moves')?.level, 'contextual');
  assert.equal(coverage.find((row) => row.key === 'encounters')?.level, 'contextual');
  assert.equal(coverage.find((row) => row.key === 'evolutions')?.level, 'partial');
  assert.equal(coverage.find((row) => row.key === 'forms')?.level, 'partial');
});

test('le mode national reste présenté comme un référentiel et non comme un jeu', () => {
  const coverage = getGameCoverage(true);

  assert.ok(coverage.every((row) => row.level === 'reference'));
  assert.ok(coverage.every((row) => row.statusLabel === 'Référence générale'));
});
