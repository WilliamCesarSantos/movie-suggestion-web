import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider } from '../../../src/features/auth/sessionStore';
import { LoginPage } from '../../../src/pages/auth/LoginPage';

describe('login to home redirect', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        token: 'jwt',
        email: 'joe@example.com',
        roles: ['movies:read'],
        expiresAt: new Date(Date.now() + 60_000).toISOString()
      })
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('submits login to the OpenAPI login endpoint using email/password payload', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SessionProvider>
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </SessionProvider>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'joe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'joe@example.com', password: '123456' })
        })
      );
    });
  });
});
