import { useParams } from 'react-router-dom';
import { AccessDeniedState } from '../../components/feedback/AccessDeniedState';
import { isForbiddenError } from '../../api/client/errorPolicy';
import { useSession } from '../../features/auth/sessionStore';
import { normalizeRoles } from '../../features/rbac/normalizeRoles';
import { hasAnyRole } from '../../features/rbac/permissionEvaluator';
import { useMovieDetail } from '../../features/movies/useMovieDetail';
import { useWatchAction } from '../../features/movies/useWatchAction';

export function MovieDetailPage() {
  const { id } = useParams();
  const { session } = useSession();
  const roles = normalizeRoles(session?.user.roles);
  const canWatch = hasAnyRole(roles, ['movies-watch:write', 'movies:write', '*']);
  const detail = useMovieDetail(id, session?.accessToken);
  const { goToRating } = useWatchAction(id);

  if (detail.isPending) return <p className="p-6">Carregando detalhe...</p>;
  if (isForbiddenError(detail.error)) return <AccessDeniedState />;
  if (detail.isError) return <p className="p-6 text-red-400">Falha ao carregar o detalhe do filme.</p>;
  if (!detail.data) return <p className="p-6">Filme não encontrado.</p>;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">{detail.data.title}</h1>
      <p className="mt-4 text-slate-300">{detail.data.description}</p>
      {canWatch ? (
        <button className="mt-6 rounded bg-cyan-700 px-4 py-2" onClick={goToRating}>
          Assistir e avaliar
        </button>
      ) : null}
    </main>
  );
}
