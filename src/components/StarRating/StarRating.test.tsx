import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StarRating } from "./StarRating";

describe("StarRating", () => {
  it("renders 10 radios in a labelled group with none checked by default", () => {
    render(<StarRating value={null} onChange={() => {}} />);
    expect(screen.getByRole("radiogroup", { name: "Nota do filme" })).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(10);
    radios.forEach((r) => expect(r).toHaveAttribute("aria-checked", "false"));
  });

  it("marks only the selected value as checked", () => {
    render(<StarRating value={7} onChange={() => {}} />);
    expect(screen.getByRole("radio", { name: "7 estrelas" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "6 estrelas" })).toHaveAttribute("aria-checked", "false");
  });

  it("uses singular label for 1 star", () => {
    render(<StarRating value={null} onChange={() => {}} />);
    expect(screen.getByRole("radio", { name: "1 estrela" })).toBeInTheDocument();
  });

  it("calls onChange on click", async () => {
    const onChange = vi.fn();
    render(<StarRating value={null} onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole("radio", { name: "4 estrelas" }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("supports arrow key navigation clamped to 1..10", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<StarRating value={5} onChange={onChange} />);
    screen.getByRole("radio", { name: "5 estrelas" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith(6);
    // Controlled component: focus moved to star 6, so ArrowLeft goes back to 5.
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(screen.getByRole("radio", { name: "5 estrelas" })).toHaveFocus();

    rerender(<StarRating value={5} onChange={onChange} />);
    screen.getByRole("radio", { name: "5 estrelas" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith(4);

    rerender(<StarRating value={10} onChange={onChange} />);
    screen.getByRole("radio", { name: "10 estrelas" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith(10);

    rerender(<StarRating value={1} onChange={onChange} />);
    screen.getByRole("radio", { name: "1 estrela" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenLastCalledWith(1);
  });
});
