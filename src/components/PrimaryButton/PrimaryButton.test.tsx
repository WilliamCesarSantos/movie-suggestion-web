import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrimaryButton } from "./PrimaryButton";

describe("PrimaryButton", () => {
  it("renders its children as the label when idle", () => {
    render(<PrimaryButton>Entrar</PrimaryButton>);
    expect(
      screen.getByRole("button", { name: "Entrar" })
    ).toBeInTheDocument();
  });

  it("defaults to type='button' when no type is provided", () => {
    render(<PrimaryButton>Entrar</PrimaryButton>);
    expect(screen.getByRole("button", { name: "Entrar" })).toHaveAttribute(
      "type",
      "button"
    );
  });

  it("honors a custom type like submit", () => {
    render(<PrimaryButton type="submit">Entrar</PrimaryButton>);
    expect(screen.getByRole("button", { name: "Entrar" })).toHaveAttribute(
      "type",
      "submit"
    );
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<PrimaryButton onClick={onClick}>Entrar</PrimaryButton>);
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and non-clickable when `disabled` is true", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <PrimaryButton disabled onClick={onClick}>
        Entrar
      </PrimaryButton>
    );
    const btn = screen.getByRole("button", { name: "Entrar" });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows the loadingLabel and aria-busy while loading", () => {
    render(
      <PrimaryButton isLoading loadingLabel="Entrando...">
        Entrar
      </PrimaryButton>
    );
    const btn = screen.getByRole("button", { name: /entrando/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toBeDisabled();
  });

  it("falls back to children as the loading label when loadingLabel is absent", () => {
    render(<PrimaryButton isLoading>Entrar</PrimaryButton>);
    const btn = screen.getByRole("button", { name: "Entrar" });
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toBeDisabled();
  });

  it("does not expose aria-busy when not loading", () => {
    render(<PrimaryButton>Entrar</PrimaryButton>);
    const btn = screen.getByRole("button", { name: "Entrar" });
    expect(btn).not.toHaveAttribute("aria-busy");
  });
});
