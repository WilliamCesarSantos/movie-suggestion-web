import { createContext, createElement, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthSession } from '../../api/schemas/authSchemas';

interface SessionContextValue {
  session: AuthSession | null;
  setSession: (value: AuthSession | null) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      setSession,
      logout: () => setSession(null)
    }),
    [session]
  );

  return createElement(SessionContext.Provider, { value }, children);
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}

export function isSessionExpired(session: AuthSession | null): boolean {
  if (!session) return true;
  return Date.parse(session.expiresAt) <= Date.now();
}
