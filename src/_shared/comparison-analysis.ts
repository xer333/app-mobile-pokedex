export type ComparisonCandidate = {
  name: string;
  stats: Array<{ label: string; value: number }>;
  weaknesses: Array<{ type: string; multiplier: number }>;
  resistances: Array<{ type: string; multiplier: number }>;
};

export function analyzeComparison(left: ComparisonCandidate, right: ComparisonCandidate) {
  const rightStats = new Map(right.stats.map((stat) => [stat.label, stat.value]));
  const statDifferences = left.stats.map((stat) => ({
    label: stat.label,
    leftValue: stat.value,
    rightValue: rightStats.get(stat.label) ?? 0,
    delta: stat.value - (rightStats.get(stat.label) ?? 0),
  }));
  const leftWeaknesses = new Set(left.weaknesses.map((entry) => entry.type));
  const rightWeaknesses = new Set(right.weaknesses.map((entry) => entry.type));
  const leftResistances = new Set(left.resistances.map((entry) => entry.type));
  const rightResistances = new Set(right.resistances.map((entry) => entry.type));

  return {
    statDifferences,
    leftTotal: left.stats.reduce((total, stat) => total + stat.value, 0),
    rightTotal: right.stats.reduce((total, stat) => total + stat.value, 0),
    commonWeaknesses: Array.from(leftWeaknesses).filter((type) => rightWeaknesses.has(type)),
    leftUniqueResistances: Array.from(leftResistances).filter((type) => !rightResistances.has(type)),
    rightUniqueResistances: Array.from(rightResistances).filter((type) => !leftResistances.has(type)),
  };
}
