import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("renders label associated with its input", () => {
    render(<TextField label="Email" name="email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("uses a provided id when passed", () => {
    render(<TextField label="Email" id="custom-id" name="email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "custom-id");
  });

  it("generates a stable id so label and input stay linked without explicit id", () => {
    render(<TextField label="Senha" name="password" />);
    const input = screen.getByLabelText("Senha");
    expect(input.getAttribute("id")).toBeTruthy();
  });

  it("forwards the ref to the input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField label="Email" name="email" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("calls onChange when the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextField label="Email" name="email" onChange={onChange} />);
    await user.type(screen.getByLabelText("Email"), "a");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders the error message and marks the input as invalid", () => {
    render(
      <TextField
        label="Email"
        name="email"
        error="Email inválido"
        id="email"
      />
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-error");
    expect(screen.getByText("Email inválido")).toBeInTheDocument();
  });

  it("renders the hint when there is no error", () => {
    render(
      <TextField
        label="Email"
        name="email"
        hint="Usaremos para contato"
        id="email"
      />
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-describedby", "email-hint");
    expect(screen.getByText("Usaremos para contato")).toBeInTheDocument();
  });

  it("prefers error over hint when both are provided", () => {
    render(
      <TextField
        label="Email"
        name="email"
        hint="Usaremos para contato"
        error="Email inválido"
      />
    );
    expect(screen.getByText("Email inválido")).toBeInTheDocument();
    expect(screen.queryByText("Usaremos para contato")).not.toBeInTheDocument();
  });

  it("forwards html input attributes like type and readOnly", () => {
    render(
      <TextField label="Senha" name="password" type="password" readOnly value="x" />
    );
    const input = screen.getByLabelText("Senha") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("readonly");
  });
});
