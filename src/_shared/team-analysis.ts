export type TeamAnalysisMember = { slug: string; types: string[] };

export function analyzeTeamComposition(members: TeamAnalysisMember[]) {
  const counts = new Map<string, number>();
  members.forEach((member) => {
    new Set(member.types).forEach((type) => counts.set(type, (counts.get(type) ?? 0) + 1));
  });

  return {
    memberCount: members.length,
    distinctTypes: counts.size,
    repeatedTypes: Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .map(([type, count]) => ({ type, count })),
  };
}
