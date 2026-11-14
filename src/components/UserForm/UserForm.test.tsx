import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserForm } from "./UserForm";

type Props = React.ComponentProps<typeof UserForm>;

function renderForm(props: Props) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/form"]}>
        <Routes>
          <Route path="/form" element={<UserForm {...props} />} />
          <Route path="/users" element={<p>LISTA</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const initial = { name: "Ana", email: "ana@example.com", roles: ["movies:read"] };

afterEach(() => vi.restoreAllMocks());

describe("UserForm (create)", () => {
  it("renders with the default role movies:read checked", () => {
    renderForm({ mode: "create" });
    expect(screen.getByLabelText("Nome *")).toBeEnabled();
    expect(screen.getByLabelText("E-mail *")).toBeEnabled();
    expect(screen.getByRole("checkbox", { name: "movies:read" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "users:write" })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Cadastrar" })).toBeEnabled();
  });

  it("shows validation errors and focuses the first invalid field", async () => {
    const user = userEvent.setup();
    renderForm({ mode: "create" });
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(screen.getByText("O nome é obrigatório.")).toBeInTheDocument();
    expect(screen.getByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(screen.getByText("A senha deve ter no mínimo 6 caracteres.")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome *")).toHaveFocus();
    expect(screen.getByLabelText("Nome *")).toHaveAttribute("aria-invalid", "true");
  });

  it("requires at least one role", async () => {
    const user = userEvent.setup();
    renderForm({ mode: "create" });
    await user.type(screen.getByLabelText("Nome *"), "Bia");
    await user.type(screen.getByLabelText("E-mail *"), "bia@example.com");
    await user.type(screen.getByLabelText(/^Senha/), "secret1");
    await user.click(screen.getByRole("checkbox", { name: "movies:read" }));
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(screen.getByText("Selecione ao menos uma role.")).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderForm({ mode: "create" });
    const field = screen.getByLabelText(/^Senha/);
    expect(field).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "mostrar" }));
    expect(field).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "ocultar" })).toHaveAttribute("aria-pressed", "true");
  });

  it("Cancelar returns to the list without confirmation", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm");
    renderForm({ mode: "create" });
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(confirm).not.toHaveBeenCalled();
    expect(screen.getByText("LISTA")).toBeInTheDocument();
  });
});

describe("UserForm (edit)", () => {
  it("owner: name and password are editable, email is not", () => {
    renderForm({ mode: "edit", userId: "u1", initial, isOwner: true });
    expect(screen.getByLabelText("Nome")).toHaveValue("Ana");
    expect(screen.getByLabelText("Nome")).toBeEnabled();
    expect(screen.getByLabelText(/Nova senha/)).toBeEnabled();
    expect(screen.getByLabelText(/E-mail/)).toBeDisabled();
    expect(screen.getByLabelText(/E-mail/)).toHaveValue("ana@example.com");
  });

  it("non-owner: only roles are editable and an explanation is shown", () => {
    renderForm({ mode: "edit", userId: "u1", initial, isOwner: false });
    expect(screen.getByLabelText("Nome")).toBeDisabled();
    expect(screen.getByLabelText(/Nova senha/)).toBeDisabled();
    expect(screen.getByRole("button", { name: "mostrar" })).toBeDisabled();
    expect(screen.getByText(/Você pode alterar apenas as roles/)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "users:read" })).toBeEnabled();
  });

  it("Salvar is disabled until something changes", async () => {
    const user = userEvent.setup();
    renderForm({ mode: "edit", userId: "u1", initial, isOwner: false });
    const save = screen.getByRole("button", { name: "Salvar" });
    expect(save).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "users:read" }));
    expect(save).toBeEnabled();
    await user.click(screen.getByRole("checkbox", { name: "users:read" }));
    expect(save).toBeDisabled();
  });

  it("lists preserved special roles such as * and does not require another role", async () => {
    const user = userEvent.setup();
    renderForm({ mode: "edit", userId: "u1", initial: { ...initial, roles: ["*"] }, isOwner: false });
    expect(screen.getByText(/Roles especiais mantidas ao salvar: \*\./)).toBeInTheDocument();
    // Toggle a role on and off: no "at least one role" error since "*" is preserved.
    await user.click(screen.getByRole("checkbox", { name: "users:read" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.queryByText("Selecione ao menos uma role.")).not.toBeInTheDocument();
  });

  it("owner: rejects a new password shorter than 6 characters", async () => {
    const user = userEvent.setup();
    renderForm({ mode: "edit", userId: "u1", initial, isOwner: true });
    await user.type(screen.getByLabelText(/Nova senha/), "123");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.getByText("A senha deve ter no mínimo 6 caracteres.")).toBeInTheDocument();
  });

  it("asks for confirmation before discarding changes and stays when declined", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderForm({ mode: "edit", userId: "u1", initial, isOwner: false });
    await user.click(screen.getByRole("checkbox", { name: "users:write" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(confirm).toHaveBeenCalledWith("Descartar alterações?");
    expect(screen.queryByText("LISTA")).not.toBeInTheDocument();
  });

  it("leaves when the discard confirmation is accepted", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderForm({ mode: "edit", userId: "u1", initial, isOwner: false });
    await user.click(screen.getByRole("checkbox", { name: "users:write" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByText("LISTA")).toBeInTheDocument();
  });
});
