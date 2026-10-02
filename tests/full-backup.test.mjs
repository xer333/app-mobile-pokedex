import assert from 'node:assert/strict';
import test from 'node:test';

import { serializeCollectionBackup } from '../src/_shared/collection-backup.ts';
import { replayRestoreJournal, restoreFullBackup, stageRestoreJournal } from '../src/_shared/backup-restore.ts';
import { backupStorageKeys, restoreJournalKey } from '../src/_shared/backup-storage-keys.ts';
import { parsePortableBackup, serializeFullBackup } from '../src/_shared/full-backup.ts';
import { createPlayerGoal } from '../src/_shared/planning.ts';
import { createShinyHunt } from '../src/_shared/shiny-hunts.ts';
import { createPokemonSpecimen } from '../src/_shared/specimens.ts';
import { createLegacyAdventure } from '../src/_shared/adventure-saves.ts';
import { createCollectionProject, createProjectTarget } from '../src/_shared/collection-projects.ts';

const specimen = createPokemonSpecimen({
  speciesSlug: 'eevee', formSlug: 'eevee', shiny: true,
  gameId: 'violet', origin: 'received',
}, 100, 0.2);

function makeData() {
  return {
    profile: { firstName: 'Camille', lastName: '', nickname: 'cam' },
    activity: {
      lastRoute: '/detail/eevee', lastLabel: 'Évoli', lastPokemonSlug: 'eevee',
      recentPokemonSlugs: ['eevee'], updatedAt: 100,
    },
    adventure: createLegacyAdventure('violet'),
    collections: {
      favorites: ['eevee'], team: ['eevee'], comparisonTarget: null,
      specimens: [specimen], projects: [],
    },
    planning: { goals: [createPlayerGoal('Projet', 'violet', 200)] },
    shinyHunts: { hunts: [createShinyHunt('pikachu', 'violet', 'Œufs', 4096, 300)] },
  };
}

function memoryStorage() {
  const values = new Map();
  let failKey = null;
  return {
    values,
    failOnceOn(key) { failKey = key; },
    async getItem(key) { return values.get(key) ?? null; },
    async setItem(key, value) {
      if (key === failKey) { failKey = null; throw new Error('écriture interrompue'); }
      values.set(key, value);
    },
    async removeItem(key) { values.delete(key); },
  };
}

test('une sauvegarde complète conserve les six blocs personnels', () => {
  const data = makeData();
  const parsed = parsePortableBackup(serializeFullBackup(data, 400));
  assert.equal(parsed.kind, 'full');
  assert.equal(parsed.backup.exportedAt, 400);
  assert.deepEqual(parsed.backup.profile, data.profile);
  assert.deepEqual(parsed.backup.activity, data.activity);
  assert.deepEqual(parsed.backup.adventure, data.adventure);
  assert.deepEqual(parsed.backup.collections, data.collections);
  assert.deepEqual(parsed.backup.planning, data.planning);
  assert.deepEqual(parsed.backup.shinyHunts, data.shinyHunts);
});

test('l’ancien export des seuls exemplaires reste importable sans faux remplacement global', () => {
  const parsed = parsePortableBackup(serializeCollectionBackup([specimen], 400));
  assert.equal(parsed.kind, 'specimens');
  assert.deepEqual(parsed.backup.specimens, [specimen]);
});

test('un doublon ou un bloc corrompu invalide toute la sauvegarde complète', () => {
  const duplicate = makeData();
  duplicate.collections.specimens.push({ ...specimen });
  assert.throws(() => parsePortableBackup(serializeFullBackup(duplicate)));

  const corrupt = makeData();
  corrupt.planning.goals = [{}];
  assert.throws(() => parsePortableBackup(serializeFullBackup(corrupt)));
  assert.throws(() => parsePortableBackup('{"schemaVersion":3}'));
});

test('une copie de secours impossible empêche tout remplacement', async () => {
  const data = makeData();
  const parsed = parsePortableBackup(serializeFullBackup(data));
  assert.equal(parsed.kind, 'full');
  const calls = [];
  const writers = Object.fromEntries(
    ['profile', 'activity', 'adventure', 'collections', 'planning', 'shinyHunts']
      .map((name) => [name, () => calls.push(name)]),
  );
  await assert.rejects(restoreFullBackup(
    parsed.backup,
    data,
    async () => { throw new Error('stockage plein'); },
    memoryStorage(),
    writers,
  ));
  assert.deepEqual(calls, []);
});

