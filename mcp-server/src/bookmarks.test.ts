import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { addBookmark, removeBookmark, listBookmarks } from "./bookmarks.js";
import { mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const TEST_DIR = join(tmpdir(), "ai3-test-bookmarks");

const originalXdg = process.env["XDG_DATA_HOME"];

beforeEach(() => {
  process.env["XDG_DATA_HOME"] = TEST_DIR;
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  if (originalXdg) {
    process.env["XDG_DATA_HOME"] = originalXdg;
  } else {
    delete process.env["XDG_DATA_HOME"];
  }
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe("bookmarks", () => {
  it("starts with empty bookmarks", () => {
    const list = listBookmarks();
    expect(list).toEqual([]);
  });

  it("adds a bookmark", () => {
    const result = addBookmark("AI³-00001", "my favorite");
    expect(result.added).toBe(true);
    const list = listBookmarks();
    expect(list).toHaveLength(1);
    expect(list[0]!.id).toBe("AI³-00001");
    expect(list[0]!.note).toBe("my favorite");
  });

  it("prevents duplicate bookmarks", () => {
    addBookmark("AI³-00001");
    const result = addBookmark("AI³-00001");
    expect(result.added).toBe(false);
    expect(result.reason).toBe("already bookmarked");
  });

  it("removes a bookmark", () => {
    addBookmark("AI³-00001");
    const result = removeBookmark("AI³-00001");
    expect(result.removed).toBe(true);
    expect(listBookmarks()).toHaveLength(0);
  });

  it("handles removing non-existent bookmark", () => {
    const result = removeBookmark("AI³-99999");
    expect(result.removed).toBe(false);
  });

  it("persists bookmarks across calls", () => {
    addBookmark("AI³-00001", "note1");
    addBookmark("AI³-00002", "note2");
    const list = listBookmarks();
    expect(list).toHaveLength(2);
    expect(list.map((b) => b.id)).toEqual(["AI³-00001", "AI³-00002"]);
  });
});
