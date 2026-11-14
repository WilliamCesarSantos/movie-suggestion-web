/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.request("POST", "http://localhost:8080/api/v1/login", { email: String(email), password: String(password) }).then((res) => {
    window.localStorage.setItem("movie_token", res.body.token);
    window.localStorage.setItem("movie_roles", JSON.stringify(res.body.roles ?? []));
    window.localStorage.setItem("movie_email", res.body.email ?? email);
  });
});

export {};
