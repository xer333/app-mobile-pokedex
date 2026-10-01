import assert from 'node:assert/strict';
import test from 'node:test';

import { createPlanTask, createPlayerGoal, findResourceConflicts, getGoalProgress } from '../src/_shared/planning.ts';

test('la progression vient uniquement des tâches déclarées', () => {
  const goal = createPlayerGoal('Objectif', 'violet', 1);
  goal.tasks = [createPlanTask('A', null, 2), { ...createPlanTask('B', null, 3), done: true }];
  assert.deepEqual(getGoalProgress(goal), { done: 1, total: 2, ratio: 0.5 });
});

test('une ressource réclamée par deux objectifs incomplets est signalée', () => {
  const first = createPlayerGoal('Premier', 'violet', 1);
  const second = createPlayerGoal('Second', 'violet', 2);
  first.tasks = [createPlanTask('Faire évoluer', 'Pierre Feu', 3)];
  second.tasks = [createPlanTask('Autre évolution', 'pierre feu', 4)];
  assert.equal(findResourceConflicts([first, second])[0]?.resourceKey, 'pierre feu');
});

test('une ressource déjà consommée dans une tâche terminée ne bloque plus le plan actif', () => {
  const first = createPlayerGoal('Premier', 'violet', 1);
  const second = createPlayerGoal('Second', 'violet', 2);
  first.tasks = [{ ...createPlanTask('Fini', 'objet', 3), done: true }];
  second.tasks = [createPlanTask('À faire', 'objet', 4)];
  assert.deepEqual(findResourceConflicts([first, second]), []);
});
