import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { usePersistedState, type PersistenceStatus } from './use-persisted-state';
import {
  createPlanTask,
  createPlayerGoal,
  isPlayerGoal,
  type GoalConstraint,
  type PlayerGoal,
} from './planning';

type PlanningState = { goals: PlayerGoal[] };
type PlanningContextValue = PlanningState & {
  isReady: boolean;
  persistenceStatus: PersistenceStatus;
  persistenceError: string | null;
  retryPersistence: () => void;
  addGoal: (title: string, gameId: string) => string | null;
  removeGoal: (goalId: string) => void;
  toggleConstraint: (goalId: string, constraint: GoalConstraint) => void;
  addTask: (goalId: string, label: string, resourceKey: string | null) => void;
  toggleTask: (goalId: string, taskId: string) => void;
  removeTask: (goalId: string, taskId: string) => void;
};

const PlanningContext = createContext<PlanningContextValue | null>(null);
const defaultState: PlanningState = { goals: [] };

export function PlanningProvider({ children }: { children: ReactNode }) {
  const persistence = usePersistedState(
    'pokedex.planning.v1',
    defaultState,
    (rawValue) => {
      const parsed = JSON.parse(rawValue) as Partial<PlanningState>;
      return { goals: Array.isArray(parsed.goals) ? parsed.goals.filter(isPlayerGoal) : [] };
    },
  );

  const addGoal = useCallback((title: string, gameId: string) => {
    if (!title.trim()) return null;
    const goal = createPlayerGoal(title, gameId);
    persistence.setState((current) => ({ ...current, goals: [...current.goals, goal] }));
    return goal.id;
  }, [persistence.setState]);

  const removeGoal = useCallback((goalId: string) => {
    persistence.setState((current) => ({
      ...current,
      goals: current.goals.filter((goal) => goal.id !== goalId),
    }));
  }, [persistence.setState]);

  const toggleConstraint = useCallback((goalId: string, constraint: GoalConstraint) => {
    persistence.setState((current) => ({
      ...current,
      goals: current.goals.map((goal) =>
        goal.id !== goalId
          ? goal
          : {
              ...goal,
              constraints: goal.constraints.includes(constraint)
                ? goal.constraints.filter((entry) => entry !== constraint)
                : [...goal.constraints, constraint],
            },
      ),
    }));
  }, [persistence.setState]);

  const addTask = useCallback((goalId: string, label: string, resourceKey: string | null) => {
    if (!label.trim()) return;
    const task = createPlanTask(label, resourceKey);
    persistence.setState((current) => ({
      ...current,
      goals: current.goals.map((goal) =>
        goal.id === goalId ? { ...goal, tasks: [...goal.tasks, task] } : goal,
      ),
    }));
  }, [persistence.setState]);

  const toggleTask = useCallback((goalId: string, taskId: string) => {
    persistence.setState((current) => ({
      ...current,
      goals: current.goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              tasks: goal.tasks.map((task) =>
                task.id === taskId ? { ...task, done: !task.done } : task,
              ),
            }
          : goal,
      ),
    }));
  }, [persistence.setState]);

  const removeTask = useCallback((goalId: string, taskId: string) => {
    persistence.setState((current) => ({
      ...current,
      goals: current.goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, tasks: goal.tasks.filter((task) => task.id !== taskId) }
          : goal,
      ),
    }));
  }, [persistence.setState]);

  const value = useMemo<PlanningContextValue>(() => ({
    ...persistence.state,
    isReady: persistence.isReady,
    persistenceStatus: persistence.persistenceStatus,
    persistenceError: persistence.persistenceError,
    retryPersistence: persistence.retryPersistence,
    addGoal,
    removeGoal,
    toggleConstraint,
    addTask,
    toggleTask,
    removeTask,
  }), [addGoal, addTask, persistence.isReady, persistence.persistenceError, persistence.persistenceStatus, persistence.retryPersistence, persistence.state, removeGoal, removeTask, toggleConstraint, toggleTask]);

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>;
}

export function usePlanning() {
  const context = useContext(PlanningContext);
  if (!context) throw new Error('usePlanning must be used within a PlanningProvider');
  return context;
}
