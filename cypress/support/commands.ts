/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.request("POST", "http://localhost:8080/api/v1/login", { email, password }).then((res) => {
    window.localStorage.setItem("movie_token", res.body.token);
  });
});

export {};
