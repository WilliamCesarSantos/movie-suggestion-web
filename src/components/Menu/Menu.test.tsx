import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Menu } from "./Menu";
import { storage } from "@/lib/storage";

function renderMenu(roles: string[]) {
  storage.setToken("t");
  storage.setRoles(roles);
  return render(
    <MemoryRouter>
      <Menu />
    </MemoryRouter>
  );
}

async function open() {
  await userEvent.setup().click(screen.getByRole("button", { name: "Menu" }));
}

describe("Menu role matrix", () => {
  it("renders nothing without any relevant role", () => {
    renderMenu(["movies:read", "movies-watch:write"]);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("wildcard shows Usuários and Importar", async () => {
    renderMenu(["*"]);
    await open();
    expect(screen.getByRole("link", { name: "Usuários" })).toHaveAttribute("href", "/users");
    expect(screen.getByRole("link", { name: "Importar" })).toBeInTheDocument();
    for (const name of ["Listar", "Cadastrar", "Editar"]) {
      expect(screen.queryByRole("link", { name })).not.toBeInTheDocument();
    }
  });

  it.each([["users:read"], ["users:write"]])("%s shows only Usuários", async (role) => {
    renderMenu([role]);
    await open();
    expect(screen.getByRole("link", { name: "Usuários" })).toHaveAttribute("href", "/users");
    expect(screen.queryByRole("link", { name: "Importar" })).not.toBeInTheDocument();
  });

  it("movies:write shows only Importar", async () => {
    renderMenu(["movies:write"]);
    await open();
    expect(screen.getByRole("link", { name: "Importar" })).toHaveAttribute("href", "/movies-import");
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
  });

  it("toggles aria-expanded and closes on Escape returning focus to the button", async () => {
    renderMenu(["*"]);
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("closes when clicking outside", async () => {
    renderMenu(["*"]);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(document.body);
    expect(screen.queryByRole("link", { name: "Usuários" })).not.toBeInTheDocument();
  });
});
