import type { KnownRole } from './normalizeRoles';

export function hasAnyRole(userRoles: KnownRole[], requiredRoles: KnownRole[]): boolean {
  if (userRoles.includes('*')) return true;
  return requiredRoles.some((required) => userRoles.includes(required));
}

export function canAccess(userRoles: KnownRole[], requiredRoles: KnownRole[]): boolean {
  if (requiredRoles.length === 0) return false;
  return hasAnyRole(userRoles, requiredRoles);
}
