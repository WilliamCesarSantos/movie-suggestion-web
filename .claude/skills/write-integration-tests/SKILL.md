---
name: write-integration-tests
description: Padrões para testes de integração com MSW (Mock Service Worker). Valida fluxo entre componentes e camada de API.
---

# Write Integration Tests

Testes de integração validam a colaboração entre componente, hook de dados e camada HTTP — com MSW interceptando as chamadas reais.

## Stack
- Vitest + React Testing Library + MSW v2.
- `QueryClient` isolado por teste.

## Localização
`src/**/__tests__/*.integration.test.tsx`

## Setup MSW (por teste ou global)

Em `src/test/server.ts`:
```ts
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("http://localhost:8080/api/v1/movies", ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    if (!cursor) {
      return HttpResponse.json({
        data: [
          { id: "1", title: "The Matrix", year: "1999", poster: "x", imdbRating: 8.7 },
        ],
        nextCursor: "page2",
        hasNext: true,
        hasPrev: false,
        limit: 10,
        count: 1,
        total: 2,
      });
    }
    return HttpResponse.json({
      data: [{ id: "2", title: "Inception", year: "2010", poster: "y", imdbRating: 8.8 }],
      nextCursor: null,
      hasNext: false,
      hasPrev: true,
      limit: 10,
      count: 1,
      total: 2,
    });
  }),
];

export const server = setupServer(...handlers);
```

Em `src/test/setup.ts`:
```ts
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./server";
import "@testing-library/jest-dom/vitest";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Template
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CatalogPage } from "@/pages/CatalogPage";

function renderCatalog() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <CatalogPage />
    </QueryClientProvider>
  );
}

describe("CatalogPage integration", () => {
  it("loads first page of movies from API", async () => {
    renderCatalog();
    expect(await screen.findByAltText("The Matrix (1999)")).toBeInTheDocument();
  });
});
```

## Regras
- **Nunca mocke** o hook `useInfiniteMovies` ou o `getMovies` — mocke apenas a camada HTTP via MSW.
- **Erros**: use `server.use(...)` para sobrescrever handler em teste específico simulando 500.
- **Scroll infinito**: dispare o `IntersectionObserver` manualmente ou chame `fetchNextPage` via botão de debug — testar o observer puro é frágil.
- **Sempre** use `QueryClient` isolado por teste para evitar cache compartilhado.
