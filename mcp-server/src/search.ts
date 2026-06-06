import { loadPrompts, clearCache as clearDataCache } from "./data.js";
import type { Prompt, ScoredPrompt } from "./types.js";

const AVG_FIELD_LEN = 80;
const K1 = 1.5;
const B = 0.75;

interface SearchEntry {
  prompt: Prompt;
  fields: Array<{ text: string; weight: number }>;
}

interface InvertedIndex {
  entries: SearchEntry[];
  posting: Map<string, Map<number, number>>;
  fieldLens: number[];
  avgLen: number;
  N: number;
}

let indexCache: InvertedIndex | undefined;

export function tokenize(s: string): string[] {
  const lower = s.toLowerCase();
  const latin = lower
    .split(/[\s,.;:!?[\]()\-—_/\\\n\t]+/)
    .filter((t) => t.length >= 2 && /[a-z0-9]/.test(t));

  return Array.from(new Set(latin));
}

function buildIndex(): InvertedIndex {
  const prompts = loadPrompts();
  const entries: SearchEntry[] = [];
  const posting = new Map<string, Map<number, number>>();
  let totalLen = 0;

  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i]!;
    const fields = [
      { text: p.name, weight: 5 },
      { text: p.ai_instructions.role, weight: 3 },
      { text: p.ai_instructions.task, weight: 3 },
      { text: p.section_name, weight: 1 },
      { text: (p.ai_instructions.framework ?? []).join(" "), weight: 1 },
      { text: p.ai_instructions.type ?? "", weight: 1 },
    ];
    entries.push({ prompt: p, fields });

    const docTokens = new Map<string, number>();
    for (const field of fields) {
      const ft = tokenize(field.text);
      for (const t of ft) {
        docTokens.set(t, (docTokens.get(t) ?? 0) + field.weight);
      }
      totalLen += ft.length;
    }

    for (const [token, weight] of docTokens) {
      let postingMap = posting.get(token);
      if (!postingMap) {
        postingMap = new Map();
        posting.set(token, postingMap);
      }
      postingMap.set(i, weight);
    }
  }

  const fieldLens = entries.map((e) =>
    e.fields.reduce((sum, f) => sum + tokenize(f.text).length, 0),
  );
  const avgLen = fieldLens.length > 0 ? totalLen / fieldLens.length : AVG_FIELD_LEN;

  return { entries, posting, fieldLens, avgLen, N: entries.length };
}

function getIndex(): InvertedIndex {
  if (!indexCache) {
    indexCache = buildIndex();
  }
  return indexCache;
}

function bm25(tf: number, df: number, dl: number, avgdl: number, N: number): number {
  const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
  const norm = (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * (dl / avgdl)));
  return idf * norm;
}

export function search(query: string, limit: number): ScoredPrompt[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const idx = getIndex();
  const scores = new Float64Array(idx.N);

  for (const token of tokens) {
    const postingMap = idx.posting.get(token);
    if (!postingMap) continue;
    const df = postingMap.size;
    for (const [docId, tf] of postingMap) {
      const current = scores[docId] ?? 0;
      scores[docId] = current + bm25(tf, df, idx.fieldLens[docId]!, idx.avgLen, idx.N);
    }
  }

  const results: ScoredPrompt[] = [];
  for (let i = 0; i < idx.N; i++) {
    if (scores[i]! > 0) {
      results.push({ prompt: idx.entries[i]!.prompt, score: Math.round(scores[i]! * 100) / 100 });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

export function filterPrompts(categoryCode?: string, roleKeyword?: string): Prompt[] {
  let pool = loadPrompts();
  if (categoryCode) {
    pool = pool.filter((p) => p.category_code === categoryCode);
  }
  if (roleKeyword) {
    const k = roleKeyword.toLowerCase();
    pool = pool.filter((p) => p.ai_instructions.role.toLowerCase().includes(k));
  }
  return pool;
}

export function clearSearchCache(): void {
  indexCache = undefined;
}

export function clearAllCache(): void {
  clearDataCache();
  indexCache = undefined;
}
