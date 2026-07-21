import { describe, expect, it } from 'vitest';
import { canAccess, hasAnyRole } from '../../../src/features/rbac/permissionEvaluator';

describe('hasAnyRole', () => {
  it('returns true for wildcard role', () => {
    expect(hasAnyRole(['*'], ['users:read'])).toBe(true);
  });

  it('returns false when user does not have any required role', () => {
    expect(hasAnyRole(['movies:read'], ['users:read'])).toBe(false);
  });
});

describe('canAccess', () => {
  it('denies by default when route has no required roles configured', () => {
    expect(canAccess(['users:read'], [])).toBe(false);
  });

  it('grants access when user has one required role', () => {
    expect(canAccess(['users:read'], ['users:read', 'users:write'])).toBe(true);
  });
});
