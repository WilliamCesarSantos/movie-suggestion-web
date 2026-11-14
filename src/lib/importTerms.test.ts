import { describe, it, expect } from "vitest";
import { IMPORT_MAX_PAGES, normalizeSearchTerms } from "./importTerms";

describe("normalizeSearchTerms", () => {
  it("trims each line", () => {
    expect(normalizeSearchTerms("  inception  \n\tmatrix\t")).toEqual(["inception", "matrix"]);
  });

  it("drops empty and whitespace-only lines", () => {
    expect(normalizeSearchTerms("a\n\n   \nb\n")).toEqual(["a", "b"]);
  });

  it("dedupes case-insensitively keeping the first occurrence and the order", () => {
    expect(normalizeSearchTerms("Inception\nMatrix\ninception\nMATRIX\nAlien")).toEqual([
      "Inception",
      "Matrix",
      "Alien",
    ]);
  });

  it("handles CRLF and CR line breaks", () => {
    expect(normalizeSearchTerms("a\r\nb\rc")).toEqual(["a", "b", "c"]);
  });

  it("returns an empty array for empty input", () => {
    expect(normalizeSearchTerms("")).toEqual([]);
  });

  it("exposes maxPages 5", () => {
    expect(IMPORT_MAX_PAGES).toBe(5);
  });
});
