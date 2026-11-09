const TOKEN_KEY = "movie_token";
const ROLES_KEY = "movie_roles";

export const storage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLES_KEY);
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
