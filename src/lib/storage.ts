const TOKEN_KEY = "movie_token";
const ROLES_KEY = "movie_roles";
const EMAIL_KEY = "movie_email";

export const storage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore quota / access errors
    }
  },
  clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLES_KEY);
      localStorage.removeItem(EMAIL_KEY);
    } catch {
      // ignore access errors
    }
  },
  getEmail(): string | null {
    try {
      return localStorage.getItem(EMAIL_KEY);
    } catch {
      return null;
    }
  },
  setEmail(email: string): void {
    try {
      localStorage.setItem(EMAIL_KEY, email);
    } catch {
      // ignore
    }
  },
  getRoles(): string[] {
    try {
      const raw = localStorage.getItem(ROLES_KEY);
      if (!raw) {
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  },
  setRoles(roles: string[]): void {
    try {
      localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    } catch {
      // ignore quota / serialization errors
    }
  },
  clearRoles(): void {
    localStorage.removeItem(ROLES_KEY);
  },
};
