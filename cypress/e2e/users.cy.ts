/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

const ADMIN_EMAIL = "admin@example.com";

type SeedUser = { id: string; name: string; email: string; roles: string[]; createdAt: string };

const seedUsers = (n: number, offset = 0): SeedUser[] =>
  Array.from({ length: n }, (_, i) => {
    const k = String(i + 1 + offset).padStart(2, "0");
    return { id: `u${k}`, name: `User ${k}`, email: `user${k}@example.com`, roles: ["movies:read"], createdAt: "2026-05-30T12:00:00Z" };
  });

function visitAs(path: string, roles: string[], email = ADMIN_EMAIL) {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem("movie_token", "e2e-token");
      win.localStorage.setItem("movie_roles", JSON.stringify(roles));
      win.localStorage.setItem("movie_email", email);
    },
  });
}

function stubList(total = 45) {
  const all = seedUsers(total);
  cy.intercept("GET", "**/api/v1/users?*", (req) => {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const size = Number(url.searchParams.get("pageSize") ?? 20);
    const name = (url.searchParams.get("name") ?? "").toLowerCase();
    const filtered = all.filter((u) => u.name.toLowerCase().includes(name));
    req.reply({ data: filtered.slice((page - 1) * size, page * size), total: filtered.length, page, pageSize: size });
  }).as("users");
}

describe("Users (E2E, stubbed API)", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("lists users and paginates", () => {
    stubList();
    visitAs("/users", ["*"]);
    cy.wait("@users");
    cy.findByRole("heading", { name: "Usuários" }).should("be.visible");
    cy.contains("Exibindo 1-20 de 45").should("be.visible");
    cy.findByRole("button", { name: /Próxima/ }).click();
    cy.wait("@users").its("request.url").should("include", "page=2");
    cy.contains("Exibindo 21-40 de 45").should("be.visible");
    cy.contains("Página 2 de 3").should("be.visible");
  });

  it("filters by name", () => {
    stubList();
    visitAs("/users", ["*"]);
    cy.wait("@users");
    cy.findByLabelText("Nome").type("User 4");
    cy.wait("@users").its("request.url").should("include", "name=User+4");
    cy.contains("Exibindo 1-6 de 6").should("be.visible");
  });

  it("menu shows a single 'Usuários' entry that opens the list", () => {
    stubList();
    cy.intercept("GET", "**/api/v1/movies*", {
      data: [],
      nextCursor: null,
      prevCursor: null,
      hasNext: false,
      hasPrev: false,
      limit: 20,
      count: 0,
      total: 0,
    });
    visitAs("/catalog", ["movies:read", "users:read"]);
    cy.findByRole("button", { name: "Menu" }).click();
    cy.findByRole("link", { name: "Listar" }).should("not.exist");
    cy.findByRole("link", { name: "Cadastrar" }).should("not.exist");
    cy.findByRole("link", { name: "Usuários" }).click();
    cy.location("pathname").should("eq", "/users");
  });

  it("users:read only: read-only list without create/edit actions", () => {
    cy.intercept("GET", "**/api/v1/users?*", {
      data: seedUsers(1),
      total: 1,
      page: 1,
      pageSize: 20,
    }).as("users");
    visitAs("/users", ["users:read"], "user01@example.com");
    cy.wait("@users");
    cy.contains("Você tem permissão somente de leitura").should("be.visible");
    cy.findByRole("link", { name: /Novo usuário/ }).should("not.exist");
    cy.findAllByRole("link", { name: /Editar usuário/ }).should("not.exist");
  });

  it("denies /users/new and /users/:id/edit without users:write", () => {
    visitAs("/users/new", ["users:read"]);
    cy.findByRole("alert").should("contain.text", "Acesso negado");
    visitAs("/users/u01/edit", ["users:read"]);
    cy.findByRole("alert").should("contain.text", "Acesso negado");
  });

  it("create: shows 409 on duplicated e-mail, then succeeds", () => {
    stubList();
    let attempt = 0;
    cy.intercept("POST", "**/api/v1/users", (req) => {
      attempt++;
      if (attempt === 1) req.reply({ statusCode: 409, body: { message: "conflict" } });
      else req.reply({ statusCode: 201, body: { id: "new", name: req.body.name, email: req.body.email, roles: req.body.roles, createdAt: "2026-11-13T00:00:00Z" } });
    }).as("create");
    visitAs("/users", ["users:write"]);
    cy.wait("@users");
    cy.findByRole("link", { name: "Novo usuário" }).click();
    cy.location("pathname").should("eq", "/users/new");
    cy.findByLabelText("Nome *").type("Bia Souza");
    cy.findByLabelText("E-mail *").type("bia@example.com");
    cy.findByLabelText(/^Senha/).type("secret1");
    cy.findByRole("checkbox", { name: "users:read" }).check();
    cy.findByRole("button", { name: "Cadastrar" }).click();
    cy.wait("@create");
    cy.contains("Este e-mail já está cadastrado.").should("be.visible");
    cy.findByRole("button", { name: "Cadastrar" }).click();
    cy.wait("@create").its("request.body").should("deep.equal", {
      name: "Bia Souza",
      email: "bia@example.com",
      password: "secret1",
      roles: ["movies:read", "users:read"],
    });
    cy.location("pathname").should("eq", "/users");
    cy.contains("Usuário cadastrado com sucesso.").should("be.visible");
  });

  it("edit: non-owner changes only roles and PATCH sends the diff", () => {
    stubList();
    cy.intercept("PATCH", "**/api/v1/users/u02", (req) => {
      req.reply({ ...seedUsers(2)[1], roles: req.body.roles });
    }).as("patch");
    visitAs("/users", ["users:write"]);
    cy.wait("@users");
    cy.findAllByRole("link", { name: "Editar usuário User 02" }).first().click({ force: true });
    cy.location("pathname").should("eq", "/users/u02/edit");
    cy.findByLabelText("Nome").should("be.disabled");
    cy.findByRole("button", { name: "Salvar" }).should("be.disabled");
    cy.findByRole("checkbox", { name: "users:write" }).check();
    cy.findByRole("button", { name: "Salvar" }).click();
    cy.wait("@patch").its("request.body").should("deep.equal", { roles: ["movies:read", "users:write"] });
    cy.location("pathname").should("eq", "/users");
    cy.contains("Usuário atualizado com sucesso.").should("be.visible");
  });

  it("keeps the session across reloads on /users", () => {
    stubList();
    visitAs("/users", ["*"]);
    cy.wait("@users");
    cy.reload();
    cy.location("pathname").should("eq", "/users");
    cy.window().its("localStorage.movie_token").should("eq", "e2e-token");
    cy.contains("Exibindo 1-20 de 45").should("be.visible");
  });

  it("redirects to /login without a token", () => {
    cy.visit("/users");
    cy.location("pathname").should("eq", "/login");
  });
});

