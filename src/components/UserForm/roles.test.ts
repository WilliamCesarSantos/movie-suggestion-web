import { describe, it, expect } from "vitest";
import { ASSIGNABLE_ROLES, isUserRole } from "./roles";

describe("isUserRole", () => {
  it.each(ASSIGNABLE_ROLES)("accepts the assignable role %s", (role) => {
    expect(isUserRole(role)).toBe(true);
  });

  it("rejects the wildcard role '*' (not assignable)", () => {
    expect(isUserRole("*")).toBe(false);
  });

  it.each(["", "admin", "users:delete", "USERS:READ", " users:read"])("rejects invalid value %j", (value) => {
    expect(isUserRole(value)).toBe(false);
  });
});
