import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface Props {
  requiredRole?: string
}

export function ProtectedRoute({ requiredRole }: Props) {
  const { session } = useAuth()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && !session.roles.includes(requiredRole)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
