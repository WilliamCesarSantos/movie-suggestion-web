import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { AccessDeniedState } from '../../components/feedback/AccessDeniedState';
import { useSession, isSessionExpired } from '../../features/auth/sessionStore';
import { canAccess } from '../../features/rbac/permissionEvaluator';
import { normalizeRoles, type KnownRole } from '../../features/rbac/normalizeRoles';

interface ProtectedRouteProps {
  requiredRoles: KnownRole[];
  children: JSX.Element;
}

export function ProtectedRoute({ requiredRoles, children }: ProtectedRouteProps): JSX.Element {
  const { session, logout } = useSession();

  if (!session || isSessionExpired(session)) {
    logout();
    return <Navigate to="/login" replace />;
  }

  const roles = normalizeRoles(session.user.roles);
  if (!canAccess(roles, requiredRoles)) {
    return <AccessDeniedState />;
  }

  return children;
}
