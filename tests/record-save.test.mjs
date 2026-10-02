import assert from 'node:assert/strict';
import test from 'node:test';

import { createAdventureSave, createLegacyAdventure } from '../src/_shared/adventure-saves.ts';
import { inferLegacySaveId, isCompatibleSave, migrateRecordsToSaves } from '../src/_shared/record-save.ts';

test('les anciennes entrées rejoignent la partie héritée sans changer leur jeu', () => {
  const first = createLegacyAdventure('violet').saves[0];
  const second = createAdventureSave('violet', 'Autre partie', 100);
  const records = [{ id: 'one', gameId: 'violet' }, { id: 'two', gameId: 'scarlet' }];
  const migrated = migrateRecordsToSaves(records, [first, second]);
  assert.equal(migrated[0].saveId, first.id);
  assert.equal(migrated[1].saveId, undefined);
  assert.equal(records[0].saveId, undefined);
});

test('une ancienne entrée ambiguë reste visible comme sans partie', () => {
  const saves = [createAdventureSave('scarlet', 'A', 100), createAdventureSave('scarlet', 'B', 200)];
  assert.equal(inferLegacySaveId('scarlet', saves), undefined);
  const records = [{ gameId: 'scarlet' }];
  assert.equal(migrateRecordsToSaves(records, saves), records);
});

test('une attribution explicite sans partie n’est jamais migrée automatiquement', () => {
  const save = createLegacyAdventure('violet').saves[0];
  const records = [{ gameId: 'violet', saveId: null }];
  assert.equal(migrateRecordsToSaves(records, [save]), records);
});

test('une entrée ne peut être rattachée à une partie d’un autre jeu', () => {
  const save = createLegacyAdventure('violet').saves[0];
  assert.equal(isCompatibleSave(save.id, 'violet', [save]), true);
  assert.equal(isCompatibleSave(save.id, 'scarlet', [save]), false);
  assert.equal(isCompatibleSave(null, 'scarlet', [save]), true);
});
