export const WILDCARD_ROLE = "*";

/**
 * Checks whether a user's roles satisfy the required roles.
 *
 * Rules:
 * - If userRoles contains "*" (wildcard), access is granted for anything.
 * - If `required` is a single role, the user must have that role.
 * - If `required` is an array, the user must have at least one of the roles
 *   (intersection) OR hold the wildcard.
 * - If `required` is an empty array, access is granted (no role required).
 */
export function hasRole(userRoles: string[], required: string | string[]): boolean {
  if (userRoles.includes(WILDCARD_ROLE)) {
    return true;
  }
  if (Array.isArray(required)) {
    if (required.length === 0) {
      return true;
    }
    return required.some((role) => userRoles.includes(role));
  }
  return userRoles.includes(required);
}
