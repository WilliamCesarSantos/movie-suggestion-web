/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

describe("Login flow (E2E)", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();

    // Intercept login so the suite does not depend on a live backend.
    cy.intercept("POST", "**/api/v1/login", (req) => {
      const body = req.body as { email?: string; password?: string };
      if (!body?.email || !body?.password) {
        req.reply({
          statusCode: 400,
          body: { message: "invalid request body" },
        });
        return;
      }
      if (body.password === "wrong") {
        req.reply({ statusCode: 401, body: { message: "unauthorized" } });
        return;
      }
      req.reply({
        statusCode: 200,
        body: {
          token: "e2e-token",
          email: body.email,
          roles: ["*"],
          expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
        },
      });
    }).as("login");

    // Intercept catalog so visiting /catalog does not blow up when backend is absent.
    cy.intercept("GET", "**/api/v1/movies*", {
      statusCode: 200,
      body: {
        data: [],
        nextCursor: null,
        prevCursor: null,
        hasNext: false,
        hasPrev: false,
        limit: 10,
        count: 0,
        total: 0,
      },
    });
  });

  it("logs in with valid credentials and lands on /catalog", () => {
    cy.visit("/login");

    cy.findByRole("heading", { name: /entrar na sua conta/i }).should(
      "be.visible"
    );
    cy.findByRole("button", { name: /^entrar$/i }).should("be.disabled");

    cy.findByLabelText(/email/i).type("jane@example.com");
    cy.findByLabelText(/senha/i).type("supersecret");

    cy.findByRole("button", { name: /^entrar$/i })
      .should("be.enabled")
      .click();

    cy.wait("@login").its("response.statusCode").should("eq", 200);

    cy.location("pathname").should("eq", "/catalog");
    cy.window().its("localStorage.movie_token").should("eq", "e2e-token");
  });

  it("shows an inline error message when the credentials are invalid", () => {
    cy.visit("/login");

    cy.findByLabelText(/email/i).type("jane@example.com");
    cy.findByLabelText(/senha/i).type("wrong");
    cy.findByRole("button", { name: /^entrar$/i }).click();

    cy.wait("@login").its("response.statusCode").should("eq", 401);

    cy.findByRole("alert").should(
      "contain.text",
      "Email ou senha inválidos."
    );
    cy.location("pathname").should("eq", "/login");
    cy.window().its("localStorage.movie_token").should("be.undefined");
  });

  it("redirects authenticated users away from /login", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("movie_token", "already-logged-in");
    });
    cy.visit("/login");
    cy.location("pathname").should("eq", "/catalog");
  });
});
