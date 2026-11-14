import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "@/App";
import { storage } from "@/lib/storage";

export const API = "http://localhost:8080/api/v1";

/** Seeds the session the way useAuth reads it (token + roles + email). */
export function seedSession(roles: string[], email = "jane@example.com") {
  storage.setToken("tok-123");
  storage.setRoles(roles);
  storage.setEmail(email);
}

/** Renders the real <App /> with an isolated QueryClient (retry: false). */
export function renderApp(path: string | { pathname: string; state?: unknown }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
}
