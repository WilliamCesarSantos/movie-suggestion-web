import { useMemo } from 'react';
import { isForbiddenError } from '../../api/client/errorPolicy';
import { useSession } from '../../features/auth/sessionStore';
import { normalizeRoles } from '../../features/rbac/normalizeRoles';
import { hasAnyRole } from '../../features/rbac/permissionEvaluator';
import { useRecommendationsInfinite } from '../../features/movies/useRecommendationsInfinite';
import { MovieRecommendationCard } from '../../components/movie/MovieRecommendationCard';
import { HomeAccessBoundary } from './HomeAccessBoundary';
import { HomeFeedStates } from './HomeFeedStates';
import { SystemUserMenu } from '../../components/layout/SystemUserMenu';

export function HomePage() {
  const { session } = useSession();
  const roles = normalizeRoles(session?.user.roles);
  const canReadMovies = hasAnyRole(roles, ['movies:read', 'movies-watch:write', 'movies:write', '*']);
  const query = useRecommendationsInfinite(session?.accessToken, canReadMovies);

  const movies = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);

  if (isForbiddenError(query.error)) {
    return <HomeAccessBoundary allowed={false}><div /></HomeAccessBoundary>;
  }

  return (
    <HomeAccessBoundary allowed={canReadMovies}>
      <main className="mx-auto max-w-6xl p-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Recomendações</h1>
          <SystemUserMenu />
        </header>

        {query.isPending ? <HomeFeedStates kind="loading" /> : null}
        {query.isError ? <HomeFeedStates kind="error" message="Não foi possível carregar a lista." /> : null}
        {!query.isPending && !query.isError && movies.length === 0 ? <HomeFeedStates kind="empty" /> : null}

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie) => (
            <MovieRecommendationCard key={movie.id} movie={movie} />
          ))}
        </section>

        {query.hasNextPage ? (
          <button className="mt-6 rounded bg-cyan-700 px-4 py-2" onClick={() => query.fetchNextPage()}>
            Carregar mais
          </button>
        ) : null}
      </main>
    </HomeAccessBoundary>
  );
}
