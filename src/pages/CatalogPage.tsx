import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MovieSummary } from "@/api/types";
import { Header } from "@/components/Header/Header";
import { MovieCard } from "@/components/MovieCard/MovieCard";
import { PlayerModal } from "@/components/PlayerModal/PlayerModal";
import { useHasRole } from "@/hooks/useHasRole";
import { useInfiniteMovies } from "@/hooks/useInfiniteMovies";

export function CatalogPage() {
  const navigate = useNavigate();
  const canRate = useHasRole(["movies-watch:write"]);
  const [playing, setPlaying] = useState<MovieSummary | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteMovies();

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, data]);

  const movies = data?.pages.flatMap((p) => p.data) ?? [];

  const onSelect = (movie: MovieSummary) => {
    if (!canRate) {
      setNotice("Você não tem permissão para avaliar filmes.");
      return;
    }
    setNotice(null);
    setPlaying(movie);
  };

  const onClosePlayer = useCallback(() => setPlaying(null), []);

  const onFinish = useCallback(() => {
    if (playing) {
      navigate(`/movies/${playing.id}/rate`, { state: { title: playing.title } });
    }
  }, [navigate, playing]);

  return (
    <div data-testid="catalog-page" className="min-h-screen bg-background text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {notice && (
          <div role="alert" className="mb-4 flex items-center justify-between rounded-lg bg-red-900/40 px-4 py-3 text-sm">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice(null)} aria-label="Dispensar aviso" className="ml-4">
              ×
            </button>
          </div>
        )}
        {isLoading && (
          <p role="status" className="py-10 text-center text-neutral-400">
            Carregando filmes...
          </p>
        )}
        {isError && (
          <div role="alert" className="py-10 text-center">
            <p>Não foi possível carregar os filmes.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold"
            >
              Tentar novamente
            </button>
          </div>
        )}
        {!isLoading && !isError && movies.length === 0 && (
          <p className="py-10 text-center text-neutral-400">Nenhum filme encontrado.</p>
        )}
        {movies.length > 0 && (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {movies.map((m) => (
              <li key={m.id}>
                <MovieCard movie={m} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        )}
        <div ref={sentinelRef} aria-hidden="true" className="h-1" />
        {isFetchingNextPage && (
          <p role="status" className="py-6 text-center text-neutral-400">
            Carregando mais...
          </p>
        )}
        {movies.length > 0 && !hasNextPage && !isFetchingNextPage && (
          <p className="py-6 text-center text-neutral-400">Não há mais filmes para exibir</p>
        )}
      </main>
      {playing && <PlayerModal title={playing.title} onClose={onClosePlayer} onFinish={onFinish} />}
    </div>
  );
}
