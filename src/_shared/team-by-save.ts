export type TeamStore = {
  team: string[];
  teamsBySaveId?: Record<string, string[]>;
};

export function getTeamsBySaveId(state: TeamStore, legacySaveId: string) {
  return state.teamsBySaveId ?? { [legacySaveId]: state.team };
}

export function getTeamForSave(state: TeamStore, saveId: string, legacySaveId: string) {
  return getTeamsBySaveId(state, legacySaveId)[saveId] ?? [];
}

export function setTeamForSave<T extends TeamStore>(
  state: T,
  saveId: string,
  legacySaveId: string,
  team: string[],
): T {
  return {
    ...state,
    teamsBySaveId: { ...getTeamsBySaveId(state, legacySaveId), [saveId]: team },
  };
}
