import { useContext } from 'react'
import { AuthContext, type Session } from './AuthContext'

interface UseAuthResult {
  session: Session | null
  setSession: (session: Session | null) => void
}

export function useAuth(): UseAuthResult {
  return useContext(AuthContext)
}
