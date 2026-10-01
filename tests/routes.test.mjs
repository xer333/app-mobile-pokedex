import assert from 'node:assert/strict';
import test from 'node:test';

import { detailRoute, moveRoute } from '../src/_shared/routes.ts';

test('une forme conserve explicitement son espèce de référence dans la route', () => {
  assert.equal(
    detailRoute('deoxys-attack', 'about', 'deoxys'),
    '/detail/deoxys-attack?tab=about&species=deoxys',
  );
});

test('une fiche de capacité conserve le Pokémon qui fournit son obtention', () => {
  assert.equal(moveRoute('thunderbolt', 'pikachu'), '/move/thunderbolt?pokemon=pikachu');
});

test('les routes simples restent compatibles avec les anciens liens', () => {
  assert.equal(detailRoute('pikachu'), '/detail/pikachu');
  assert.equal(moveRoute('thunderbolt'), '/move/thunderbolt');
});
