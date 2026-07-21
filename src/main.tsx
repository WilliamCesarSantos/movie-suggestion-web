import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './app/router';
import { AuthNavigationEffects } from './features/auth/AuthNavigationEffects';
import { SessionProvider } from './features/auth/sessionStore';
import './styles/index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BrowserRouter>
          <AuthNavigationEffects />
          <AppRouter />
        </BrowserRouter>
      </SessionProvider>
    </QueryClientProvider>
  </StrictMode>
);
