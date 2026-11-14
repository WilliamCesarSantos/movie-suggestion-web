import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("shows the current page and total", () => {
    render(<Pagination page={2} totalPages={5} onChange={() => {}} />);
    expect(screen.getByRole("navigation", { name: "Paginação de usuários" })).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 5")).toBeInTheDocument();
  });

  it("disables Anterior on the first page", () => {
    render(<Pagination page={1} totalPages={3} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /Anterior/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Próxima/ })).toBeEnabled();
  });

  it("disables Próxima on the last page", () => {
    render(<Pagination page={3} totalPages={3} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /Próxima/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Anterior/ })).toBeEnabled();
  });

  it("calls onChange with the previous and next page", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination page={2} totalPages={3} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: /Próxima/ }));
    await user.click(screen.getByRole("button", { name: /Anterior/ }));
    expect(onChange).toHaveBeenNthCalledWith(1, 3);
    expect(onChange).toHaveBeenNthCalledWith(2, 1);
  });

  it("disables both buttons when disabled", () => {
    render(<Pagination page={2} totalPages={3} disabled onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /Anterior/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Próxima/ })).toBeDisabled();
  });
});
