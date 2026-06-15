import { createContext, useEffect, useState, type ReactNode } from 'react'

export interface Session {
  token: string
  email: string
  roles: string[]
  expiresAt: string
}

interface AuthContextValue {
  session: Session | null
  setSession: (session: Session | null) => void
}

const AUTH_STORAGE_KEY = 'auth_session'

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  setSession: () => {},
})

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Session>
    if (!parsed.token || !parsed.roles || !parsed.expiresAt) return null
    return parsed as Session
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(readSession)

  function setSession(next: Session | null) {
    if (next) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
    setSessionState(next)
  }

  useEffect(() => {
    setSessionState(readSession())
  }, [])

  return (
    <AuthContext.Provider value={{ session, setSession }}>
      {children}
    </AuthContext.Provider>
  )
}
