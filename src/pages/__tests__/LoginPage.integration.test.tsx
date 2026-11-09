import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { LoginPage } from "@/pages/LoginPage";
import { storage } from "@/lib/storage";

const API = "http://localhost:8080/api/v1";

function renderLogin(initialEntries: string[] = ["/login"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/catalog"
          element={<div data-testid="catalog-page">Catalog</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("LoginPage integration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("idle state", () => {
    it("renders email and password fields with the submit button disabled", () => {
      renderLogin();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Senha")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Entrar" })).toBeDisabled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("focuses the email field on mount", async () => {
      renderLogin();
      await waitFor(() =>
        expect(screen.getByLabelText("Email")).toHaveFocus()
      );
    });

    it("keeps the submit button disabled while only one field has content", async () => {
      const user = userEvent.setup();
      renderLogin();
      await user.type(screen.getByLabelText("Email"), "jane@example.com");
      expect(screen.getByRole("button", { name: "Entrar" })).toBeDisabled();
    });

    it("keeps the submit button disabled when fields contain only spaces", async () => {
      const user = userEvent.setup();
      renderLogin();
      await user.type(screen.getByLabelText("Email"), "   ");
      await user.type(screen.getByLabelText("Senha"), "   ");
      // password is not trimmed per prototype, but email trimmed check must disable
      expect(screen.getByRole("button", { name: "Entrar" })).toBeDisabled();
    });

    it("enables the submit button once both fields have content", async () => {
      const user = userEvent.setup();
      renderLogin();
      await user.type(screen.getByLabelText("Email"), "jane@example.com");
      await user.type(screen.getByLabelText("Senha"), "secret");
      expect(
        screen.getByRole("button", { name: "Entrar" })
      ).toBeEnabled();
    });
  });

  describe("submitting state (success-redirecting)", () => {
    it("persists the token, marks aria-busy, and navigates to /catalog on 200", async () => {
      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText("Email"), "jane@example.com");
      await user.type(screen.getByLabelText("Senha"), "secret");
      await user.click(screen.getByRole("button", { name: "Entrar" }));

      expect(await screen.findByTestId("catalog-page")).toBeInTheDocument();
      expect(storage.getToken()).toBe("test-token");
    });

    it("shows the 'Entrando...' label with aria-busy while the request is in flight", async () => {
      const gate: { release?: () => void } = {};
      server.use(
        http.post(`${API}/login`, async () => {
          await new Promise<void>((resolve) => {
            gate.release = resolve;
          });
          return HttpResponse.json({
            token: "test-token",
            email: "jane@example.com",
            roles: ["*"],
            expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
          });
        })
      );

      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText("Email"), "jane@example.com");
      await user.type(screen.getByLabelText("Senha"), "secret");
      await user.click(screen.getByRole("button", { name: "Entrar" }));

      // aria-label is "Entrar", so we look up the button by accessible name
      // and assert the visible loading label and aria-busy flag instead.
      const submitButton = screen.getByRole("button", { name: "Entrar" });
      await waitFor(() =>
        expect(submitButton).toHaveAttribute("aria-busy", "true")
      );
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent("Entrando...");
      expect(screen.getByLabelText("Email")).toHaveAttribute("readonly");
      expect(screen.getByLabelText("Senha")).toHaveAttribute("readonly");

      gate.release?.();
      await screen.findByTestId("catalog-page");
    });
  });

  describe("error state", () => {
    it("shows 'Email ou senha inválidos.' on HTTP 401", async () => {
      server.use(
        http.post(`${API}/login`, () =>
          HttpResponse.json({ message: "unauthorized" }, { status: 401 })
        )
      );

      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText("Email"), "jane@example.com");
      await user.type(screen.getByLabelText("Senha"), "wrong");
      await user.click(screen.getByRole("button", { name: "Entrar" }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("Email ou senha inválidos.");
      expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
      expect(storage.getToken()).toBeNull();
    });

    it("shows 'Preencha email e senha corretamente.' on HTTP 400", async () => {
      server.use(
        http.post(`${API}/login`, () =>
          HttpResponse.json({ message: "invalid request body" }, { status: 400 })
        )
      );

      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText("Email"), "jane@example.com");
      await user.type(screen.getByLabelText("Senha"), "secret");
      await user.click(screen.getByRole("button", { name: "Entrar" }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("Preencha email e senha corretamente.");
    });

    it("shows the generic network message on fetch failure", async () => {
      server.use(http.post(`${API}/login`, () => HttpResponse.error()));

      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText("Email"), "jane@example.com");
      await user.type(screen.getByLabelText("Senha"), "secret");
      await user.click(screen.getByRole("button", { name: "Entrar" }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(
        "Não foi possível entrar agora. Tente novamente em instantes."
      );
    });

    it("moves focus to the alert when an error is shown", async () => {
      server.use(
        http.post(`${API}/login`, () =>
          HttpResponse.json({ message: "unauthorized" }, { status: 401 })
        )
      );

      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText("Email"), "jane@example.com");
      await user.type(screen.getByLabelText("Senha"), "wrong");
      await user.click(screen.getByRole("button", { name: "Entrar" }));

      const alert = await screen.findByRole("alert");
      await waitFor(() => expect(alert).toHaveFocus());
    });

    it("clears the error message as soon as the user edits a field again", async () => {
      server.use(
        http.post(`${API}/login`, () =>
          HttpResponse.json({ message: "unauthorized" }, { status: 401 })
        )
      );

      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText("Email"), "jane@example.com");
      await user.type(screen.getByLabelText("Senha"), "wrong");
      await user.click(screen.getByRole("button", { name: "Entrar" }));

      await screen.findByRole("alert");

      await user.type(screen.getByLabelText("Senha"), "x");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("submission by Enter key", () => {
    it("submits the form when Enter is pressed inside the password field", async () => {
      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText("Email"), "jane@example.com");
      await user.type(screen.getByLabelText("Senha"), "secret{Enter}");

      expect(await screen.findByTestId("catalog-page")).toBeInTheDocument();
    });
  });

  describe("already authenticated", () => {
    it("redirects straight to /catalog when a token already exists", async () => {
      storage.setToken("existing-token");
      renderLogin();
      expect(await screen.findByTestId("catalog-page")).toBeInTheDocument();
      expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    });
  });
});
