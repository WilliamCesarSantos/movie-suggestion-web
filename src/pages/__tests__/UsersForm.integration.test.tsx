import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { API, renderApp, seedSession } from "@/test/renderApp";

type Body = Record<string, unknown>;

function capture<T extends Body = Body>() {
  const box: { body: T | null; auth: string | null; calls: number } = { body: null, auth: null, calls: 0 };
  return box;
}

async function fillCreate(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText("Nome *"), "Bia Souza");
  await user.type(screen.getByLabelText("E-mail *"), "bia@example.com");
  await user.type(screen.getByLabelText(/^Senha/), "secret1");
}

describe("User create integration", () => {
  it("creates a user (201), sends the full body and returns to the list with a toast", async () => {
    seedSession(["*"]);
    const box = capture();
    server.use(
      http.post(`${API}/users`, async ({ request }) => {
        box.body = (await request.json()) as Body;
        box.auth = request.headers.get("Authorization");
        return HttpResponse.json(
          { id: "n1", name: "Bia Souza", email: "bia@example.com", roles: ["movies:read", "users:read"], createdAt: "2026-11-13T00:00:00Z" },
          { status: 201 }
        );
      })
    );
    const user = userEvent.setup();
    renderApp("/users/new");
    await fillCreate(user);
    await user.click(screen.getByRole("checkbox", { name: "users:read" }));
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(await screen.findByText("Usuário cadastrado com sucesso.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Usuários" })).toBeInTheDocument();
    expect(box.auth).toBe("Bearer tok-123");
    expect(box.body).toEqual({
      name: "Bia Souza",
      email: "bia@example.com",
      password: "secret1",
      roles: ["movies:read", "users:read"],
    });
  });

  it("does not call the API when validation fails", async () => {
    seedSession(["*"]);
    const box = capture();
    server.use(
      http.post(`${API}/users`, () => {
        box.calls++;
        return HttpResponse.json({}, { status: 201 });
      })
    );
    const user = userEvent.setup();
    renderApp("/users/new");
    await user.click(await screen.findByRole("button", { name: "Cadastrar" }));
    expect(screen.getByText("O nome é obrigatório.")).toBeInTheDocument();
    expect(box.calls).toBe(0);
  });

  it("409 shows 'e-mail já cadastrado' on the e-mail field and stays on the form", async () => {
    seedSession(["*"]);
    server.use(http.post(`${API}/users`, () => HttpResponse.json({ message: "conflict" }, { status: 409 })));
    const user = userEvent.setup();
    renderApp("/users/new");
    await fillCreate(user);
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(await screen.findByText("Este e-mail já está cadastrado.")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail *")).toHaveAttribute("aria-invalid", "true");
    await waitFor(() => expect(screen.getByLabelText("E-mail *")).toHaveFocus());
    expect(screen.getByRole("heading", { name: "Novo usuário" })).toBeInTheDocument();
  });

  it.each([
    [400, "Dados inválidos. Revise os campos e tente novamente."],
    [403, "Você não tem permissão para realizar esta ação."],
    [500, "Não foi possível salvar. Tente novamente em instantes."],
  ])("%i shows a banner", async (status, message) => {
    seedSession(["*"]);
    server.use(http.post(`${API}/users`, () => HttpResponse.json({ message: "x" }, { status })));
    const user = userEvent.setup();
    renderApp("/users/new");
    await fillCreate(user);
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
  });

  it("Cancelar returns to the list", async () => {
    seedSession(["*"]);
    const user = userEvent.setup();
    renderApp("/users/new");
    await user.click(await screen.findByRole("button", { name: "Cancelar" }));
    expect(await screen.findByRole("heading", { name: "Usuários" })).toBeInTheDocument();
  });
});

