export const appRoutes = {
  dashboard: '/dashboard' as const,
  discover: '/discover' as const,
  map: '/map' as const,
  locations: '/locations' as const,
  moves: '/moves' as const,
  evolutions: '/evolutions' as const,
  profile: '/profile' as const,
};

export function detailRoute(slug: string) {
  return `/detail/${slug}` as const;
}

export function moveRoute(slug: string) {
  return `/move/${slug}` as const;
}

export function compareRoute(left: string, right: string) {
  return `/compare?left=${left}&right=${right}` as const;
}

export function mapRoute(pokemon?: string, region?: string) {
  const params = new URLSearchParams();

  if (pokemon) {
    params.set('pokemon', pokemon);
  }
  if (region) {
    params.set('region', region);
  }

  const query = params.toString();
  return query ? (`/map?${query}` as const) : appRoutes.map;
}
