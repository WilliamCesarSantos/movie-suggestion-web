import { describe, it, expect } from "vitest";
import { mapReaction, ratingLabel } from "./rating";

describe("mapReaction", () => {
  it.each([
    [1, "disliked"],
    [4, "disliked"],
    [5, "neutral"],
    [6, "neutral"],
    [7, "neutral"],
    [8, "liked"],
    [10, "liked"],
  ])("maps %i to %s", (rating, reaction) => {
    expect(mapReaction(rating)).toBe(reaction);
  });
});

describe("ratingLabel", () => {
  it("prompts when there is no rating", () => {
    expect(ratingLabel(null)).toBe("Toque numa estrela para avaliar");
    expect(ratingLabel(0)).toBe("Toque numa estrela para avaliar");
  });
  it("describes each band", () => {
    expect(ratingLabel(3)).toContain("disliked");
    expect(ratingLabel(6)).toContain("neutral");
    expect(ratingLabel(9)).toContain("liked");
  });
});
