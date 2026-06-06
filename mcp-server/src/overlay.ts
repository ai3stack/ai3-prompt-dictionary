import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import type { Prompt } from "./types.js";

interface OverlayFile {
  version: 1;
  prompts: Prompt[];
}

function getOverlayPath(): string {
  const xdg = process.env["XDG_CONFIG_HOME"];
  const base =
    xdg ??
    (platform() === "win32"
      ? (process.env["APPDATA"] ?? join(homedir(), "AppData", "Roaming"))
      : join(homedir(), ".config"));
  return join(base, "ai3-prompts-mcp", "custom-prompts.json");
}

function ensureOverlay(): OverlayFile {
  const path = getOverlayPath();
  if (!existsSync(path)) {
    mkdirSync(join(path, ".."), { recursive: true });
    const empty: OverlayFile = { version: 1, prompts: [] };
    writeFileSync(path, JSON.stringify(empty, null, 2), "utf-8");
    return empty;
  }
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as OverlayFile;
  } catch {
    return { version: 1, prompts: [] };
  }
}

function save(data: OverlayFile): void {
  const path = getOverlayPath();
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

export function loadCustomPrompts(): Prompt[] {
  return ensureOverlay().prompts;
}

export function addCustomPrompt(prompt: Prompt): { added: boolean; reason?: string } {
  const data = ensureOverlay();
  if (data.prompts.some((p) => p.id === prompt.id)) {
    return { added: false, reason: "prompt with this ID already exists" };
  }
  data.prompts.push(prompt);
  save(data);
  return { added: true };
}

export function removeCustomPrompt(id: string): { removed: boolean } {
  const data = ensureOverlay();
  const before = data.prompts.length;
  data.prompts = data.prompts.filter((p) => p.id !== id);
  if (data.prompts.length === before) {
    return { removed: false };
  }
  save(data);
  return { removed: true };
}
