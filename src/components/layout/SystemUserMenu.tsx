import { Link } from 'react-router-dom';
import { useSession } from '../../features/auth/sessionStore';
import { normalizeRoles } from '../../features/rbac/normalizeRoles';
import { hasAnyRole } from '../../features/rbac/permissionEvaluator';

export function SystemUserMenu() {
  const { session } = useSession();
  const roles = normalizeRoles(session?.user.roles);

  const canRegisterUser = hasAnyRole(roles, ['users:write', '*']);
  const canListUser = hasAnyRole(roles, ['users:read', '*']);
  const canImportMovies = hasAnyRole(roles, ['movies:write', '*']);
  const canWatchMovies = hasAnyRole(roles, ['movies:read', 'movies-watch:write', 'movies:write', '*']);

  return (
    <nav className="flex gap-3 text-sm">
      {canListUser ? <Link to="/users">User List</Link> : null}
      {canRegisterUser ? <Link to="/users/register">User Register</Link> : null}
      {canImportMovies ? <Link to="/movies/import">Movie Import</Link> : null}
      {canWatchMovies ? <Link to="/">Movie Watch</Link> : null}
    </nav>
  );
}
