import { describe, it, expect } from "vitest";
import { hasRole } from "./roles";

describe("hasRole", () => {
  it("grants everything to the wildcard", () => {
    expect(hasRole(["*"], "users:write")).toBe(true);
    expect(hasRole(["*"], ["movies:write", "users:read"])).toBe(true);
  });
  it("matches a single required role", () => {
    expect(hasRole(["users:read"], "users:read")).toBe(true);
    expect(hasRole(["users:read"], "users:write")).toBe(false);
  });
  it("matches any role of an array", () => {
    expect(hasRole(["users:read"], ["users:read", "users:write"])).toBe(true);
    expect(hasRole(["movies:read"], ["users:read", "users:write"])).toBe(false);
  });
  it("grants access when no role is required", () => {
    expect(hasRole([], [])).toBe(true);
  });
  it("denies users without roles", () => {
    expect(hasRole([], "users:read")).toBe(false);
  });
});
