import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { addCustomPrompt, loadCustomPrompts, removeCustomPrompt } from "./overlay.js";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Prompt } from "./types.js";

const TEST_DIR = join(tmpdir(), "ai3-test-overlay");

const originalXdg = process.env["XDG_CONFIG_HOME"];

beforeEach(() => {
  process.env["XDG_CONFIG_HOME"] = TEST_DIR;
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  if (originalXdg) {
    process.env["XDG_CONFIG_HOME"] = originalXdg;
  } else {
    delete process.env["XDG_CONFIG_HOME"];
  }
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

const samplePrompt: Prompt = {
  id: "CUSTOM-001",
  name: "Test Prompt",
  input_section: "Describe...",
  ai_instructions: {
    role: "Test Role",
    task: "Test Task",
  },
  version: "V1.0",
  section_code: "99",
  section_name: "Custom",
  category_code: "custom",
  category_path: "99-custom",
};

describe("overlay", () => {
  it("starts with empty custom prompts", () => {
    const list = loadCustomPrompts();
    expect(list).toEqual([]);
  });

  it("adds a custom prompt", () => {
    const result = addCustomPrompt(samplePrompt);
    expect(result.added).toBe(true);
    const list = loadCustomPrompts();
    expect(list).toHaveLength(1);
    expect(list[0]!.id).toBe("CUSTOM-001");
  });

  it("prevents duplicate custom prompt IDs", () => {
    addCustomPrompt(samplePrompt);
    const result = addCustomPrompt(samplePrompt);
    expect(result.added).toBe(false);
    expect(result.reason).toBe("prompt with this ID already exists");
  });

  it("removes a custom prompt", () => {
    addCustomPrompt(samplePrompt);
    const result = removeCustomPrompt("CUSTOM-001");
    expect(result.removed).toBe(true);
    expect(loadCustomPrompts()).toHaveLength(0);
  });

  it("handles removing non-existent custom prompt", () => {
    const result = removeCustomPrompt("NONEXISTENT");
    expect(result.removed).toBe(false);
  });
});
