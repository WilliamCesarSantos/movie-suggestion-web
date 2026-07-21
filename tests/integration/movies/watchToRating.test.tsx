import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider, useSession } from '../../../src/features/auth/sessionStore';
import { MovieDetailPage } from '../../../src/pages/movies/MovieDetailPage';

function SeedSession({ roles }: { roles: string[] }) {
  const { setSession } = useSession();

  useEffect(() => {
    setSession({
      accessToken: 'token',
      refreshToken: null,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      user: { id: '', name: '', email: 'user@example.com', roles }
    });
  }, [roles, setSession]);

  return null;
}

describe('watch to rating transition', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        ID: '1',
        Title: 'Movie',
        Plot: 'Plot',
        Genres: [],
        Year: '1999',
        Runtime: '120 min',
        Poster: '',
        ImdbRating: 8.5
      })
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('hides watch action for users without movies-watch:write or movies:write', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SessionProvider>
          <MemoryRouter initialEntries={['/movies/1']}>
            <SeedSession roles={['movies:read']} />
            <Routes>
              <Route path="/movies/:id" element={<MovieDetailPage />} />
            </Routes>
          </MemoryRouter>
        </SessionProvider>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Movie')).toBeInTheDocument();
    expect(screen.queryByText('Assistir e avaliar')).not.toBeInTheDocument();
  });
});
