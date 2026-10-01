export type CoverageLevel = 'reference' | 'contextual' | 'partial';

export type CoverageRow = {
  key: 'moves' | 'encounters' | 'evolutions' | 'forms';
  label: string;
  level: CoverageLevel;
  statusLabel: string;
};

export function getGameCoverage(isNationalReference: boolean): CoverageRow[] {
  if (isNationalReference) {
    return [
      ['moves', 'Capacités'],
      ['encounters', 'Rencontres'],
      ['evolutions', 'Évolutions'],
      ['forms', 'Formes'],
    ].map(([key, label]) => ({
      key: key as CoverageRow['key'],
      label,
      level: 'reference' as const,
      statusLabel: 'Référence générale',
    }));
  }

  return [
    {
      key: 'moves',
      label: 'Capacités et machines',
      level: 'contextual',
      statusLabel: 'Contextualisé',
    },
    {
      key: 'encounters',
      label: 'Rencontres',
      level: 'contextual',
      statusLabel: 'Contextualisé',
    },
    {
      key: 'evolutions',
      label: 'Évolutions',
      level: 'partial',
      statusLabel: 'Partiel',
    },
    {
      key: 'forms',
      label: 'Formes et variantes',
      level: 'partial',
      statusLabel: 'Partiel',
    },
  ];
}
