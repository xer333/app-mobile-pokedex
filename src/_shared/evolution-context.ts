export type EvolutionContextStatus = 'reference' | 'introduced' | 'unverified';

export function classifyEvolutionContext(
  introducedVersionGroups: Array<string | null | undefined>,
  requestedVersionGroup: string | null,
): EvolutionContextStatus {
  if (!requestedVersionGroup) {
    return 'reference';
  }

  return introducedVersionGroups.includes(requestedVersionGroup)
    ? 'introduced'
    : 'unverified';
}

export function getEvolutionContextLabel(
  status: EvolutionContextStatus,
  requestedGameLabel: string,
) {
  switch (status) {
    case 'reference':
      return 'Condition générale du référentiel PokéAPI';
    case 'introduced':
      return `Condition introduite dans ce groupe de versions · validité actuelle dans ${requestedGameLabel} à vérifier`;
    case 'unverified':
      return `Validité dans ${requestedGameLabel} non vérifiée par PokéAPI`;
  }
}
