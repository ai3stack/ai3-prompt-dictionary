import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { CategorySummary, Prompt } from "./types.js";
import { loadCustomPrompts } from "./overlay.js";

const here = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(here, "..", "data");

const PROMPTS_FILE = "prompts-en-US.json";
const CATEGORIES_FILE = "categories-en-US.json";

let promptCache: Prompt[] | undefined;
let categoryCache: CategorySummary[] | undefined;
let indexCache: Map<string, Prompt> | undefined;
let builtInCountCache: number | undefined;

function readJSON<T>(file: string): T {
  const path = join(DATA_DIR, file);
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

export function loadPrompts(): Prompt[] {
  if (!promptCache) {
    const builtIn = readJSON<Prompt[]>(PROMPTS_FILE);
    const custom = loadCustomPrompts();
    promptCache = [...builtIn, ...custom];
  }
  return promptCache;
}

export function loadCategories(): CategorySummary[] {
  if (!categoryCache) {
    categoryCache = readJSON<CategorySummary[]>(CATEGORIES_FILE);
  }
  return categoryCache;
}

export function getPromptById(id: string): Prompt | undefined {
  if (!indexCache) {
    indexCache = new Map(loadPrompts().map((p) => [p.id, p]));
  }
  return indexCache.get(id);
}

export function getBuiltInCount(): number {
  if (builtInCountCache === undefined) {
    builtInCountCache = readJSON<Prompt[]>(PROMPTS_FILE).length;
  }
  return builtInCountCache;
}

export function clearCache(): void {
  promptCache = undefined;
  categoryCache = undefined;
  indexCache = undefined;
  builtInCountCache = undefined;
}
