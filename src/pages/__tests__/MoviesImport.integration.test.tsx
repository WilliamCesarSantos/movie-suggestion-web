import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { App } from "@/App";
import { storage } from "@/lib/storage";

const URL_IMPORT = "http://localhost:8080/api/v1/movies-import";

function renderImport() {
  storage.setToken("tok-import");
  storage.setRoles(["movies:write"]);
  storage.setEmail("jane@example.com");
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/movies-import"]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
  return userEvent.setup();
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.type(await screen.findByRole("textbox", { name: "Títulos para importar" }), text);
  await user.click(screen.getByRole("button", { name: "Importar filmes" }));
}

describe("Movies import integration", () => {
  it("POSTs the body with terms and maxPages 5 plus the Authorization header", async () => {
    let body: unknown = null;
    let auth: string | null = null;
    server.use(
      http.post(URL_IMPORT, async ({ request }) => {
        body = await request.json();
        auth = request.headers.get("Authorization");
        return HttpResponse.json({ status: "import triggered" }, { status: 202 });
      })
    );
    const user = renderImport();
    await fillAndSubmit(user, "Inception{Enter}Matrix");
    expect(await screen.findByText(/Importação iniciada para 2 filmes/)).toBeInTheDocument();
    expect(body).toEqual({ searchTerms: ["Inception", "Matrix"], maxPages: 5 });
    expect(auth).toBe("Bearer tok-import");
  });

  it.each([
    [400, "Os títulos informados são inválidos."],
    [403, "Você não tem permissão para importar filmes."],
    [500, "Não foi possível iniciar a importação."],
  ])("shows the error for status %i", async (status, message) => {
    server.use(http.post(URL_IMPORT, () => HttpResponse.json({ message: "err" }, { status })));
    const user = renderImport();
    await fillAndSubmit(user, "x");
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
  });
});
