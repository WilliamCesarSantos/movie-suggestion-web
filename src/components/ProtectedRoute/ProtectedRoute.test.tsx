import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { storage } from "@/lib/storage";

function renderAt(roles: string[] | null, requireRoles?: string[]) {
  if (roles !== null) {
    storage.setToken("t");
    storage.setRoles(roles);
  }
  return render(
    <MemoryRouter initialEntries={["/secret"]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/catalog" element={<div>Catalog page</div>} />
        <Route
          path="/secret"
          element={
            <ProtectedRoute requireAuth requireRoles={requireRoles}>
              <div>Secret content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to /login", () => {
    renderAt(null, ["users:read"]);
    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("renders children when authenticated and no roles required", () => {
    renderAt(["movies:read"]);
    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });

  it("renders children when the user has a required role", () => {
    renderAt(["users:read"], ["users:read", "users:write"]);
    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });

  it("renders children for the wildcard role", () => {
    renderAt(["*"], ["users:write"]);
    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });

  it("shows access denied without the required role", () => {
    renderAt(["movies:read"], ["users:write"]);
    expect(screen.getByRole("alert")).toHaveTextContent("Acesso negado");
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao catálogo" })).toHaveAttribute("href", "/catalog");
  });
});