describe("User edit integration", () => {
  async function openEditFromList(name: string, user: ReturnType<typeof userEvent.setup>) {
    await screen.findAllByText(name);
    await user.click(screen.getAllByRole("link", { name: `Editar usuário ${name}` })[0]);
    expect(await screen.findByRole("heading", { name: "Editar usuário" })).toBeInTheDocument();
  }

  it("owner: PATCH carries only the changed name", async () => {
    seedSession(["*"], "user01@example.com");
    const box = capture();
    server.use(
      http.patch(`${API}/users/:id`, async ({ request, params }) => {
        box.body = (await request.json()) as Body;
        box.auth = request.headers.get("Authorization");
        expect(params.id).toBe("u01");
        return HttpResponse.json({ id: "u01", name: "Novo Nome", email: "user01@example.com", roles: ["movies:read"], createdAt: "2026-05-30T12:00:00Z" });
      })
    );
    const user = userEvent.setup();
    renderApp("/users");
    await openEditFromList("User 01", user);
    const name = screen.getByLabelText("Nome");
    expect(name).toBeEnabled();
    await user.clear(name);
    await user.type(name, "Novo Nome");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByText("Usuário atualizado com sucesso.")).toBeInTheDocument();
    expect(box.body).toEqual({ name: "Novo Nome" });
    expect(box.auth).toBe("Bearer tok-123");
  });

  it("owner: PATCH carries only the password when only the password changes", async () => {
    seedSession(["*"], "user01@example.com");
    const box = capture();
    server.use(
      http.patch(`${API}/users/:id`, async ({ request }) => {
        box.body = (await request.json()) as Body;
        return HttpResponse.json({ id: "u01", name: "User 01", email: "user01@example.com", roles: ["movies:read"], createdAt: "2026-05-30T12:00:00Z" });
      })
    );
    const user = userEvent.setup();
    renderApp("/users");
    await openEditFromList("User 01", user);
    await user.type(screen.getByLabelText(/Nova senha/), "newsecret");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await screen.findByText("Usuário atualizado com sucesso.");
    expect(box.body).toEqual({ password: "newsecret" });
  });

  it("owner changing roles warns that permissions change on next login", async () => {
    seedSession(["*"], "user01@example.com");
    const box = capture();
    server.use(
      http.patch(`${API}/users/:id`, async ({ request }) => {
        box.body = (await request.json()) as Body;
        return HttpResponse.json({ id: "u01", name: "User 01", email: "user01@example.com", roles: ["movies:read", "users:write"], createdAt: "2026-05-30T12:00:00Z" });
      })
    );
    const user = userEvent.setup();
    renderApp("/users");
    await openEditFromList("User 01", user);
    await user.click(screen.getByRole("checkbox", { name: "users:write" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Usuário atualizado com sucesso. Suas permissões mudam no próximo login.")).toBeInTheDocument();
    expect(box.body).toEqual({ roles: ["movies:read", "users:write"] });
  });

  it("non-owner: name/password are locked and PATCH carries only roles", async () => {
    seedSession(["*"], "admin@example.com");
    const box = capture();
    server.use(
      http.patch(`${API}/users/:id`, async ({ request }) => {
        box.body = (await request.json()) as Body;
        return HttpResponse.json({ id: "u02", name: "User 02", email: "user02@example.com", roles: ["movies:read", "users:read"], createdAt: "2026-05-30T12:00:00Z" });
      })
    );
    const user = userEvent.setup();
    renderApp("/users");
    await openEditFromList("User 02", user);
    expect(screen.getByLabelText("Nome")).toBeDisabled();
    expect(screen.getByLabelText(/Nova senha/)).toBeDisabled();
    expect(screen.getByLabelText(/E-mail/)).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "users:read" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Usuário atualizado com sucesso.")).toBeInTheDocument();
    expect(screen.queryByText(/próximo login/)).not.toBeInTheDocument();
    expect(box.body).toEqual({ roles: ["movies:read", "users:read"] });
  });

  it("preserves the wildcard role in the PATCH payload", async () => {
    seedSession(["*"], "admin@example.com");
    const box = capture();
    server.use(
      http.get(`${API}/users`, () =>
        HttpResponse.json({
          data: [{ id: "u09", name: "Root", email: "root@example.com", roles: ["*", "movies:read"], createdAt: "2026-05-30T12:00:00Z" }],
          total: 1,
          page: 1,
          pageSize: 20,
        })
      ),
      http.patch(`${API}/users/:id`, async ({ request }) => {
        box.body = (await request.json()) as Body;
        return HttpResponse.json({ id: "u09", name: "Root", email: "root@example.com", roles: [], createdAt: "2026-05-30T12:00:00Z" });
      })
    );
    const user = userEvent.setup();
    renderApp("/users");
    await openEditFromList("Root", user);
    expect(screen.getByText(/Roles especiais mantidas ao salvar: \*\./)).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "users:read" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await screen.findByText("Usuário atualizado com sucesso.");
    expect(box.body).toEqual({ roles: ["movies:read", "users:read", "*"] });
  });

  it("does not call PATCH when nothing changed (Salvar disabled)", async () => {
    seedSession(["*"], "admin@example.com");
    const box = capture();
    server.use(
      http.patch(`${API}/users/:id`, () => {
        box.calls++;
        return HttpResponse.json({});
      })
    );
    const user = userEvent.setup();
    renderApp("/users");
    await openEditFromList("User 02", user);
    const save = screen.getByRole("button", { name: "Salvar" });
    expect(save).toBeDisabled();
    await user.click(save);
    expect(box.calls).toBe(0);
  });

  it("PATCH 403 and 404 show banners", async () => {
    seedSession(["*"], "admin@example.com");
    let status = 403;
    server.use(http.patch(`${API}/users/:id`, () => HttpResponse.json({ message: "x" }, { status })));
    const user = userEvent.setup();
    renderApp("/users");
    await openEditFromList("User 02", user);
    await user.click(screen.getByRole("checkbox", { name: "users:read" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Você não tem permissão para realizar esta ação.");
    status = 404;
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Usuário não encontrado."));
  });

  it("direct access resolves the user via GET /users/{id} + GET /users?email=", async () => {
    seedSession(["*"], "admin@example.com");
    renderApp("/users/u05/edit");
    expect(await screen.findByLabelText("Nome")).toHaveValue("User 05");
    expect(screen.getByLabelText(/E-mail/)).toHaveValue("user05@example.com");
    expect(screen.getByRole("checkbox", { name: "movies:read" })).toBeChecked();
  });

  it("direct access shows the owner's editable profile when the e-mail matches the session", async () => {
    seedSession(["*"], "USER05@example.com");
    renderApp("/users/u05/edit");
    await waitFor(() => expect(screen.getByLabelText("Nome")).toBeEnabled());
  });

  it("direct access with 403 on the detail goes back to the list with a toast", async () => {
    seedSession(["users:write"]);
    server.use(http.get(`${API}/users/:id`, () => HttpResponse.json({ message: "forbidden" }, { status: 403 })));
    renderApp("/users/u05/edit");
    expect(await screen.findByText("Abra a edição a partir da listagem.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Usuários" })).toBeInTheDocument();
  });

  it("direct access to an unknown id shows 'Usuário não encontrado.'", async () => {
    seedSession(["*"]);
    renderApp("/users/nope/edit");
    expect(await screen.findByText("Usuário não encontrado.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Salvar" })).not.toBeInTheDocument();
  });

  it("direct access shows 'Usuário não encontrado.' when GET /users?email= does not return the user", async () => {
    seedSession(["*"]);
    let emailQuery: string | null = null;
    server.use(
      http.get(`${API}/users`, ({ request }) => {
        emailQuery = new URL(request.url).searchParams.get("email");
        return HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 1 });
      })
    );
    renderApp("/users/u05/edit");
    expect(await screen.findByText("Usuário não encontrado.")).toBeInTheDocument();
    expect(emailQuery).toBe("user05@example.com");
    expect(screen.queryByRole("button", { name: "Salvar" })).not.toBeInTheDocument();
    expect(screen.queryByText("Não foi possível carregar o usuário.")).not.toBeInTheDocument();
  });

  it("direct access with a server error shows a load failure", async () => {
    seedSession(["*"]);
    server.use(http.get(`${API}/users/:id`, () => HttpResponse.json({ message: "boom" }, { status: 500 })));
    renderApp("/users/u05/edit");
    expect(await screen.findByText("Não foi possível carregar o usuário.")).toBeInTheDocument();
  });
});
