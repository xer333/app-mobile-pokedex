export type GoalConstraint = 'no-trade' | 'no-transfer' | 'keep-stages' | 'owned-only';
export type TaskConfidence = 'declared' | 'verified' | 'unverified';

export type PlanTask = {
  id: string;
  label: string;
  done: boolean;
  resourceKey: string | null;
  confidence: TaskConfidence;
};

export type PlayerGoal = {
  id: string;
  title: string;
  gameId: string;
  createdAt: number;
  constraints: GoalConstraint[];
  tasks: PlanTask[];
};

export function createPlayerGoal(title: string, gameId: string, now = Date.now()): PlayerGoal {
  return {
    id: `goal-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    gameId,
    createdAt: now,
    constraints: [],
    tasks: [],
  };
}

export function createPlanTask(
  label: string,
  resourceKey: string | null,
  now = Date.now(),
): PlanTask {
  return {
    id: `task-${now}-${Math.random().toString(36).slice(2, 8)}`,
    label: label.trim(),
    done: false,
    resourceKey: normalizeResourceKey(resourceKey),
    confidence: 'declared',
  };
}

export function getGoalProgress(goal: PlayerGoal) {
  if (goal.tasks.length === 0) {
    return { done: 0, total: 0, ratio: 0 };
  }
  const done = goal.tasks.filter((task) => task.done).length;
  return { done, total: goal.tasks.length, ratio: done / goal.tasks.length };
}

export function findResourceConflicts(goals: PlayerGoal[]) {
  const usages = new Map<string, Array<{ goalId: string; taskId: string }>>();
  goals.forEach((goal) => {
    goal.tasks.forEach((task) => {
      if (!task.done && task.resourceKey) {
        const entries = usages.get(task.resourceKey) ?? [];
        entries.push({ goalId: goal.id, taskId: task.id });
        usages.set(task.resourceKey, entries);
      }
    });
  });

  return Array.from(usages.entries())
    .filter(([, entries]) => new Set(entries.map((entry) => entry.goalId)).size > 1)
    .map(([resourceKey, entries]) => ({ resourceKey, entries }));
}

export function isPlayerGoal(value: unknown): value is PlayerGoal {
  if (!value || typeof value !== 'object') return false;
  const goal = value as Partial<PlayerGoal>;
  return (
    typeof goal.id === 'string' &&
    typeof goal.title === 'string' &&
    typeof goal.gameId === 'string' &&
    typeof goal.createdAt === 'number' &&
    Array.isArray(goal.constraints) &&
    goal.constraints.every((constraint) =>
      ['no-trade', 'no-transfer', 'keep-stages', 'owned-only'].includes(constraint),
    ) &&
    Array.isArray(goal.tasks) &&
    goal.tasks.every(isPlanTask)
  );
}

function isPlanTask(value: unknown): value is PlanTask {
  if (!value || typeof value !== 'object') return false;
  const task = value as Partial<PlanTask>;
  return (
    typeof task.id === 'string' &&
    typeof task.label === 'string' &&
    typeof task.done === 'boolean' &&
    (task.resourceKey === null || typeof task.resourceKey === 'string') &&
    ['declared', 'verified', 'unverified'].includes(task.confidence ?? '')
  );
}

function normalizeResourceKey(value: string | null) {
  const normalized = value?.trim().toLocaleLowerCase('fr-FR') ?? '';
  return normalized || null;
}
