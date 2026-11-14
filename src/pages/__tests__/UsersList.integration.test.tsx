import { describe, it, expect } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { API, renderApp, seedSession } from "@/test/renderApp";
import { storage } from "@/lib/storage";

const one = (n: string) => ({
  id: `u${n}`,
  name: `User ${n}`,
  email: `user${n}@example.com`,
  roles: ["users:read"],
  createdAt: "2026-05-30T12:00:00Z",
});

describe("Users list integration", () => {
  it("shows loading, then the first page with the summary", async () => {
    seedSession(["*"]);
    renderApp("/users");
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    expect((await screen.findAllByText("User 01")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("User 20").length).toBeGreaterThan(0);
    expect(screen.queryByText("User 21")).not.toBeInTheDocument();
    expect(screen.getByText("Exibindo 1-20 de 45")).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
  });

  it("sends the Authorization header and page/pageSize params", async () => {
    seedSession(["*"]);
    let auth: string | null = null;
    let search = "";
    server.use(
      http.get(`${API}/users`, ({ request }) => {
        auth = request.headers.get("Authorization");
        search = new URL(request.url).search;
        return HttpResponse.json({ data: [one("01")], total: 1, page: 1, pageSize: 20 });
      })
    );
    renderApp("/users");
    await screen.findAllByText("User 01");
    expect(auth).toBe("Bearer tok-123");
    const q = new URLSearchParams(search);
    expect(q.get("page")).toBe("1");
    expect(q.get("pageSize")).toBe("20");
  });

  it("fetches the next page and the previous page via pagination", async () => {
    seedSession(["*"]);
    const pages: string[] = [];
    server.use(
      http.get(`${API}/users`, ({ request }) => {
        const p = new URL(request.url).searchParams.get("page") ?? "1";
        pages.push(p);
        const n = p === "1" ? "01" : "21";
        return HttpResponse.json({ data: [one(n)], total: 45, page: Number(p), pageSize: 20 });
      })
    );
    const user = userEvent.setup();
    renderApp("/users");
    await screen.findAllByText("User 01");
    await user.click(screen.getByRole("button", { name: /Próxima/ }));
    expect((await screen.findAllByText("User 21")).length).toBeGreaterThan(0);
    expect(screen.getByText("Página 2 de 3")).toBeInTheDocument();
    expect(screen.getByText("Exibindo 21-40 de 45")).toBeInTheDocument();
    expect(pages).toContain("2");
    await user.click(screen.getByRole("button", { name: /Anterior/ }));
    expect((await screen.findAllByText("User 01")).length).toBeGreaterThan(0);
    expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
  });

  it("filters by name (debounced) and sends the param to the API", async () => {
    seedSession(["*"]);
    const user = userEvent.setup();
    renderApp("/users");
    await screen.findAllByText("User 01");
    await user.type(screen.getByLabelText("Nome"), "User 4");
    await waitFor(() => expect(screen.getByText("Exibindo 1-6 de 6")).toBeInTheDocument());
    expect(screen.queryByText("User 01")).not.toBeInTheDocument();
    expect(screen.getAllByText("User 40").length).toBeGreaterThan(0);
    expect(screen.queryByRole("navigation", { name: "Paginação de usuários" })).not.toBeInTheDocument();
  });

  it("filters by e-mail", async () => {
    seedSession(["*"]);
    let email = "";
    server.use(
      http.get(`${API}/users`, ({ request }) => {
        email = new URL(request.url).searchParams.get("email") ?? "";
        return HttpResponse.json({ data: email ? [one("07")] : [one("01"), one("02")], total: email ? 1 : 2, page: 1, pageSize: 20 });
      })
    );
    const user = userEvent.setup();
    renderApp("/users");
    await screen.findAllByText("User 01");
    await user.type(screen.getByLabelText("E-mail"), "user07@example.com");
    await waitFor(() => expect(screen.getByText("Exibindo 1-1 de 1")).toBeInTheDocument());
    expect(email).toBe("user07@example.com");
    expect(screen.getAllByText("User 07").length).toBeGreaterThan(0);
  });

  it("shows the empty state for filters without results and clears them", async () => {
    seedSession(["*"]);
    const user = userEvent.setup();
    renderApp("/users");
    await screen.findAllByText("User 01");
    await user.type(screen.getByLabelText("Nome"), "zzz");
    expect(await screen.findByText("Nenhum usuário encontrado.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect((await screen.findAllByText("User 01")).length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Nome")).toHaveValue("");
  });

  it("shows the empty state with a create link when there are no users and no filters", async () => {
    seedSession(["users:write"]);
    server.use(http.get(`${API}/users`, () => HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20 })));
    renderApp("/users");
    expect(await screen.findByText("Nenhum usuário encontrado.")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Novo usuário/ }).length).toBeGreaterThan(0);
  });

  it("shows an error state and recovers with 'Tentar novamente'", async () => {
    seedSession(["*"]);
    let fail = true;
    server.use(
      http.get(`${API}/users`, () =>
        fail
          ? HttpResponse.json({ message: "boom" }, { status: 500 })
          : HttpResponse.json({ data: [one("01")], total: 1, page: 1, pageSize: 20 })
      )
    );
    renderApp("/users");
    expect(await screen.findByText("Não foi possível carregar os usuários.")).toBeInTheDocument();
    fail = false;
    await userEvent.setup().click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect((await screen.findAllByText("User 01")).length).toBeGreaterThan(0);
  });

  it("leaves the page on a 403 from the list", async () => {
    seedSession(["users:read"]);
    server.use(http.get(`${API}/users`, () => HttpResponse.json({ message: "forbidden" }, { status: 403 })));
    renderApp("/users");
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Usuários" })).not.toBeInTheDocument());
    expect(screen.queryByText("Não foi possível carregar os usuários.")).not.toBeInTheDocument();
  });

  it("clears the token on 401", async () => {
    seedSession(["*"]);
    server.use(http.get(`${API}/users`, () => HttpResponse.json({ message: "unauthorized" }, { status: 401 })));
    renderApp("/users");
    await waitFor(() => expect(storage.getToken()).toBeNull());
  });

  describe("role matrix: list actions", () => {
    it.each([["*"], ["users:write"]])("%s sees 'Novo usuário' and the edit action", async (role) => {
      seedSession([role]);
      renderApp("/users");
      await screen.findAllByText("User 01");
      expect(screen.getByRole("link", { name: "Novo usuário" })).toHaveAttribute("href", "/users/new");
      expect(screen.getAllByRole("link", { name: "Editar usuário User 01" })[0]).toHaveAttribute("href", "/users/u01/edit");
      expect(screen.getByRole("columnheader", { name: "Ações" })).toBeInTheDocument();
      expect(screen.queryByText(/somente de leitura/)).not.toBeInTheDocument();
    });

    it("users:read only sees a read-only list: no create button, no edit icon, no filters", async () => {
      seedSession(["users:read"], "user01@example.com");
      server.use(
        http.get(`${API}/users`, () => HttpResponse.json({ data: [one("01")], total: 1, page: 1, pageSize: 20 }))
      );
      renderApp("/users");
      await screen.findAllByText("User 01");
      expect(screen.getByText(/somente de leitura/)).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /Novo usuário/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /Editar usuário/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("columnheader", { name: "Ações" })).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();
    });
  });

  describe("role matrix: menu", () => {
    it.each([["*"], ["users:read"], ["users:write"]])("%s sees the single 'Usuários' entry", async (role) => {
      seedSession([role]);
      renderApp("/users");
      await screen.findAllByText("User 01").catch(() => undefined);
      const user = userEvent.setup();
      await user.click(await screen.findByRole("button", { name: "Menu" }));
      expect(screen.getAllByRole("link", { name: "Usuários" })).toHaveLength(1);
      expect(screen.queryByRole("link", { name: "Listar" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Cadastrar" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Editar" })).not.toBeInTheDocument();
    });

    it("hides the Menu for roles without users or import permissions", async () => {
      seedSession(["movies:read"]);
      renderApp("/catalog");
      await waitFor(() => expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument());
      expect(screen.queryByRole("button", { name: "Menu" })).not.toBeInTheDocument();
    });

    it("movies:write sees Importar but not 'Usuários'", async () => {
      seedSession(["movies:write"]);
      renderApp("/catalog");
      await userEvent.setup().click(await screen.findByRole("button", { name: "Menu" }));
      expect(screen.getByRole("link", { name: "Importar" })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
    });

    it("navigates to /users from the menu", async () => {
      seedSession(["movies:read", "users:read"]);
      renderApp("/catalog");
      const user = userEvent.setup();
      await user.click(await screen.findByRole("button", { name: "Menu" }));
      await user.click(screen.getByRole("link", { name: "Usuários" }));
      expect(await screen.findByRole("heading", { name: "Usuários" })).toBeInTheDocument();
    });
  });

  describe("role matrix: protected routes", () => {
    it.each([
      ["/users", ["movies:read"]],
      ["/users/new", ["users:read"]],
      ["/users/new", ["movies:read"]],
      ["/users/u01/edit", ["users:read"]],
      ["/users/u01/edit", ["movies:write"]],
    ])("denies %s for %j", async (path, roles) => {
      seedSession(roles);
      renderApp(path);
      expect(await within(await screen.findByRole("alert")).findByText("Acesso negado")).toBeInTheDocument();
    });

    it.each([["*"], ["users:write"]])("allows /users/new for %s", async (role) => {
      seedSession([role]);
      renderApp("/users/new");
      expect(await screen.findByRole("heading", { name: "Novo usuário" })).toBeInTheDocument();
      expect(screen.queryByText("Acesso negado")).not.toBeInTheDocument();
    });

    it.each([["*"], ["users:write"]])("allows /users/:id/edit for %s", async (role) => {
      seedSession([role]);
      renderApp("/users/u03/edit");
      expect(await screen.findByRole("heading", { name: "Editar usuário" })).toBeInTheDocument();
      expect(await screen.findByLabelText("Nome")).toHaveValue("User 03");
    });

    it("allows /users for users:read", async () => {
      seedSession(["users:read"]);
      renderApp("/users");
      expect(await screen.findByRole("heading", { name: "Usuários" })).toBeInTheDocument();
      expect(screen.queryByText("Acesso negado")).not.toBeInTheDocument();
    });

    it("redirects unauthenticated visitors away from /users", () => {
      renderApp("/users");
      expect(screen.queryByRole("heading", { name: "Usuários" })).not.toBeInTheDocument();
    });
  });
});
