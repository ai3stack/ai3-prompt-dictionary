import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";

interface BookmarkFile {
  version: 1;
  bookmarks: Array<{
    id: string;
    note?: string;
    added_at: string;
  }>;
}

function getStorePath(): string {
  const xdg = process.env["XDG_DATA_HOME"];
  const base =
    xdg ??
    (platform() === "win32"
      ? (process.env["APPDATA"] ?? join(homedir(), "AppData", "Roaming"))
      : join(homedir(), ".local", "share"));
  return join(base, "ai3-prompts-mcp", "bookmarks.json");
}

function ensureStore(): BookmarkFile {
  const path = getStorePath();
  if (!existsSync(path)) {
    mkdirSync(join(path, ".."), { recursive: true });
    const empty: BookmarkFile = { version: 1, bookmarks: [] };
    writeFileSync(path, JSON.stringify(empty, null, 2), "utf-8");
    return empty;
  }
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as BookmarkFile;
  } catch {
    return { version: 1, bookmarks: [] };
  }
}

function save(data: BookmarkFile): void {
  const path = getStorePath();
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

export function listBookmarks(): BookmarkFile["bookmarks"] {
  return ensureStore().bookmarks;
}

export function addBookmark(id: string, note?: string): { added: boolean; reason?: string } {
  const data = ensureStore();
  if (data.bookmarks.some((b) => b.id === id)) {
    return { added: false, reason: "already bookmarked" };
  }
  data.bookmarks.push({
    id,
    ...(note !== undefined && { note }),
    added_at: new Date().toISOString(),
  });
  save(data);
  return { added: true };
}

export function removeBookmark(id: string): { removed: boolean } {
  const data = ensureStore();
  const before = data.bookmarks.length;
  data.bookmarks = data.bookmarks.filter((b) => b.id !== id);
  if (data.bookmarks.length === before) {
    return { removed: false };
  }
  save(data);
  return { removed: true };
}
