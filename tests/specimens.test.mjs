import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPokemonSpecimen,
  isPokemonSpecimen,
} from '../src/_shared/specimens.ts';

const baseSpecimen = {
  speciesSlug: 'charizard',
  formSlug: 'charizard-mega-x',
  shiny: true,
  gameId: 'ultra-sun',
  origin: 'unspecified',
};

test('un exemplaire conserve séparément espèce, forme, jeu et chromatisme', () => {
  const specimen = createPokemonSpecimen(baseSpecimen, 1234, 0.5);

  assert.equal(specimen.speciesSlug, 'charizard');
  assert.equal(specimen.formSlug, 'charizard-mega-x');
  assert.equal(specimen.shiny, true);
  assert.equal(specimen.gameId, 'ultra-sun');
  assert.equal(specimen.obtainedAt, 1234);
  assert.ok(isPokemonSpecimen(specimen));
});

test('deux exemplaires identiques restent deux possessions distinctes', () => {
  const first = createPokemonSpecimen(baseSpecimen, 1000, 0.1);
  const second = createPokemonSpecimen(baseSpecimen, 1001, 0.2);

  assert.notEqual(first.id, second.id);
});

test('un exemplaire persistant incomplet ou corrompu est refusé', () => {
  assert.equal(isPokemonSpecimen({ ...baseSpecimen, id: '', obtainedAt: 10 }), false);
  assert.equal(
    isPokemonSpecimen({ ...baseSpecimen, id: 'x', obtainedAt: Number.NaN }),
    false,
  );
});
