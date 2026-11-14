import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { App } from "@/App";
import { storage } from "@/lib/storage";

const API = "http://localhost:8080/api/v1";

type IOCallback = (entries: Array<{ isIntersecting: boolean }>) => void;
let observers: IOCallback[] = [];

class FakeIntersectionObserver {
  constructor(cb: IOCallback) {
    observers.push(cb);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

function intersect() {
  act(() => {
    observers[observers.length - 1]?.([{ isIntersecting: true }]);
  });
}

function seed(roles: string[]) {
  storage.setToken("tok-123");
  storage.setRoles(roles);
  storage.setEmail("jane@example.com");
}

function renderApp(path = "/catalog") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  observers = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Catalog integration", () => {
  it("shows loading then the first page of movies", async () => {
    seed(["*"]);
    renderApp();
    expect(screen.getByText("Carregando filmes...")).toBeInTheDocument();
    expect(await screen.findByAltText("Poster de The Matrix")).toBeInTheDocument();
    expect(screen.getByAltText("Poster de Inception")).toBeInTheDocument();
    expect(screen.queryByAltText("Poster de Interstellar")).not.toBeInTheDocument();
  });

  it("sends the Authorization header with the stored token", async () => {
    seed(["*"]);
    let auth: string | null = null;
    server.use(
      http.get(`${API}/movies`, ({ request }) => {
        auth = request.headers.get("Authorization");
        return HttpResponse.json({
          data: [], nextCursor: null, prevCursor: null, hasNext: false, hasPrev: false, limit: 20, count: 0, total: 0,
        });
      })
    );
    renderApp();
    expect(await screen.findByText("Nenhum filme encontrado.")).toBeInTheDocument();
    expect(auth).toBe("Bearer tok-123");
  });

  it("fetches the second page when the sentinel intersects and shows the end-of-list message", async () => {
    seed(["*"]);
    const cursors: Array<string | null> = [];
    server.use(
      http.get(`${API}/movies`, ({ request }) => {
        const cursor = new URL(request.url).searchParams.get("cursor");
        cursors.push(cursor);
        if (!cursor) {
          return HttpResponse.json({
            data: [{ id: "1", title: "The Matrix", year: "1999", poster: "https://example.com/1.jpg", imdbRating: 8.7 }],
            nextCursor: "page2", prevCursor: null, hasNext: true, hasPrev: false, limit: 1, count: 1, total: 2,
          });
        }
        return HttpResponse.json({
          data: [{ id: "3", title: "Interstellar", year: "2014", poster: "https://example.com/3.jpg", imdbRating: 8.6 }],
          nextCursor: null, prevCursor: "page1", hasNext: false, hasPrev: true, limit: 1, count: 1, total: 2,
        });
      })
    );
    renderApp();
    await screen.findByAltText("Poster de The Matrix");
    expect(screen.queryByText("Não há mais filmes para exibir")).not.toBeInTheDocument();

    intersect();

    expect(await screen.findByAltText("Poster de Interstellar")).toBeInTheDocument();
    expect(cursors).toEqual([null, "page2"]);
    expect(screen.getByAltText("Poster de The Matrix")).toBeInTheDocument();
    expect(await screen.findByText("Não há mais filmes para exibir")).toBeInTheDocument();
  });

  it("shows an error state and recovers with 'Tentar novamente'", async () => {
    seed(["*"]);
    let fail = true;
    server.use(
      http.get(`${API}/movies`, () => {
        if (fail) {
          return HttpResponse.json({ message: "boom" }, { status: 500 });
        }
        return HttpResponse.json({
          data: [{ id: "1", title: "The Matrix", year: "1999", poster: "https://example.com/1.jpg", imdbRating: 8.7 }],
          nextCursor: null, prevCursor: null, hasNext: false, hasPrev: false, limit: 20, count: 1, total: 1,
        });
      })
    );
    renderApp();
    expect(await screen.findByText("Não foi possível carregar os filmes.")).toBeInTheDocument();
    fail = false;
    await userEvent.setup().click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByAltText("Poster de The Matrix")).toBeInTheDocument();
  });

  it("shows the empty state", async () => {
    seed(["*"]);
    server.use(
      http.get(`${API}/movies`, () =>
        HttpResponse.json({
          data: [], nextCursor: null, prevCursor: null, hasNext: false, hasPrev: false, limit: 20, count: 0, total: 0,
        })
      )
    );
    renderApp();
    expect(await screen.findByText("Nenhum filme encontrado.")).toBeInTheDocument();
  });

