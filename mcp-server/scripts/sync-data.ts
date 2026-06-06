/**
 * Sync prompt data from upstream ai-prompt-dictionary repo into bundled data/.
 * Run before publishing or after upstream data changes.
 *
 * Reads:  ../ai-prompt-dictionary/content/en-US/prompts/*.json
 * Writes: ./data/prompts-en-US.json
 *         ./data/categories-en-US.json
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..");
const UPSTREAM = resolve(ROOT, "..", "ai-prompt-dictionary", "content");
const OUT = join(ROOT, "data");

const LOCALES = [{ src: "en-US", outSuffix: "en-US" }];

function syncLocale(srcLocale: string, outSuffix: string): void {
  const promptsDir = join(UPSTREAM, srcLocale, "prompts");
  if (!existsSync(promptsDir)) {
    throw new Error(
      `sync-data: upstream source not found for ${srcLocale}: ${promptsDir}. ` +
        `Run sync-data only where the upstream content dir is present; ` +
        `otherwise publish uses the committed data/*.json (source of truth).`
    );
  }
  const files = readdirSync(promptsDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const allPrompts: unknown[] = [];
  for (const f of files) {
    const arr = JSON.parse(readFileSync(join(promptsDir, f), "utf-8"));
    if (Array.isArray(arr)) allPrompts.push(...arr);
  }

  const categoriesPath = join(UPSTREAM, srcLocale, "categories.json");
  const categories = existsSync(categoriesPath)
    ? JSON.parse(readFileSync(categoriesPath, "utf-8"))
    : [];

  mkdirSync(OUT, { recursive: true });
  writeFileSync(
    join(OUT, `prompts-${outSuffix}.json`),
    JSON.stringify(allPrompts),
    "utf-8"
  );
  writeFileSync(
    join(OUT, `categories-${outSuffix}.json`),
    JSON.stringify(categories),
    "utf-8"
  );

  console.log(
    `Synced ${srcLocale}: ${allPrompts.length} prompts, ${
      Array.isArray(categories) ? categories.length : 0
    } categories`
  );
}

for (const { src, outSuffix } of LOCALES) {
  syncLocale(src, outSuffix);
}