test('une restauration interrompue garde son journal et converge au redémarrage', async () => {
  const previous = makeData();
  const target = makeData();
  target.profile.nickname = 'nouveau';
  target.collections.favorites = ['pikachu'];
  const parsed = parsePortableBackup(serializeFullBackup(target));
  assert.equal(parsed.kind, 'full');
  const storage = memoryStorage();
  storage.failOnceOn(backupStorageKeys.collections);
  const calls = [];
  const writers = Object.fromEntries(
    ['profile', 'activity', 'adventure', 'collections', 'planning', 'shinyHunts']
      .map((name) => [name, () => calls.push(name)]),
  );
  let recovery = null;
  await assert.rejects(restoreFullBackup(parsed.backup, previous,
    async (value) => { recovery = value; }, storage, writers), /journal/);
  assert.ok(recovery);
  assert.ok(storage.values.has(restoreJournalKey));
  assert.deepEqual(calls, ['profile', 'activity', 'adventure', 'collections', 'planning', 'shinyHunts']);
  assert.equal(await replayRestoreJournal(storage), true);
  assert.equal(storage.values.has(restoreJournalKey), false);
  for (const [name, key] of Object.entries(backupStorageKeys)) {
    assert.deepEqual(JSON.parse(storage.values.get(key)), parsed.backup[name]);
  }
  assert.equal(await replayRestoreJournal(storage), false);
});

test('une restauration complète efface le journal après les six écritures', async () => {
  const previous = makeData();
  const target = makeData();
  target.profile.nickname = 'restauré';
  const parsed = parsePortableBackup(serializeFullBackup(target));
  assert.equal(parsed.kind, 'full');
  const storage = memoryStorage();
  const calls = [];
  const writers = Object.fromEntries(
    ['profile', 'activity', 'adventure', 'collections', 'planning', 'shinyHunts']
      .map((name) => [name, () => calls.push(name)]),
  );
  let recovery = null;
  await restoreFullBackup(parsed.backup, previous,
    async (value) => { recovery = value; }, storage, writers);
  assert.equal(parsePortableBackup(recovery).kind, 'full');
  assert.equal(storage.values.has(restoreJournalKey), false);
  assert.deepEqual(calls, ['profile', 'activity', 'adventure', 'collections', 'planning', 'shinyHunts']);
  assert.equal(JSON.parse(storage.values.get(backupStorageKeys.profile)).nickname, 'restauré');
});

test('si le journal ne peut pas être préparé, aucun bloc ni contexte ne change', async () => {
  const previous = makeData();
  const parsed = parsePortableBackup(serializeFullBackup(makeData()));
  assert.equal(parsed.kind, 'full');
  const storage = memoryStorage();
  storage.failOnceOn(restoreJournalKey);
  const calls = [];
  const writers = Object.fromEntries(
    ['profile', 'activity', 'adventure', 'collections', 'planning', 'shinyHunts']
      .map((name) => [name, () => calls.push(name)]),
  );
  await assert.rejects(restoreFullBackup(parsed.backup, previous, async () => {}, storage, writers));
  assert.deepEqual(calls, []);
  assert.equal(storage.values.size, 0);
});

test('un journal invalide reste en place sans modifier les blocs personnels', async () => {
  const storage = memoryStorage();
  storage.values.set(restoreJournalKey, '{"schemaVersion":999}');
  await assert.rejects(replayRestoreJournal(storage));
  assert.ok(storage.values.has(restoreJournalKey));
  assert.equal(storage.values.has(backupStorageKeys.profile), false);
});

test('la préparation d’un journal refuse une sauvegarde corrompue', async () => {
  const storage = memoryStorage();
  const parsed = parsePortableBackup(serializeFullBackup(makeData()));
  assert.equal(parsed.kind, 'full');
  await assert.rejects(stageRestoreJournal(storage, { ...parsed.backup, collections: { ...parsed.backup.collections, specimens: [{}] } }));
  assert.equal(storage.values.has(restoreJournalKey), false);
});

test('un lien vers une partie d’un autre jeu invalide l’import global', () => {
  const data = makeData();
  data.collections.specimens = [{ ...specimen, saveId: data.adventure.activeSaveId }];
  assert.equal(parsePortableBackup(serializeFullBackup(data)).kind, 'full');
  data.collections.specimens = [{ ...specimen, gameId: 'scarlet', saveId: data.adventure.activeSaveId }];
  assert.throws(() => parsePortableBackup(serializeFullBackup(data)));
});

test('les projets et leurs cibles figées survivent à la sauvegarde complète', () => {
  const data = makeData();
  const project = createCollectionProject('Living', data.adventure.activeSaveId, 'violet',
    'owned', 'Génération I', 'catalog:2026-04-14',
    [createProjectTarget('eevee', { scopeSource: 'preset' })], 500,
    { generation: 'generation-i', shinyPreset: false });
  data.collections.projects = [project];
  const parsed = parsePortableBackup(serializeFullBackup(data));
  assert.equal(parsed.kind, 'full');
  assert.deepEqual(parsed.backup.collections.projects, [project]);
  data.collections.projects = [{ ...project, gameId: 'scarlet' }];
  assert.throws(() => parsePortableBackup(serializeFullBackup(data)));
});
