import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { SessionProvider, useSession } from '../../../src/features/auth/sessionStore';
import { SystemUserMenu } from '../../../src/components/layout/SystemUserMenu';

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

describe('user menu gating', () => {
  it('shows only allowed menu entries for a users:read profile', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SessionProvider>
          <MemoryRouter>
            <SeedSession roles={['users:read']} />
            <SystemUserMenu />
          </MemoryRouter>
        </SessionProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('User List')).toBeInTheDocument();
    expect(screen.queryByText('User Register')).not.toBeInTheDocument();
  });
});
