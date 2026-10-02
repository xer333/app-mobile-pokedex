import { parseCollectionBackup, type CollectionBackup } from './collection-backup.ts';
import { isPlayerGoal, type PlayerGoal } from './planning.ts';
import { isShinyHunt, type ShinyHunt } from './shiny-hunts.ts';
import { isPokemonSpecimen, type PokemonSpecimen } from './specimens.ts';
import { isAdventureSave, parseAdventureState } from './adventure-saves.ts';
import { isCollectionProject } from './collection-projects.ts';
import type { AccountProfile } from './account';
import type { ActivityState } from './activity';
import type { AdventureState } from './adventure';
import type { CollectionsState } from './collections';

export type FullBackupData = {
  profile: AccountProfile;
  activity: ActivityState;
  adventure: AdventureState;
  collections: CollectionsState;
  planning: { goals: PlayerGoal[] };
  shinyHunts: { hunts: ShinyHunt[] };
};

export type FullBackup = FullBackupData & {
  format: 'pokedex-companion';
  schemaVersion: 2;
  exportedAt: number;
};

export type PortableBackup =
  | { kind: 'full'; backup: FullBackup }
  | { kind: 'specimens'; backup: CollectionBackup };

const MAX_BACKUP_LENGTH = 25_000_000;

export function serializeFullBackup(data: FullBackupData, now = Date.now()): string {
  const backup: FullBackup = {
    format: 'pokedex-companion',
    schemaVersion: 2,
    exportedAt: now,
    ...data,
  };
  return JSON.stringify(backup, null, 2);
}

export function parsePortableBackup(rawValue: string): PortableBackup {
  if (rawValue.length > MAX_BACKUP_LENGTH) {
    throw new Error('Sauvegarde trop volumineuse pour cet import.');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new Error('Le JSON de la sauvegarde est invalide.');
  }
  if (!isRecord(parsed)) throw new Error('Format de sauvegarde non reconnu.');

  if (parsed.schemaVersion === 1) {
    return { kind: 'specimens', backup: parseCollectionBackup(rawValue) };
  }
  if (parsed.format !== 'pokedex-companion' || parsed.schemaVersion !== 2) {
    throw new Error('Version de sauvegarde non reconnue.');
  }
  if (!isFiniteNumber(parsed.exportedAt)) throw new Error('Date d’export invalide.');
  if (!isProfile(parsed.profile)) throw new Error('Profil invalide.');
  if (!isActivity(parsed.activity)) throw new Error('Activité invalide.');
  const adventureValue = parsed.adventure;
  if (!isRecord(adventureValue) || !isNonemptyString(adventureValue.activeGameId)) {
    throw new Error('Jeu actif invalide.');
  }
  if (adventureValue.saves !== undefined && (
    !Array.isArray(adventureValue.saves)
    || adventureValue.saves.length === 0
    || !adventureValue.saves.every(isAdventureSave)
    || new Set(adventureValue.saves.map((save) => save.id)).size !== adventureValue.saves.length
    || !adventureValue.saves.some((save) => save.id === adventureValue.activeSaveId)
  )) {
    throw new Error('Parties invalides.');
  }
  if (!isCollections(parsed.collections)) throw new Error('Collection invalide.');
  if (!isRecord(parsed.planning) || !Array.isArray(parsed.planning.goals)
    || !parsed.planning.goals.every(isPlayerGoal)) {
    throw new Error('Objectifs invalides.');
  }
  if (!isRecord(parsed.shinyHunts) || !Array.isArray(parsed.shinyHunts.hunts)
    || !parsed.shinyHunts.hunts.every(isShinyHunt)) {
    throw new Error('Chasses invalides.');
  }

  const collections: CollectionsState = {
    ...(parsed.collections as CollectionsState),
    projects: (parsed.collections as CollectionsState).projects ?? [],
  };
  const goals = parsed.planning.goals as PlayerGoal[];
  const hunts = parsed.shinyHunts.hunts as ShinyHunt[];
  const adventure = parseAdventureState(JSON.stringify(adventureValue));
  assertUnique(collections.favorites, 'Favoris');
  assertUnique(collections.team, 'Équipe');
  Object.values(collections.teamsBySaveId ?? {}).forEach((team) => assertUnique(team, 'Équipe de partie'));
  assertUnique(collections.specimens.map((specimen) => specimen.id), 'Exemplaires');
  assertUnique(collections.projects.map((project) => project.id), 'Projets');
  assertUnique(goals.map((goal) => goal.id), 'Objectifs');
  assertUnique(goals.flatMap((goal) => goal.tasks.map((task) => task.id)), 'Tâches');
  assertUnique(hunts.map((hunt) => hunt.id), 'Chasses');
  const savesById = new Map(adventure.saves.map((save) => [save.id, save]));
  for (const record of [...collections.specimens, ...goals, ...hunts]) {
    if (!record.saveId) continue;
    const save = savesById.get(record.saveId);
    if (!save || save.gameId !== record.gameId) {
      throw new Error('Une entrée référence une partie absente ou un autre jeu.');
    }
  }
  for (const project of collections.projects) {
    const save = savesById.get(project.saveId);
    if (!save || save.gameId !== project.gameId) {
      throw new Error('Un projet référence une partie absente ou un autre jeu.');
    }
  }

  return {
    kind: 'full',
    backup: {
      format: 'pokedex-companion',
      schemaVersion: 2,
      exportedAt: parsed.exportedAt,
      profile: parsed.profile as AccountProfile,
      activity: parsed.activity as ActivityState,
      adventure,
      collections,
      planning: { goals },
      shinyHunts: { hunts },
    },
  };
}

function isCollections(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return Array.isArray(value.favorites) && value.favorites.every(isNonemptyString)
    && Array.isArray(value.team) && value.team.length <= 6 && value.team.every(isNonemptyString)
    && (value.teamsBySaveId === undefined || (
      isRecord(value.teamsBySaveId)
      && Object.entries(value.teamsBySaveId).every(([saveId, team]) =>
        saveId.length > 0 && Array.isArray(team) && team.length <= 6
        && team.every(isNonemptyString))
    ))
    && (value.comparisonTarget === null || isNonemptyString(value.comparisonTarget))
    && Array.isArray(value.specimens) && value.specimens.every(isPokemonSpecimen)
    && (value.projects === undefined || (
      Array.isArray(value.projects) && value.projects.every(isCollectionProject)
    ));
}

function isProfile(value: unknown): value is AccountProfile {
  return isRecord(value) && typeof value.firstName === 'string'
    && typeof value.lastName === 'string' && typeof value.nickname === 'string';
}

function isActivity(value: unknown): value is ActivityState {
  if (!isRecord(value)) return false;
  return isStringOrNull(value.lastRoute) && isStringOrNull(value.lastLabel)
    && isStringOrNull(value.lastPokemonSlug)
    && Array.isArray(value.recentPokemonSlugs)
    && value.recentPokemonSlugs.length <= 8
    && value.recentPokemonSlugs.every(isNonemptyString)
    && (value.updatedAt === null || isFiniteNumber(value.updatedAt));
}

function assertUnique(values: string[], label: string) {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} : identifiants en double dans la sauvegarde.`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
