import assert from 'node:assert/strict';
import test from 'node:test';

import { analyzeTeamComposition } from '../src/_shared/team-analysis.ts';

test('l’analyse d’équipe compte les types distincts et les répétitions', () => {
  const result = analyzeTeamComposition([
    { slug: 'a', types: ['fire', 'flying'] },
    { slug: 'b', types: ['fire'] },
    { slug: 'c', types: ['water'] },
  ]);
  assert.equal(result.distinctTypes, 3);
  assert.deepEqual(result.repeatedTypes, [{ type: 'fire', count: 2 }]);
});
