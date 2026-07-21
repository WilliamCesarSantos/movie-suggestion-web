import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from '../../../src/features/auth/sessionStore';
import { UserListRowActions } from '../../../src/pages/users/UserListRowActions';

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

describe('user list edit visibility', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('hides edit action for users without users:write', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SessionProvider>
          <SeedSession roles={['users:read']} />
          <UserListRowActions userId="1" />
        </SessionProvider>
      </QueryClientProvider>
    );

    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
  });
});
