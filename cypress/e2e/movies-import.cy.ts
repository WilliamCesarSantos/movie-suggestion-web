/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

const IMPORT_URL = "**/api/v1/movies-import";

function seedSession(roles: string[]) {
  return {
    onBeforeLoad(win: Window) {
      win.localStorage.setItem("movie_token", "e2e-token");
      win.localStorage.setItem("movie_roles", JSON.stringify(roles));
      win.localStorage.setItem("movie_email", "jane@example.com");
    },
  };
}

const textbox = () => cy.findByRole("textbox", { name: "Títulos para importar" });
const submit = () => cy.findByRole("button", { name: "Importar filmes" });

describe("Movies import (E2E, stubbed)", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/movies-import", seedSession(["movies:write"]));
  });

  it("keeps submit disabled until there is a valid title", () => {
    submit().should("be.disabled");
    cy.findByText("Nenhum título válido").should("exist");
    textbox().type("Inception");
    submit().should("be.enabled");
    cy.findByText("1 filme para importar").should("exist");
  });

  it("normalizes terms, sends maxPages 5 and clears the textarea on 202", () => {
    cy.intercept("POST", IMPORT_URL, { statusCode: 202, body: { status: "import triggered" } }).as("import");
    textbox().type("Inception{enter}{enter}  matrix  {enter}INCEPTION");
    cy.findByText("2 filmes para importar").should("exist");
    submit().click();
    cy.wait("@import").its("request.body").should("deep.equal", { searchTerms: ["Inception", "matrix"], maxPages: 5 });
    cy.findByText(/Importação iniciada para 2 filmes/).should("be.visible");
    textbox().should("have.value", "");
    cy.findByRole("link", { name: "Ver catálogo" }).should("have.attr", "href", "/catalog");
  });

  it("shows an invalid titles error on 400 without retry", () => {
    cy.intercept("POST", IMPORT_URL, { statusCode: 400, body: { message: "bad" } }).as("import");
    textbox().type("x");
    submit().click();
    cy.wait("@import");
    cy.findByRole("alert").should("contain.text", "Os títulos informados são inválidos.");
    cy.findByRole("button", { name: "Tentar novamente" }).should("not.exist");
    textbox().should("have.value", "x");
  });

  it("shows a permission error on 403", () => {
    cy.intercept("POST", IMPORT_URL, { statusCode: 403, body: { message: "no" } }).as("import");
    textbox().type("x");
    submit().click();
    cy.wait("@import");
    cy.findByRole("alert").should("contain.text", "Você não tem permissão para importar filmes.");
  });

  it("shows a retryable error on 500 and recovers", () => {
    cy.intercept("POST", IMPORT_URL, { statusCode: 500, body: { message: "boom" } }).as("fail");
    textbox().type("x");
    submit().click();
    cy.wait("@fail");
    cy.findByRole("alert").should("contain.text", "Não foi possível iniciar a importação.");

    cy.intercept("POST", IMPORT_URL, { statusCode: 202, body: { status: "import triggered" } }).as("ok");
    cy.findByRole("button", { name: "Tentar novamente" }).click();
    cy.wait("@ok");
    cy.findByText(/Importação iniciada para 1 filme\./).should("be.visible");
  });
});

describe("Movies import (E2E, REAL BACKEND - triggers a real import of ONE movie)", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("[backend real] imports a single movie 'Inception' through POST /api/v1/movies-import", () => {
    cy.login(Cypress.env("USER_EMAIL"), Cypress.env("USER_PASSWORD"));
    // Observe only: no stub, no response -> the request hits the real backend.
    cy.intercept("POST", IMPORT_URL).as("realImport");
    cy.visit("/movies-import");

    textbox().type("Inception");
    cy.findByText("1 filme para importar").should("exist");
    submit().click();

    cy.wait("@realImport").then(({ request, response }) => {
      expect(request.body).to.deep.equal({ searchTerms: ["Inception"], maxPages: 5 });
      expect(response?.statusCode).to.eq(202);
      expect(response?.body.status).to.eq("import triggered");
    });
    cy.findByText(/Importação iniciada para 1 filme\./).should("be.visible");
  });
});
