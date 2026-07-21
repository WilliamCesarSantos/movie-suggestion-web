import { describe, expect, it } from 'vitest';
import { applyApiErrorPolicy, ForbiddenError, UnauthorizedError } from '../../../src/api/client/errorPolicy';

describe('errorPolicy', () => {
  it('throws UnauthorizedError for 401', () => {
    expect(() => applyApiErrorPolicy(401)).toThrow(UnauthorizedError);
  });

  it('throws ForbiddenError for 403', () => {
    expect(() => applyApiErrorPolicy(403)).toThrow(ForbiddenError);
  });
});
