import { describe, it, expect } from "vitest";
import { loadPrompts, loadCategories, getPromptById } from "./data.js";

describe("loadPrompts", () => {
  it("loads English prompts", () => {
    const prompts = loadPrompts();
    expect(prompts.length).toBeGreaterThan(900);
    expect(prompts[0]!.id).toBe("AI³-00001");
    expect(prompts[0]!.name).toBe("Weekly Report");
  });

  it("returns cached data on second call", () => {
    const first = loadPrompts();
    const second = loadPrompts();
    expect(first).toBe(second);
  });
});

describe("loadCategories", () => {
  it("loads English categories", () => {
    const cats = loadCategories();
    expect(cats.length).toBeGreaterThan(0);
    expect(cats[0]!.section_code).toBe("01");
    expect(cats[0]!.category_code).toBe("01-01");
    expect(cats[0]!.section_name).toBe("Core & General");
  });
});

describe("getPromptById", () => {
  it("finds a prompt by ID", () => {
    const p = getPromptById("AI³-00001");
    expect(p).toBeDefined();
    expect(p!.name).toBe("Weekly Report");
    expect(p!.ai_instructions.role).toBeTruthy();
  });

  it("returns undefined for unknown ID", () => {
    const p = getPromptById("AI³-99999");
    expect(p).toBeUndefined();
  });
});
