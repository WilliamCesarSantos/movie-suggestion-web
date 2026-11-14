import type { UserRole } from "@/api/types";

export const ASSIGNABLE_ROLES: UserRole[] = [
  "users:read",
  "users:write",
  "movies:read",
  "movies-watch:write",
  "movies:write",
];

export function isUserRole(value: string): value is UserRole {
  return (ASSIGNABLE_ROLES as string[]).includes(value);
}
