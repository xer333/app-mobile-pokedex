import assert from 'node:assert/strict';
import test from 'node:test';

import {
  adjustCurrentSegment,
  createShinyHunt,
  finishShinyHunt,
  getHuntAttempts,
  getHuntProbability,
  getHuntSpecimenId,
  isShinyHunt,
  startHuntSegment,
} from '../src/_shared/shiny-hunts.ts';

test('un changement de méthode conserve les anciens essais dans un segment fermé', () => {
  let hunt = createShinyHunt('pikachu', 'scarlet', 'Rencontres', 4096, 100);
  hunt = adjustCurrentSegment(hunt, 25);
  hunt = startHuntSegment(hunt, 'Apparitions massives', 1365, 200);
  hunt = adjustCurrentSegment(hunt, 10);

  assert.equal(hunt.segments.length, 2);
  assert.equal(hunt.segments[0].attempts, 25);
  assert.equal(hunt.segments[0].endedAt, 200);
  assert.equal(hunt.segments[1].attempts, 10);
  assert.equal(getHuntAttempts(hunt), 35);
});

test('la correction du compteur ne produit jamais un nombre négatif', () => {
  const hunt = adjustCurrentSegment(createShinyHunt('eevee', 'violet'), -10);
  assert.equal(getHuntAttempts(hunt), 0);
});

test('la probabilité combine les segments sans modifier la chance du prochain essai', () => {
  let hunt = createShinyHunt('eevee', 'violet', 'Méthode A', 2, 100);
  hunt = adjustCurrentSegment(hunt, 1);
  hunt = startHuntSegment(hunt, 'Méthode B', 4, 200);
  hunt = adjustCurrentSegment(hunt, 1);
  assert.equal(getHuntProbability(hunt), 0.625);
});

test('un segment utilisé sans taux rend la probabilité cumulée inconnue', () => {
  const hunt = adjustCurrentSegment(createShinyHunt('eevee', 'violet'), 1);
  assert.equal(getHuntProbability(hunt), null);
  assert.equal(isShinyHunt(hunt), true);
});

test('la trouvaille conserve origine, forme et identifiant stable sans double clôture', () => {
  const hunt = createShinyHunt('pikachu', 'scarlet', 'Œufs', null, 100);
  const specimenId = getHuntSpecimenId(hunt);
  const found = finishShinyHunt(hunt, 'pikachu-cosplay', 'received', 200);
  assert.equal(found.foundSpecimenId, specimenId);
  assert.equal(found.foundFormSlug, 'pikachu-cosplay');
  assert.equal(found.foundOrigin, 'received');
  assert.equal(found.segments[0].endedAt, 200);
  assert.equal(finishShinyHunt(found, 'pikachu', 'captured', 300), found);
  assert.equal(isShinyHunt(found), true);
});
