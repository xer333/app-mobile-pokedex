import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createCollectionProject,
  createProjectTarget,
  getProjectProgress,
  isCollectionProject,
  previewProjectScopeRefresh,
} from '../src/_shared/collection-projects.ts';
import { createPokemonSpecimen } from '../src/_shared/specimens.ts';

const specimen = (shiny, id) => ({
  ...createPokemonSpecimen({
    speciesSlug: 'eevee', formSlug: 'eevee', shiny,
    gameId: 'violet', saveId: 'save-1', origin: 'captured',
  }, 100, id),
  id: `specimen-${id}`,
});

test('un individu ne remplit pas deux cibles du même projet', () => {
  const targets = [
    createProjectTarget('eevee'),
    createProjectTarget('eevee', { shiny: true }),
  ];
  const project = createCollectionProject('Living shiny', 'save-1', 'violet', 'owned',
    'Liste manuelle', 'manual-v1', targets, 100);
  assert.equal(isCollectionProject(project), true);
  const oneShiny = getProjectProgress(project, [specimen(true, 1)], []);
  assert.equal(oneShiny.done, 1);
  assert.equal(oneShiny.targets.find((row) => row.target.id === targets[1].id).done, 1);
  assert.deepEqual(getProjectProgress(project, [specimen(true, 1), specimen(false, 2)], []).done, 2);
});

test('exclusions et quantités changent explicitement le dénominateur', () => {
  const target = createProjectTarget('eevee', { requiredCount: 2 });
  const project = createCollectionProject('Deux Évoli', 'save-1', 'violet', 'owned',
    'Liste manuelle', 'manual-v1', [target], 100);
  assert.deepEqual(getProjectProgress(project, [specimen(false, 1)], []).total, 2);
  assert.deepEqual(getProjectProgress(project, [specimen(false, 1)], []).done, 1);
  assert.deepEqual(getProjectProgress({ ...project, targets: [{ ...target, excluded: true }] },
    [specimen(false, 1)], []).total, 0);
});

test('enregistré reste distinct de possédé après la perte d’un exemplaire', () => {
  const project = createCollectionProject('Dex enregistré', 'save-1', 'violet', 'registered',
    'Liste manuelle', 'manual-v1', [createProjectTarget('eevee')], 100);
  assert.equal(getProjectProgress(project, [], ['eevee']).done, 1);
  assert.equal(getProjectProgress(project, [specimen(false, 1)], []).done, 0);
  assert.equal(isCollectionProject({ ...project, targets: [createProjectTarget('eevee', { shiny: true })] }), false);
});

test('les exemplaires d’une autre partie ne comptent pas', () => {
  const project = createCollectionProject('Living', 'save-1', 'violet', 'owned',
    'Liste manuelle', 'manual-v1', [createProjectTarget('eevee')], 100);
  assert.equal(getProjectProgress(project, [{ ...specimen(false, 1), saveId: 'save-2' }], []).done, 0);
});

test('un nouveau périmètre garde les personnalisations et ne retire que les cibles préréglées absentes', () => {
  const retained = { ...createProjectTarget('eevee', { scopeSource: 'preset', requiredCount: 2 }), excluded: true };
  const removed = createProjectTarget('pikachu', { scopeSource: 'preset' });
  const manual = createProjectTarget('mew', { scopeSource: 'manual', shiny: true });
  const project = createCollectionProject('Living', 'save-1', 'violet', 'owned',
    'Génération I', 'catalog:old', [retained, removed, manual], 100,
    { generation: 'generation-i', shinyPreset: true });
  const proposal = previewProjectScopeRefresh(project, 'generation-i', [
    { slug: 'eevee', generation: 'generation-i' },
    { slug: 'bulbasaur', generation: 'generation-i' },
  ], 'Génération I', 'catalog:new');
  assert.deepEqual(proposal.removed.map((target) => target.id), [removed.id]);
  assert.deepEqual(proposal.added.map((target) => [target.speciesSlug, target.shiny]), [['bulbasaur', true]]);
  assert.ok(proposal.nextProject.targets.includes(retained));
  assert.ok(proposal.nextProject.targets.includes(manual));
  assert.equal(proposal.nextProject.scopeRevision, 'catalog:new');
  assert.equal(isCollectionProject(proposal.nextProject), true);
});

test('un ancien projet sans provenance conserve ses cibles lors de la comparaison', () => {
  const oldTarget = createProjectTarget('pikachu');
  const project = createCollectionProject('Ancien', 'save-1', 'violet', 'registered',
    'Génération I', 'catalog:old', [oldTarget], 100);
  const proposal = previewProjectScopeRefresh(project, 'generation-ii', [
    { slug: 'eevee', generation: 'generation-ii' },
  ], 'Génération II', 'catalog:new');
  assert.deepEqual(proposal.removed, []);
  assert.equal(proposal.legacyUnclassified, 1);
  assert.equal(proposal.nextProject.targets.length, 2);
  assert.equal(isCollectionProject(proposal.nextProject), true);
});