// Real backend (localhost:8080) with a user holding the "*" role.
// Run with: CYPRESS_USER_EMAIL=... CYPRESS_USER_PASSWORD=... npm run cypress:run
describe("Users (E2E, real backend golden path)", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.login(Cypress.env("USER_EMAIL"), Cypress.env("USER_PASSWORD"));
  });

  it("creates a user, finds it by filter and edits its roles", () => {
    const stamp = Date.now();
    const email = `e2e-${stamp}@example.com`;
    const name = `E2E ${stamp}`;

    cy.visit("/users");
    cy.findByRole("heading", { name: "Usuários" }).should("be.visible");
    cy.findByRole("link", { name: "Novo usuário" }).click();

    cy.findByLabelText("Nome *").type(name);
    cy.findByLabelText("E-mail *").type(email);
    cy.findByLabelText(/^Senha/).type("secret123");
    cy.findByRole("button", { name: "Cadastrar" }).click();
    cy.contains("Usuário cadastrado com sucesso.").should("be.visible");

    cy.findByLabelText("E-mail").type(email);
    cy.findAllByText(email).should("have.length.at.least", 1);
    cy.findAllByRole("link", { name: `Editar usuário ${name}` }).first().click({ force: true });

    cy.findByRole("checkbox", { name: "users:read" }).check();
    cy.findByRole("button", { name: "Salvar" }).click();
    cy.contains("Usuário atualizado com sucesso.").should("be.visible");
  });
});
