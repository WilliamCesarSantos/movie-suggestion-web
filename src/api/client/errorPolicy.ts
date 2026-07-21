export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}

export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

export function isForbiddenError(error: unknown): error is ForbiddenError {
  return error instanceof ForbiddenError;
}

export function applyApiErrorPolicy(status: number): void {
  if (status === 401) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    throw new UnauthorizedError('Session expired. Please log in again.');
  }
  if (status === 403) {
    throw new ForbiddenError('Access denied for this resource.');
  }
}
