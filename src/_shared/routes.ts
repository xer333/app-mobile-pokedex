export const appRoutes = {
  dashboard: '/dashboard' as const,
  discover: '/discover' as const,
  map: '/map' as const,
  locations: '/locations' as const,
  moves: '/moves' as const,
  evolutions: '/evolutions' as const,
  profile: '/profile' as const,
  collection: '/collection' as const,
  planner: '/planner' as const,
  hunts: '/hunts' as const,
};

export function huntsRoute(pokemon?: string) {
  return pokemon ? (`/hunts?pokemon=${encodeURIComponent(pokemon)}` as const) : appRoutes.hunts;
}

export function detailRoute(slug: string, tab?: string, species?: string) {
  const params = new URLSearchParams();
  if (tab) {
    params.set('tab', tab);
  }
  if (species && species !== slug) {
    params.set('species', species);
  }
  const query = params.toString();
  return `/detail/${slug}${query ? `?${query}` : ''}` as const;
}

export function moveRoute(slug: string, pokemon?: string) {
  const query = pokemon ? `?pokemon=${encodeURIComponent(pokemon)}` : '';
  return `/move/${slug}${query}` as const;
}

export function compareRoute(left: string, right: string) {
  return `/compare?left=${encodeURIComponent(left)}&right=${encodeURIComponent(right)}` as const;
}

export function movesRoute(pokemon?: string, category?: string) {
  const params = new URLSearchParams();

  if (pokemon) {
    params.set('pokemon', pokemon);
  }
  if (category && category !== 'all') {
    params.set('category', category);
  }

  const query = params.toString();
  return query ? (`/moves?${query}` as const) : appRoutes.moves;
}

export function evolutionsRoute(pokemon?: string) {
  return pokemon ? (`/evolutions?pokemon=${encodeURIComponent(pokemon)}` as const) : appRoutes.evolutions;
}

export function mapRoute(pokemon?: string, region?: string, version?: string) {
  const params = new URLSearchParams();

  if (pokemon) {
    params.set('pokemon', pokemon);
  }
  if (region) {
    params.set('region', region);
  }
  if (version && version !== 'all') {
    params.set('version', version);
  }

  const query = params.toString();
  return query ? (`/map?${query}` as const) : appRoutes.map;
}
