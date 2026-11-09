import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { App } from "@/App";
import { storage } from "@/lib/storage";

const API = "http://localhost:8080/api/v1";

class FakeIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

function renderRating() {
  storage.setToken("tok");
  storage.setRoles(["movies:read", "movies-watch:write"]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[{ pathname: "/movies/42/rate", state: { title: "Blade Runner" } }]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Movie rating integration", () => {
  it("shows the title and keeps submit disabled until a star is chosen", async () => {
    renderRating();
    expect(screen.getByText("Blade Runner")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar avaliação" })).toBeDisabled();
    expect(screen.getByText("Toque numa estrela para avaliar")).toBeInTheDocument();
  });

  it.each([
    [3, "disliked"],
    [5, "neutral"],
    [7, "neutral"],
    [8, "liked"],
    [10, "liked"],
  ])("posts rating %i with reaction %s and returns to the catalog", async (stars, reaction) => {
    let body: unknown = null;
    let calledId: string | readonly string[] | undefined;
    let auth: string | null = null;
    server.use(
      http.post(`${API}/movies/:id/watched`, async ({ request, params }) => {
        body = await request.json();
        calledId = params.id;
        auth = request.headers.get("Authorization");
        return HttpResponse.json({ status: "ok" });
      })
    );
    renderRating();
    const user = userEvent.setup();
    await user.click(screen.getByRole("radio", { name: stars === 1 ? "1 estrela" : `${stars} estrelas` }));
    await user.click(screen.getByRole("button", { name: "Enviar avaliação" }));

    expect(await screen.findByTestId("catalog-page")).toBeInTheDocument();
    expect(body).toEqual({ rating: stars, reaction });
    expect(calledId).toBe("42");
    expect(auth).toBe("Bearer tok");
  });

  it("shows an error and stays on the page when the request fails", async () => {
    server.use(http.post(`${API}/movies/:id/watched`, () => HttpResponse.json({ message: "x" }, { status: 500 })));
    renderRating();
    const user = userEvent.setup();
    await user.click(screen.getByRole("radio", { name: "9 estrelas" }));
    await user.click(screen.getByRole("button", { name: "Enviar avaliação" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível enviar sua avaliação.");
    expect(screen.queryByTestId("catalog-page")).not.toBeInTheDocument();
  });

  it("Cancelar goes back to the catalog without posting", async () => {
    const spy = vi.fn();
    server.use(
      http.post(`${API}/movies/:id/watched`, () => {
        spy();
        return HttpResponse.json({ status: "ok" });
      })
    );
    renderRating();
    await act(async () => {
      await userEvent.setup().click(screen.getByRole("button", { name: "Cancelar" }));
    });
    expect(await screen.findByTestId("catalog-page")).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });
});
