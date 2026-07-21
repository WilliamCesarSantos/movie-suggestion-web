import { AccessDeniedState } from '../../components/feedback/AccessDeniedState';
import { isForbiddenError } from '../../api/client/errorPolicy';
import { useSession } from '../../features/auth/sessionStore';
import { useUsersList } from '../../features/users/useUsersList';
import { UserListRowActions } from './UserListRowActions';

export function UserListPage() {
  const { session } = useSession();
  const users = useUsersList(session?.accessToken);

  if (isForbiddenError(users.error)) {
    return <AccessDeniedState />;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-bold">User List</h1>
      {users.isPending ? <p>Carregando...</p> : null}
      {users.isError ? <p className="text-red-400">Falha ao carregar usuários.</p> : null}
      {users.data?.data.map((user) => (
        <article key={user.id} className="mb-3 rounded border border-slate-700 p-3">
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-sm text-slate-300">{user.email}</p>
          <UserListRowActions userId={user.id} />
        </article>
      ))}
    </main>
  );
}
