import assert from 'node:assert/strict';
import test from 'node:test';

import { applyStateUpdates } from '../src/_shared/persisted-state-updates.ts';

test('les modifications lancées avant hydratation se rejouent sur les données restaurées', () => {
  const restored = { favorites: ['pikachu'] };
  const result = applyStateUpdates(restored, [
    (state) => ({ favorites: [...state.favorites, 'eevee'] }),
    (state) => ({ favorites: [...state.favorites, 'bulbasaur'] }),
  ]);
  assert.deepEqual(result.favorites, ['pikachu', 'eevee', 'bulbasaur']);
  assert.deepEqual(restored.favorites, ['pikachu']);
});