  describe("empty state CTA", () => {
    const emptyPage = {
      data: [], nextCursor: null, prevCursor: null, hasNext: false, hasPrev: false, limit: 20, count: 0, total: 0,
    };

    it("shows the 'Importar filmes' link to /movies-import with movies:write", async () => {
      seed(["movies:write"]);
      server.use(http.get(`${API}/movies`, () => HttpResponse.json(emptyPage)));
      renderApp();
      await screen.findByText("Nenhum filme encontrado.");
      expect(screen.getByRole("link", { name: "Importar filmes" })).toHaveAttribute("href", "/movies-import");
    });

    it("shows the hint instead of the link without movies:write", async () => {
      seed(["movies:read"]);
      server.use(http.get(`${API}/movies`, () => HttpResponse.json(emptyPage)));
      renderApp();
      await screen.findByText("Nenhum filme encontrado.");
      expect(screen.queryByRole("link", { name: "Importar filmes" })).not.toBeInTheDocument();
      expect(screen.getByText("Peça ao administrador para importar títulos no sistema.")).toBeInTheDocument();
    });
  });

  it("clears the token on 401", async () => {
    seed(["*"]);
    server.use(http.get(`${API}/movies`, () => HttpResponse.json({ message: "unauthorized" }, { status: 401 })));
    // jsdom does not implement navigation; keep the redirect from erroring.
    renderApp();
    await waitFor(() => expect(storage.getToken()).toBeNull());
  });

  it("redirects unauthenticated visitors to /login", () => {
    renderApp("/catalog");
    expect(screen.queryByTestId("catalog-page")).not.toBeInTheDocument();
  });

  describe("role-based behaviour", () => {
    it("blocks rating and shows the toast for users without movies-watch:write", async () => {
      seed(["movies:read"]);
      renderApp();
      const user = userEvent.setup();
      await user.click(await screen.findByRole("button", { name: /The Matrix/ }));
      expect(screen.getByRole("alert")).toHaveTextContent("Você não tem permissão para avaliar filmes.");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Dispensar aviso" }));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("opens the player modal for users with movies-watch:write", async () => {
      seed(["movies:read", "movies-watch:write"]);
      renderApp();
      await userEvent.setup().click(await screen.findByRole("button", { name: /The Matrix/ }));
      expect(screen.getByRole("dialog", { name: "Reproduzindo The Matrix" })).toBeInTheDocument();
    });

    it("hides the Menu for roles without admin permissions", async () => {
      seed(["movies:read", "movies-watch:write"]);
      renderApp();
      await screen.findByAltText("Poster de The Matrix");
      expect(screen.queryByRole("button", { name: "Menu" })).not.toBeInTheDocument();
    });

    it("shows the Menu with Importar for movies:write", async () => {
      seed(["movies:write"]);
      renderApp();
      const user = userEvent.setup();
      await user.click(await screen.findByRole("button", { name: "Menu" }));
      expect(screen.getByRole("link", { name: "Importar" })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Listar" })).not.toBeInTheDocument();
    });

    it("logout clears the session", async () => {
      seed(["*"]);
      renderApp();
      await userEvent.setup().click(await screen.findByRole("button", { name: "Sair" }));
      expect(storage.getToken()).toBeNull();
    });
  });

  describe("protected routes", () => {
    it("denies /users/new to users with only users:read", async () => {
      seed(["users:read"]);
      renderApp("/users/new");
      expect(await screen.findByRole("alert")).toHaveTextContent("Acesso negado");
    });

    it("denies /movies-import without movies:write", async () => {
      seed(["movies:read"]);
      renderApp("/movies-import");
      expect(await screen.findByRole("alert")).toHaveTextContent("Acesso negado");
    });

    it("allows /movies-import with movies:write", async () => {
      seed(["movies:write"]);
      renderApp("/movies-import");
      expect(await screen.findByRole("heading", { name: "Importar filmes" })).toBeInTheDocument();
    });

    it("denies /movies/:id/rate without movies-watch:write", async () => {
      seed(["movies:read"]);
      renderApp("/movies/1/rate");
      const alert = await screen.findByRole("alert");
      expect(within(alert).getByText("Acesso negado")).toBeInTheDocument();
    });
  });
});
