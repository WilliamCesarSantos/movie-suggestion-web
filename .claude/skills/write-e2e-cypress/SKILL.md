---
name: write-e2e-cypress
description: Padrões para testes end-to-end com Cypress cobrindo o fluxo completo do catálogo no navegador real.
---

# Write E2E Cypress

E2E valida o sistema completo — frontend, backend e integrações — em navegador real.

## Setup
- Config em `cypress.config.ts`.
- `baseUrl: "http://localhost:5173"` (dev server do Vite).
- Backend real em `http://localhost:8080` precisa estar rodando.

## Localização
- Specs: `cypress/e2e/*.cy.ts`
- Fixtures: `cypress/fixtures/*.json`
- Comandos customizados: `cypress/support/commands.ts`

## Comandos customizados sugeridos
```ts
// cypress/support/commands.ts
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.request("POST", "http://localhost:8080/api/v1/login", { email, password })
    .then((res) => {
      window.localStorage.setItem("movie_token", res.body.token);
    });
});
```

## Template de spec
```ts
describe("Movie catalog flow", () => {
  beforeEach(() => {
    cy.login(Cypress.env("USER_EMAIL"), Cypress.env("USER_PASSWORD"));
    cy.visit("/catalog");
  });

  it("loads initial catalog page with movie posters", () => {
    cy.findAllByRole("img").should("have.length.at.least", 1);
  });

  it("loads more movies on scroll", () => {
    cy.findAllByRole("img").then(($first) => {
      const initialCount = $first.length;
      cy.scrollTo("bottom");
      cy.findAllByRole("img").should("have.length.greaterThan", initialCount);
    });
  });

  it("opens movie details and simulates playback", () => {
    cy.findAllByRole("img").first().click();
    cy.findByRole("button", { name: /reproduzir/i }).click();
    cy.findByRole("dialog").should("be.visible");
    cy.findByRole("button", { name: /fechar/i }).click();
    cy.findByRole("dialog").should("not.exist");
  });
});
```

## Regras
- **Sem `cy.wait(ms)` arbitrário**. Use asserções implícitas (`should`) ou `cy.intercept` com alias.
- **Seletores**: `findByRole`, `findByLabelText`, `findByText` via `@testing-library/cypress`. `data-cy` é último recurso.
- **Dados de teste**: use `Cypress.env()` para credenciais, nunca hardcode em specs.
- **Reset**: cada teste começa com `beforeEach` limpo (cookies, localStorage).
- **Flakiness**: se um teste for intermitente, investigar causa raiz — nunca adicionar retry silencioso.

## Scripts (`package.json`)
```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run"
  }
}
```

## Golden path obrigatório
Um spec cobrindo: login → catálogo com scroll → detalhes do filme → simulação de reprodução → fechar modal.
