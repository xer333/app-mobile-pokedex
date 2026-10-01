import type { SetStateAction } from 'react';

export function applyStateUpdates<T>(initial: T, updates: SetStateAction<T>[]): T {
  return updates.reduce<T>(
    (current, update) => typeof update === 'function'
      ? (update as (value: T) => T)(current)
      : update,
    initial,
  );
}
