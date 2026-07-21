const KNOWN_ROLES = new Set([
  'users:read',
  'users:write',
  'movies:read',
  'movies-watch:write',
  'movies:write',
  '*'
]);

export type KnownRole = 'users:read' | 'users:write' | 'movies:read' | 'movies-watch:write' | 'movies:write' | '*';

export function normalizeRoles(rawRoles: string[] | null | undefined): KnownRole[] {
  if (!rawRoles?.length) return [];
  const unique = Array.from(new Set(rawRoles));
  return unique.filter((role): role is KnownRole => KNOWN_ROLES.has(role));
}
