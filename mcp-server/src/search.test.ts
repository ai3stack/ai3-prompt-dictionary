import { describe, it, expect, afterEach } from "vitest";
import { tokenize, search, filterPrompts, clearSearchCache } from "./search.js";

describe("tokenize", () => {
  it("tokenizes English text", () => {
    const tokens = tokenize("weekly report");
    expect(tokens).toContain("weekly");
    expect(tokens).toContain("report");
  });

  it("filters out single Latin characters", () => {
    const tokens = tokenize("a b c report");
    expect(tokens).not.toContain("a");
    expect(tokens).not.toContain("b");
    expect(tokens).toContain("report");
  });

  it("returns empty for whitespace-only input", () => {
    const tokens = tokenize("   ");
    expect(tokens).toEqual([]);
  });

  it("handles punctuation", () => {
    const tokens = tokenize("code-review, testing; deployment");
    expect(tokens).toContain("code");
    expect(tokens).toContain("review");
    expect(tokens).toContain("testing");
    expect(tokens).toContain("deployment");
  });
});

describe("search (BM25)", () => {
  afterEach(() => {
    clearSearchCache();
  });

  it("finds 'weekly report'", () => {
    const results = search("weekly report", 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.prompt.name.toLowerCase()).toContain("weekly");
    expect(results[0]!.score).toBeGreaterThan(0);
  });

  it("returns empty for nonsense query", () => {
    const results = search("xyzzy12345nonexistent", 5);
    expect(results.length).toBe(0);
  });

  it("respects limit parameter", () => {
    const results = search("report", 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("scores are sorted descending", () => {
    const results = search("report", 10);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
    }
  });
});

describe("filterPrompts", () => {
  it("filters by category_code", () => {
    const results = filterPrompts("01-01");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.category_code === "01-01")).toBe(true);
  });

  it("filters by role_keyword", () => {
    const results = filterPrompts(undefined, "OKR");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.ai_instructions.role.toLowerCase().includes("okr"))).toBe(true);
  });

  it("returns all when no filters", () => {
    const results = filterPrompts();
    expect(results.length).toBeGreaterThan(900);
  });
});
