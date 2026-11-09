/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

const page = (ids: number[], nextCursor: string | null) => ({
  data: ids.map((id) => ({
    id: String(id),
    title: `Filme ${id}`,
    year: "2020",
    poster: `https://example.com/${id}.jpg`,
    imdbRating: 8,
  })),
  nextCursor,
  prevCursor: null,
  hasNext: nextCursor !== null,
  hasPrev: false,
  limit: 12,
  count: ids.length,
  total: 24,
});

function stubMovies() {
  const first = Array.from({ length: 12 }, (_, i) => i + 1);
  const second = Array.from({ length: 12 }, (_, i) => i + 13);
  cy.intercept("GET", "**/api/v1/movies*", (req) => {
    const cursor = new URL(req.url).searchParams.get("cursor");
    req.reply(cursor ? page(second, null) : page(first, "page2"));
  }).as("movies");
}

describe("Catalog (E2E)", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    stubMovies();
  });

  it("golden path: login -> catalog -> play simulation -> rate -> back to catalog", () => {
    cy.intercept("POST", "**/api/v1/login", {
      statusCode: 200,
      body: {
        token: "e2e-token",
        email: "jane@example.com",
        roles: ["movies:read", "movies-watch:write"],
        expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
      },
    }).as("login");
    cy.intercept("POST", "**/api/v1/movies/1/watched", { statusCode: 200, body: { status: "ok" } }).as("watched");

    cy.visit("/login");
    cy.findByLabelText(/email/i).type("jane@example.com");
    cy.findByLabelText(/senha/i).type("supersecret");
    cy.findByRole("button", { name: /^entrar$/i }).click();
    cy.wait("@login");

    cy.location("pathname").should("eq", "/catalog");
    cy.findByAltText("Poster de Filme 1").should("exist");
    cy.findByRole("button", { name: "Menu" }).should("not.exist");

    cy.findByRole("button", { name: /Filme 1$/ }).click();
    cy.findByRole("dialog", { name: "Reproduzindo Filme 1" }).should("be.visible");
    cy.get("video").should("not.exist");
    cy.findByRole("progressbar").should("exist");

    // Simulation ends by itself (3s) and navigates to the rating screen.
    cy.location("pathname", { timeout: 8000 }).should("eq", "/movies/1/rate");
    cy.findByRole("button", { name: "Enviar avaliação" }).should("be.disabled");
    cy.findByRole("radio", { name: "9 estrelas" }).click();
    cy.findByRole("button", { name: "Enviar avaliação" }).click();

    cy.wait("@watched").its("request.body").should("deep.equal", { rating: 9, reaction: "liked" });
    cy.location("pathname").should("eq", "/catalog");
  });

  it("closes the player modal with Escape", () => {
    cy.visit("/catalog", {
      onBeforeLoad(win) {
        win.localStorage.setItem("movie_token", "e2e-token");
        win.localStorage.setItem("movie_roles", JSON.stringify(["*"]));
      },
    });
    cy.findByRole("button", { name: /Filme 2$/ }).click();
    cy.findByRole("dialog").should("be.visible");
    cy.get("body").type("{esc}");
    cy.findByRole("dialog").should("not.exist");
    cy.location("pathname").should("eq", "/catalog");
  });

  it("loads a second page on scroll and shows the end-of-list message", () => {
    cy.visit("/catalog", {
      onBeforeLoad(win) {
        win.localStorage.setItem("movie_token", "e2e-token");
        win.localStorage.setItem("movie_roles", JSON.stringify(["*"]));
      },
    });
    cy.wait("@movies");
    cy.findByAltText("Poster de Filme 1").should("exist");
    cy.scrollTo("bottom");
    cy.wait("@movies").its("request.url").should("include", "cursor=page2");
    cy.findByAltText("Poster de Filme 13").should("exist");
    cy.scrollTo("bottom");
    cy.findByText("Não há mais filmes para exibir").should("be.visible");
  });

  it("shows a permission toast instead of the player without movies-watch:write", () => {
    cy.visit("/catalog", {
      onBeforeLoad(win) {
        win.localStorage.setItem("movie_token", "e2e-token");
        win.localStorage.setItem("movie_roles", JSON.stringify(["movies:read"]));
      },
    });
    cy.findByRole("button", { name: /Filme 1$/ }).click();
    cy.findByRole("alert").should("contain.text", "Você não tem permissão para avaliar filmes.");
    cy.findByRole("dialog").should("not.exist");
  });

  it("keeps the session across reloads", () => {
    cy.visit("/catalog", {
      onBeforeLoad(win) {
        win.localStorage.setItem("movie_token", "e2e-token");
        win.localStorage.setItem("movie_roles", JSON.stringify(["*"]));
      },
    });
    cy.findByAltText("Poster de Filme 1").should("exist");
    cy.reload();
    cy.location("pathname").should("eq", "/catalog");
    cy.window().its("localStorage.movie_token").should("eq", "e2e-token");
    cy.findByAltText("Poster de Filme 1").should("exist");
  });

  it("redirects to /login without a token", () => {
    cy.visit("/catalog");
    cy.location("pathname").should("eq", "/login");
  });

  it("shows the menu items allowed by the role matrix", () => {
    cy.visit("/catalog", {
      onBeforeLoad(win) {
        win.localStorage.setItem("movie_token", "e2e-token");
        win.localStorage.setItem("movie_roles", JSON.stringify(["movies:read", "users:read"]));
      },
    });
    cy.findByRole("button", { name: "Menu" }).click();
    cy.findByRole("link", { name: "Listar" }).should("be.visible");
    cy.findByRole("link", { name: "Cadastrar" }).should("not.exist");
    cy.findByRole("link", { name: "Importar" }).should("not.exist");
  });

  it("denies direct access to /movies-import without movies:write", () => {
    cy.visit("/movies-import", {
      onBeforeLoad(win) {
        win.localStorage.setItem("movie_token", "e2e-token");
        win.localStorage.setItem("movie_roles", JSON.stringify(["movies:read"]));
      },
    });
    cy.findByRole("alert").should("contain.text", "Acesso negado");
  });
});
