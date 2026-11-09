import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/roles";

/**
 * Returns `true` if the currently authenticated user has at least one of the
 * required roles (or the wildcard `*`).
 */
export function useHasRole(required: string | string[]): boolean {
  const { roles } = useAuth();
  return hasRole(roles, required);
}
