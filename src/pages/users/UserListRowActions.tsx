import { useSession } from '../../features/auth/sessionStore';
import { normalizeRoles } from '../../features/rbac/normalizeRoles';
import { hasAnyRole } from '../../features/rbac/permissionEvaluator';

export function UserListRowActions({ userId }: { userId: string }) {
  const { session } = useSession();
  const roles = normalizeRoles(session?.user.roles);
  const canEdit = hasAnyRole(roles, ['users:write', '*']);

  if (!canEdit) return <></>;

  return (
    <button className="rounded bg-amber-600 px-2 py-1 text-xs" data-user-id={userId}>
      Editar
    </button>
  );
}
