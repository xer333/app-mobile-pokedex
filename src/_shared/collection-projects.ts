import type { PokemonSpecimen, PokemonSpecimenOrigin } from './specimens.ts';

export type ProjectCompletion = 'owned' | 'registered';

export type ProjectTarget = {
  id: string;
  speciesSlug: string;
  formSlug: string | null;
  shiny: boolean | null;
  origin: PokemonSpecimenOrigin | null;
  requiredCount: number;
  excluded: boolean;
  scopeSource?: 'preset' | 'manual';
};

export type CollectionProject = {
  id: string;
  saveId: string;
  gameId: string;
  title: string;
  completion: ProjectCompletion;
  scopeLabel: string;
  scopeRevision: string;
  createdAt: number;
  targets: ProjectTarget[];
  scopeGeneration?: string | null;
  scopeShiny?: boolean;
};

export function createProjectTarget(
  speciesSlug: string,
  options: Partial<Pick<ProjectTarget, 'formSlug' | 'shiny' | 'origin' | 'requiredCount' | 'scopeSource'>> = {},
): ProjectTarget {
  return {
    id: `target-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    speciesSlug,
    formSlug: options.formSlug ?? null,
    shiny: options.shiny ?? null,
    origin: options.origin ?? null,
    requiredCount: options.requiredCount ?? 1,
    excluded: false,
    ...(options.scopeSource ? { scopeSource: options.scopeSource } : {}),
  };
}

export function createCollectionProject(
  title: string,
  saveId: string,
  gameId: string,
  completion: ProjectCompletion,
  scopeLabel: string,
  scopeRevision: string,
  targets: ProjectTarget[],
  now = Date.now(),
  scope?: { generation: string | null; shinyPreset: boolean },
): CollectionProject {
  return {
    id: `project-${now}-${Math.random().toString(36).slice(2, 9)}`,
    saveId,
    gameId,
    title: title.trim() || 'Projet de collection',
    completion,
    scopeLabel,
    scopeRevision,
    createdAt: now,
    targets,
    ...(scope ? { scopeGeneration: scope.generation, scopeShiny: scope.shinyPreset } : {}),
  };
}

export function previewProjectScopeRefresh(
  project: CollectionProject,
  generation: string,
  catalog: Array<{ slug: string; generation: string }>,
  scopeLabel: string,
  scopeRevision: string,
  newTargetShiny = project.scopeShiny ?? false,
) {
  const species = new Set(catalog.filter((item) => item.generation === generation).map((item) => item.slug));
  if (!species.size) throw new Error('Aucune espèce dans cette génération du référentiel.');
  const removed = project.targets.filter((target) => target.scopeSource === 'preset'
    && !species.has(target.speciesSlug));
  const removedIds = new Set(removed.map((target) => target.id));
  const retained = project.targets.filter((target) => !removedIds.has(target.id));
  const represented = new Set(retained.map((target) => target.speciesSlug));
  const added = [...species].filter((slug) => !represented.has(slug)).map((slug) =>
    createProjectTarget(slug, {
      shiny: project.completion === 'owned' && newTargetShiny ? true : null,
      scopeSource: 'preset',
    }));
  const nextProject: CollectionProject = {
    ...project,
    scopeGeneration: generation,
    scopeLabel,
    scopeRevision,
    scopeShiny: project.completion === 'owned' && newTargetShiny,
    targets: [...retained, ...added],
  };
  return {
    nextProject,
    added,
    removed,
    legacyUnclassified: retained.filter((target) => target.scopeSource === undefined).length,
  };
}

export function isCollectionProject(value: unknown): value is CollectionProject {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.targets) || !value.targets.every(isProjectTarget)) return false;
  const targets = value.targets as ProjectTarget[];
  return isNonemptyString(value.id) && isNonemptyString(value.saveId)
    && isNonemptyString(value.gameId) && isNonemptyString(value.title)
    && (value.completion === 'owned' || value.completion === 'registered')
    && typeof value.scopeLabel === 'string' && isNonemptyString(value.scopeRevision)
    && typeof value.createdAt === 'number' && Number.isFinite(value.createdAt)
    && (value.scopeGeneration === undefined || value.scopeGeneration === null || isNonemptyString(value.scopeGeneration))
    && (value.scopeShiny === undefined || typeof value.scopeShiny === 'boolean')
    && (value.completion !== 'registered' || value.scopeShiny !== true)
    && new Set(targets.map((target) => target.id)).size === targets.length
    && (value.completion !== 'registered' || targets.every((target) =>
      target.formSlug === null && target.shiny === null
      && target.origin === null && target.requiredCount === 1));
}

export function isProjectTarget(value: unknown): value is ProjectTarget {
  if (!isRecord(value)) return false;
  return isNonemptyString(value.id) && isNonemptyString(value.speciesSlug)
    && (value.formSlug === null || isNonemptyString(value.formSlug))
    && (value.shiny === null || typeof value.shiny === 'boolean')
    && (value.origin === null || ['unspecified', 'captured', 'received', 'traded'].includes(value.origin as string))
    && Number.isInteger(value.requiredCount) && (value.requiredCount as number) >= 1
    && (value.requiredCount as number) <= 99
    && typeof value.excluded === 'boolean'
    && (value.scopeSource === undefined || value.scopeSource === 'preset' || value.scopeSource === 'manual');
}

export function getProjectProgress(
  project: CollectionProject,
  specimens: PokemonSpecimen[],
  registeredSlugs: string[],
) {
  const activeTargets = project.targets.filter((target) => !target.excluded);
  const doneByTarget = new Map(activeTargets.map((target) => [target.id, 0]));
  if (project.completion === 'registered') {
    const registered = new Set(registeredSlugs);
    activeTargets.forEach((target) => {
      if (registered.has(target.speciesSlug)) doneByTarget.set(target.id, 1);
    });
  } else {
    const slotsBySpecies = new Map<string, Array<{ targetId: string; target: ProjectTarget }>>();
    activeTargets.forEach((target) => {
      const slots = slotsBySpecies.get(target.speciesSlug) ?? [];
      for (let count = 0; count < target.requiredCount; count += 1) {
        slots.push({ targetId: target.id, target });
      }
      slotsBySpecies.set(target.speciesSlug, slots);
    });
    const availableBySpecies = new Map<string, PokemonSpecimen[]>();
    specimens.filter((specimen) => specimen.saveId === project.saveId
      && specimen.gameId === project.gameId).forEach((specimen) => {
      const available = availableBySpecies.get(specimen.speciesSlug) ?? [];
      available.push(specimen);
      availableBySpecies.set(specimen.speciesSlug, available);
    });
    slotsBySpecies.forEach((slots, speciesSlug) => {
      slots.sort((left, right) => specificity(right.target) - specificity(left.target));
      const available = availableBySpecies.get(speciesSlug) ?? [];
      const assigned = new Array<number>(available.length).fill(-1);
      const tryAssign = (slotIndex: number, seen: Set<number>): boolean => {
        for (let index = 0; index < available.length; index += 1) {
          if (seen.has(index) || !matchesTarget(available[index], slots[slotIndex].target)) continue;
          seen.add(index);
          if (assigned[index] === -1 || tryAssign(assigned[index], seen)) {
            assigned[index] = slotIndex;
            return true;
          }
        }
        return false;
      };
      slots.forEach((_, index) => { tryAssign(index, new Set<number>()); });
      assigned.forEach((slotIndex) => {
        if (slotIndex === -1) return;
        const targetId = slots[slotIndex].targetId;
        doneByTarget.set(targetId, (doneByTarget.get(targetId) ?? 0) + 1);
      });
    });
  }
  const total = activeTargets.reduce((sum, target) => sum + target.requiredCount, 0);
  const done = activeTargets.reduce((sum, target) => sum + (doneByTarget.get(target.id) ?? 0), 0);
  return {
    done,
    total,
    ratio: total === 0 ? 0 : done / total,
    targets: project.targets.map((target) => ({
      target,
      done: doneByTarget.get(target.id) ?? 0,
      missing: target.excluded ? 0 : target.requiredCount - (doneByTarget.get(target.id) ?? 0),
    })),
  };
}

function specificity(target: ProjectTarget) {
  return Number(target.formSlug !== null) + Number(target.shiny !== null)
    + Number(target.origin !== null);
}

function matchesTarget(specimen: PokemonSpecimen, target: ProjectTarget) {
  return specimen.speciesSlug === target.speciesSlug
    && (target.formSlug === null || specimen.formSlug === target.formSlug)
    && (target.shiny === null || specimen.shiny === target.shiny)
    && (target.origin === null || specimen.origin === target.origin);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}
