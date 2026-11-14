import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { storage } from "@/lib/storage";
import { MoviesImportPage } from "./MoviesImportPage";

const URL_IMPORT = "http://localhost:8080/api/v1/movies-import";

function setup() {
  storage.setToken("tok");
  storage.setRoles(["movies:write"]);
  storage.setEmail("jane@example.com");
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <MoviesImportPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
  return userEvent.setup();
}

function captureBodies() {
  const bodies: unknown[] = [];
  server.use(
    http.post(URL_IMPORT, async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json({ status: "import triggered" }, { status: 202 });
    })
  );
  return bodies;
}

const submitBtn = () => screen.getByRole("button", { name: "Importar filmes" });
const textbox = () => screen.getByRole("textbox", { name: "Títulos para importar" });

describe("MoviesImportPage", () => {
  it("renders with the submit button disabled and no valid titles", () => {
    setup();
    expect(screen.getByRole("heading", { name: "Importar filmes" })).toBeInTheDocument();
    expect(submitBtn()).toBeDisabled();
    expect(screen.getByText("Nenhum título válido")).toBeInTheDocument();
  });

  it("keeps the button disabled for whitespace-only input", async () => {
    const user = setup();
    await user.type(textbox(), "   {Enter}  ");
    expect(submitBtn()).toBeDisabled();
  });

  it("shows a pluralized counter of normalized titles", async () => {
    const user = setup();
    await user.type(textbox(), "Inception");
    expect(screen.getByText("1 filme para importar")).toBeInTheDocument();
    await user.type(textbox(), "{Enter}matrix{Enter}INCEPTION");
    expect(screen.getByText("2 filmes para importar")).toBeInTheDocument();
    expect(submitBtn()).toBeEnabled();
  });

  it("sends normalized terms with maxPages 5, clears the textarea and shows the async message", async () => {
    const bodies = captureBodies();
    const user = setup();
    await user.type(textbox(), "Inception{Enter}{Enter}  matrix  {Enter}inception");
    await user.click(submitBtn());

    expect(await screen.findByText(/Importação iniciada para 2 filmes/)).toBeInTheDocument();
    expect(bodies).toEqual([{ searchTerms: ["Inception", "matrix"], maxPages: 5 }]);
    expect(textbox()).toHaveValue("");
    expect(screen.getByRole("link", { name: "Ver catálogo" })).toHaveAttribute("href", "/catalog");
  });

  it("submits with Ctrl+Enter", async () => {
    const bodies = captureBodies();
    const user = setup();
    await user.type(textbox(), "Alien");
    await user.keyboard("{Control>}{Enter}{/Control}");
    expect(await screen.findByText(/Importação iniciada para 1 filme\./)).toBeInTheDocument();
    expect(bodies).toEqual([{ searchTerms: ["Alien"], maxPages: 5 }]);
  });

  it("submits with Cmd+Enter", async () => {
    const bodies = captureBodies();
    const user = setup();
    await user.type(textbox(), "Alien");
    await user.keyboard("{Meta>}{Enter}{/Meta}");
    expect(await screen.findByText(/Importação iniciada/)).toBeInTheDocument();
    expect(bodies).toHaveLength(1);
  });

  it("does not submit with Ctrl+Enter when there are no valid titles", async () => {
    const bodies = captureBodies();
    const user = setup();
    await user.click(textbox());
    await user.keyboard("{Control>}{Enter}{/Control}");
    expect(bodies).toHaveLength(0);
  });

  it("shows a non-retryable message on 400 and keeps the text", async () => {
    server.use(http.post(URL_IMPORT, () => HttpResponse.json({ message: "bad" }, { status: 400 })));
    const user = setup();
    await user.type(textbox(), "x");
    await user.click(submitBtn());
    expect(await screen.findByRole("alert")).toHaveTextContent("Os títulos informados são inválidos.");
    expect(screen.queryByRole("button", { name: "Tentar novamente" })).not.toBeInTheDocument();
    expect(textbox()).toHaveValue("x");
  });

  it("shows a permission message on 403", async () => {
    server.use(http.post(URL_IMPORT, () => HttpResponse.json({ message: "no" }, { status: 403 })));
    const user = setup();
    await user.type(textbox(), "x");
    await user.click(submitBtn());
    expect(await screen.findByRole("alert")).toHaveTextContent("Você não tem permissão para importar filmes.");
    expect(screen.queryByRole("button", { name: "Tentar novamente" })).not.toBeInTheDocument();
  });

  it("shows a retryable message on 500 and recovers with 'Tentar novamente'", async () => {
    let fail = true;
    server.use(
      http.post(URL_IMPORT, () =>
        fail
          ? HttpResponse.json({ message: "boom" }, { status: 500 })
          : HttpResponse.json({ status: "import triggered" }, { status: 202 })
      )
    );
    const user = setup();
    await user.type(textbox(), "x");
    await user.click(submitBtn());
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível iniciar a importação.");
    fail = false;
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText(/Importação iniciada para 1 filme\./)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("clears the error and the success message when the user edits the text", async () => {
    server.use(http.post(URL_IMPORT, () => HttpResponse.json({ message: "boom" }, { status: 500 })));
    const user = setup();
    await user.type(textbox(), "x");
    await user.click(submitBtn());
    await screen.findByRole("alert");
    await user.type(textbox(), "y");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
