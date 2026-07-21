import { describe, expect, it } from 'vitest';
import { normalizeRoles } from '../../../src/features/rbac/normalizeRoles';

describe('normalizeRoles', () => {
  it('removes unknown and duplicate roles', () => {
    expect(normalizeRoles(['movies:read', 'unknown', 'movies:read'])).toEqual(['movies:read']);
  });
});
