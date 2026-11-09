import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovieCard } from "./MovieCard";
import type { MovieSummary } from "@/api/types";

const movie: MovieSummary = {
  id: "1",
  title: "The Matrix",
  year: "1999",
  poster: "https://example.com/1.jpg",
  imdbRating: 8.7,
};

describe("MovieCard", () => {
  it("renders poster with alt text and title", () => {
    render(<MovieCard movie={movie} onSelect={() => {}} />);
    expect(screen.getByAltText("Poster de The Matrix")).toHaveAttribute("src", movie.poster);
    expect(screen.getByText("The Matrix")).toBeInTheDocument();
  });

  it("renders placeholder when poster is empty", () => {
    render(<MovieCard movie={{ ...movie, poster: "" }} onSelect={() => {}} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Sem poster")).toBeInTheDocument();
  });

  it("rejects non-http poster URLs", () => {
    render(<MovieCard movie={{ ...movie, poster: "javascript:alert(1)" }} onSelect={() => {}} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Sem poster")).toBeInTheDocument();
  });

  it("calls onSelect with the movie on click", async () => {
    const onSelect = vi.fn();
    render(<MovieCard movie={movie} onSelect={onSelect} />);
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(movie);
  });
});
