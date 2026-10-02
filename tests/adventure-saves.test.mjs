import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createAdventureSave,
  createLegacyAdventure,
  parseAdventureState,
  activateAdventureGame,
  activateAdventureSave,
  archiveAdventureSave,
  restoreAdventureSave,
} from '../src/_shared/adventure-saves.ts';
import { getTeamForSave, setTeamForSave } from '../src/_shared/team-by-save.ts';
import { parsePortableBackup, serializeFullBackup } from '../src/_shared/full-backup.ts';
import { createPokemonSpecimen } from '../src/_shared/specimens.ts';

test('l’ancienne partie garde un identifiant stable et son équipe', () => {
  const adventure = parseAdventureState('{"activeGameId":"violet"}');
  assert.equal(adventure.activeSaveId, 'save-legacy-violet');
  const oldCollection = { team: ['eevee'] };
  assert.deepEqual(getTeamForSave(oldCollection, adventure.activeSaveId, adventure.saves[0].id), ['eevee']);
});

test('deux parties du même jeu conservent des équipes distinctes', () => {
  const adventure = createLegacyAdventure('violet');
  const second = createAdventureSave('violet', 'Nuzlocke', 100);
  let collections = { team: ['eevee'] };
  collections = setTeamForSave(collections, second.id, adventure.saves[0].id, ['pikachu']);
  assert.deepEqual(getTeamForSave(collections, adventure.activeSaveId, adventure.saves[0].id), ['eevee']);
  assert.deepEqual(getTeamForSave(collections, second.id, adventure.saves[0].id), ['pikachu']);
});

test('un ancien export global reste importable avec migration de partie', () => {
  const data = {
    profile: { firstName: 'A', lastName: '', nickname: 'a' },
    activity: { lastRoute: null, lastLabel: null, lastPokemonSlug: null, recentPokemonSlugs: [], updatedAt: null },
    adventure: { activeGameId: 'scarlet' },
    collections: { favorites: [], team: ['eevee'], comparisonTarget: null, specimens: [] },
    planning: { goals: [] }, shinyHunts: { hunts: [] },
  };
  const parsed = parsePortableBackup(serializeFullBackup(data, 200));
  assert.equal(parsed.kind, 'full');
  assert.equal(parsed.backup.adventure.activeSaveId, 'save-legacy-scarlet');
  assert.deepEqual(parsed.backup.collections.projects, []);
  assert.deepEqual(getTeamForSave(parsed.backup.collections,
    parsed.backup.adventure.activeSaveId, parsed.backup.adventure.saves[0].id), ['eevee']);
});

test('une sauvegarde globale conserve deux parties et leurs équipes', () => {
  const first = createLegacyAdventure('violet');
  const second = createAdventureSave('violet', 'Défi sans échange', 100);
  const data = {
    profile: { firstName: 'A', lastName: '', nickname: 'a' },
    activity: { lastRoute: null, lastLabel: null, lastPokemonSlug: null, recentPokemonSlugs: [], updatedAt: null },
    adventure: {
      activeGameId: 'violet', activeSaveId: second.id,
      saves: [first.saves[0], { ...second, rules: { allowTrades: false, allowTransfers: false }, registeredSlugs: ['eevee'] }],
    },
    collections: {
      favorites: [], team: ['pikachu'],
      teamsBySaveId: { [first.activeSaveId]: ['eevee'], [second.id]: ['pikachu'] },
      comparisonTarget: null, specimens: [],
    },
    planning: { goals: [] }, shinyHunts: { hunts: [] },
  };
  const parsed = parsePortableBackup(serializeFullBackup(data));
  assert.equal(parsed.kind, 'full');
  assert.deepEqual(parsed.backup.adventure, data.adventure);
  assert.deepEqual(parsed.backup.collections.teamsBySaveId, data.collections.teamsBySaveId);
});

test('des parties persistées corrompues ne sont pas effacées silencieusement', () => {
  assert.throws(() => parseAdventureState('{"activeGameId":"violet","saves":[{}]}'));
});

test('archiver la partie active choisit une autre partie et restaure sans perdre son identité', () => {
  const first = createLegacyAdventure('violet');
  const second = createAdventureSave('violet', 'Défi', 100);
  const state = { ...first, saves: [...first.saves, second] };
  const archived = archiveAdventureSave(state, first.activeSaveId, 200);
  assert.equal(archived.activeSaveId, second.id);
  assert.equal(archived.saves[0].archivedAt, 200);
  assert.equal(activateAdventureSave(archived, first.activeSaveId), archived);
  const restored = restoreAdventureSave(archived, first.activeSaveId);
  assert.equal(restored.activeSaveId, first.activeSaveId);
  assert.equal(restored.saves[0].archivedAt, undefined);
  assert.deepEqual(restored.saves[0].registeredSlugs, first.saves[0].registeredSlugs);
});

test('la dernière partie active ne peut pas être archivée', () => {
  const state = createLegacyAdventure('violet');
  assert.equal(archiveAdventureSave(state, state.activeSaveId), state);
});

test('changer de jeu ne réactive pas une archive et garde la partie archivée', () => {
  const violet = createLegacyAdventure('violet');
  const scarlet = createAdventureSave('scarlet', 'Ancienne', 100);
  const mixed = { ...violet, saves: [...violet.saves, { ...scarlet, archivedAt: 200 }] };
  const selected = activateAdventureGame(mixed, 'scarlet');
  assert.equal(selected.activeGameId, 'scarlet');
  assert.notEqual(selected.activeSaveId, scarlet.id);
  assert.equal(selected.saves.find((save) => save.id === scarlet.id).archivedAt, 200);
});

test('une archive et ses exemplaires restent dans la sauvegarde globale', () => {
  const first = createLegacyAdventure('violet');
  const second = createAdventureSave('violet', 'Active', 100);
  const adventure = archiveAdventureSave({ ...first, saves: [...first.saves, second] }, first.activeSaveId, 200);
  const specimen = createPokemonSpecimen({ speciesSlug: 'eevee', formSlug: 'eevee', shiny: false,
    gameId: 'violet', saveId: first.activeSaveId, origin: 'captured' }, 50, 0.1);
  const data = {
    profile: { firstName: 'A', lastName: '', nickname: 'a' },
    activity: { lastRoute: null, lastLabel: null, lastPokemonSlug: null, recentPokemonSlugs: [], updatedAt: null },
    adventure,
    collections: { favorites: [], team: [], teamsBySaveId: { [first.activeSaveId]: ['eevee'] },
      comparisonTarget: null, specimens: [specimen], projects: [] },
    planning: { goals: [] }, shinyHunts: { hunts: [] },
  };
  const parsed = parsePortableBackup(serializeFullBackup(data));
  assert.equal(parsed.kind, 'full');
  assert.deepEqual(parsed.backup.adventure, adventure);
  assert.deepEqual(parsed.backup.collections.specimens, [specimen]);
  assert.deepEqual(parsed.backup.collections.teamsBySaveId[first.activeSaveId], ['eevee']);
});
