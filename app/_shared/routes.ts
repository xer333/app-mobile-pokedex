export const appRoutes = {
  dashboard: '/dashboard' as const,
  discover: '/discover' as const,
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
