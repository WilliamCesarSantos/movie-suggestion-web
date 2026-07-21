import type { KnownRole } from './normalizeRoles';

export type MenuKey = 'user.register' | 'user.list' | 'movie.import' | 'movie.watch';

export const MENU_CAPABILITIES: Record<MenuKey, KnownRole[]> = {
  'user.register': ['users:write', '*'],
  'user.list': ['users:read', '*'],
  'movie.import': ['movies:write', '*'],
  'movie.watch': ['movies:read', 'movies-watch:write', 'movies:write', '*']
};
