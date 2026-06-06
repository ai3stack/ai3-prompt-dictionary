import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getPromptById, getBuiltInCount, loadCategories, loadPrompts } from "./data.js";
import { addBookmark, listBookmarks, removeBookmark } from "./bookmarks.js";
import { addCustomPrompt, loadCustomPrompts, removeCustomPrompt } from "./overlay.js";
import { search, filterPrompts, clearAllCache } from "./search.js";
import { ok, fail, validatePromptId, sanitizeString } from "./api.js";
import type { Prompt } from "./types.js";
import { VERSION } from "./version.js";

function summarize(p: Prompt) {
  return {
    id: p.id,
    name: p.name,
    section: p.section_name,
    role: p.ai_instructions.role,
    task: p.ai_instructions.task,
  };
}

function asText(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

export interface RegisterToolsOptions {
  /**
   * When true, the write tools (add_custom_prompt, remove_custom_prompt,
   * add_bookmark, remove_bookmark) are NOT registered/advertised/callable.
   * Read tools remain available. Defaults to false.
   */
  readonly?: boolean;
}

export function registerTools(server: McpServer, options: RegisterToolsOptions = {}): void {
  const readonly = options.readonly === true;
  server.tool(
    "find_prompt_for_task",
    "Find the best AI prompts for a specific task the user wants help with. " +
      "Use this when the user describes work they want to do " +
      "(e.g. 'write a weekly report', 'review this contract', 'translate code comments') " +
      "and you want to apply a proven prompt template instead of writing one from scratch. " +
      "Searches 930+ expert-curated prompts using BM25 ranking and returns the top 5 matches. " +
      "After picking one, call get_prompt to retrieve the full template.",
    {
      task: z
        .string()
        .describe(
          "Natural language description of what the user wants to do. " +
            "Examples: 'write a weekly report', 'analyze a competitor', 'plan a trip'.",
        ),
    },
    async ({ task }) => {
      const matches = search(task, 5);
      if (matches.length === 0) {
        return asText(
          ok({
            message: "No prompts matched. Try simpler keywords or call list_categories to browse.",
            query: task,
          }),
        );
      }
      return asText(
        ok({
          query: task,
          matches: matches.map((m) => ({
            ...summarize(m.prompt),
            score: m.score,
          })),
          next_step: "Call get_prompt with the chosen `id` to retrieve the full prompt template.",
        }),
      );
    },
  );

  server.tool(
    "search_prompts",
    "Search the 930-prompt catalog by keyword, category, or role. " +
      "Use when the user wants to browse or filter, rather than execute one specific task. " +
      "Uses BM25 ranking for keyword search. Returns up to 20 results.",
    {
      query: z.string().optional().describe("Free-text keyword filter (BM25 ranked)."),
      category_code: z
        .string()
        .optional()
        .describe("Filter by category, e.g. '01-01'. Get codes via list_categories."),
      role_keyword: z
        .string()
        .optional()
        .describe("Filter by role substring, e.g. 'Marketing' or 'Engineer'."),
      limit: z.number().int().min(1).max(50).default(20).optional(),
    },
    async ({ query, category_code, role_keyword, limit = 20 }) => {
      let pool = filterPrompts(category_code, role_keyword);
      let result: Prompt[];
      if (query) {
        const scored = search(query, limit);
        const poolSet = new Set(pool.map((p) => p.id));
        result = scored.filter((s) => poolSet.has(s.prompt.id)).map((s) => s.prompt);
      } else {
        result = pool.slice(0, limit);
      }
      return asText(
        ok({
          total_in_pool: pool.length,
          returned: result.length,
          results: result.map(summarize),
        }),
      );
    },
  );

  server.tool(
    "get_prompt",
    "Retrieve a specific prompt's full content (role, task, framework, style, all fields) by ID. " +
      "Call this after find_prompt_for_task or search_prompts to get the actual template to use.",
    {
      id: z.string().optional().describe("Prompt ID like 'AI³-00001'."),
    },
    async ({ id }) => {
      if (!id) {
        return asText(fail("Missing required parameter: id"));
      }
      const validation = validatePromptId(id);
      if (validation) {
        return asText(fail(validation));
      }
      const prompt = getPromptById(id);
      if (!prompt) {
        return asText(fail(`Prompt not found: ${id}`));
      }
      return asText(ok(prompt));
    },
  );

  server.tool(
    "list_categories",
    "Show all 47 prompt categories grouped by 4 sections, with prompt counts. " +
      "Use when the user wants to browse rather than search, or wants to see what kinds of prompts exist.",
    {},
    async () => {
      const cats = loadCategories();
      return asText(
        ok({
          total_categories: cats.length,
          total_prompts: cats.reduce((sum, c) => sum + c.prompt_count, 0),
          categories: cats.map((c) => ({
            section_code: c.section_code,
            section_name: c.section_name,
            category_code: c.category_code,
            category_path: c.category_path,
            prompt_count: c.prompt_count,
          })),
          next_step: "Use search_prompts with category_code to see all prompts inside a category.",
        }),
      );
    },
  );

  server.tool(
    "random_prompt",
    "Get a random prompt suggestion from the catalog. " +
      "Use when the user wants inspiration, is unsure what they need, or wants to discover new prompts. " +
      "Can optionally filter by category or section.",
    {
      category_code: z.string().optional().describe("Optional category filter, e.g. '01-01'."),
      section_code: z.string().optional().describe("Optional section filter, e.g. '01'."),
    },
    async ({ category_code, section_code }) => {
      let pool = loadPrompts();
      if (category_code) {
        pool = pool.filter((p) => p.category_code === category_code);
      }
      if (section_code) {
        pool = pool.filter((p) => p.section_code === section_code);
      }
      if (pool.length === 0) {
        return asText(ok({ message: "No prompts found for the given filters." }));
      }
      const idx = Math.floor(Math.random() * pool.length);
      const picked = pool[idx]!;
      return asText(
        ok({
          ...summarize(picked),
          framework: picked.ai_instructions.framework,
          style: picked.ai_instructions.style,
          next_step: "Call get_prompt with the `id` to retrieve the full prompt template.",
        }),
      );
    },
  );

  server.tool(
    "get_stats",
    "Get statistics about the prompt catalog: total counts, section breakdown, version info. " +
      "Use when the user wants to understand the scope and coverage of available prompts.",
    {},
    async () => {
      const prompts = loadPrompts();
      const categories = loadCategories();
      const customCount = loadCustomPrompts().length;
      const builtInCount = getBuiltInCount();
      const sectionMap = new Map<string, { name: string; count: number }>();
      for (const p of prompts) {
        const existing = sectionMap.get(p.section_code);
        if (existing) {
          existing.count++;
        } else {
          sectionMap.set(p.section_code, { name: p.section_name, count: 1 });
        }
      }
      return asText(
        ok({
          version: VERSION,
          total_prompts: prompts.length,
          built_in_prompts: builtInCount,
          custom_prompts: customCount,
          total_categories: categories.length,
          sections: Object.fromEntries(sectionMap),
        }),
      );
    },
  );

  if (!readonly) {
    server.tool(
      "add_custom_prompt",
      "Add a user-defined custom prompt to the local overlay. " +
        "Custom prompts appear in search results alongside built-in ones. " +
        "Stored locally on the user's machine, never synced.",
      {
        id: z.string().describe("Unique ID for the custom prompt, e.g. 'CUSTOM-001'."),
        name: z.string().describe("Short name for the prompt."),
        role: z.string().describe("The AI role, e.g. 'Senior Marketing Strategist'."),
        task: z.string().describe("What the prompt should accomplish."),
        framework: z.array(z.string()).optional().describe("Step-by-step framework items."),
        style: z.string().optional().describe("Output style, e.g. 'Professional, structured'."),
        section_name: z
          .string()
          .optional()
          .default("Custom")
          .describe("Section name for grouping."),
        category_code: z
          .string()
          .optional()
          .default("custom")
          .describe("Category code for grouping."),
      },
      async ({ id, name, role, task, framework, style, section_name, category_code }) => {
        const validation = validatePromptId(id);
        if (validation) {
          return asText(fail(validation));
        }
        const prompt: Prompt = {
          id,
          name: sanitizeString(name, 200),
          input_section: "Describe your requirements and context...",
          ai_instructions: {
            role: sanitizeString(role, 500),
            task: sanitizeString(task, 1000),
            ...(framework && { framework: framework.map((f) => sanitizeString(f, 500)) }),
            ...(style && { style: sanitizeString(style, 500) }),
          },
          version: "V1.0",
          section_code: "99",
          section_name: section_name ?? "Custom",
          category_code: category_code ?? "custom",
          category_path: "99-custom",
        };
        const result = addCustomPrompt(prompt);
        if (result.added) clearAllCache();
        return asText(result.added ? ok(result) : fail(result.reason ?? "Failed to add"));
      },
    );

    server.tool(
      "remove_custom_prompt",
      "Remove a user-defined custom prompt from the local overlay. " +
        "Built-in prompts cannot be removed.",
      {
        id: z.string().optional().describe("ID of the custom prompt to remove."),
      },
      async ({ id }) => {
        if (!id) {
          return asText(fail("Missing required parameter: id"));
        }
        const result = removeCustomPrompt(id);
        if (result.removed) {
          clearAllCache();
          return asText(ok({ removed: true }));
        }
        return asText(fail("Custom prompt not found"));
      },
    );

    server.tool(
      "add_bookmark",
      "Save a prompt to the user's local bookmark list for quick recall later. " +
        "Use when the user says they like a prompt, want to save it, or want to come back to it.",
      {
        id: z.string().optional().describe("Prompt ID like 'AI³-00001'."),
        note: z
          .string()
          .optional()
          .describe("Optional personal note about why this prompt is useful."),
      },
      async ({ id, note }) => {
        if (!id) {
          return asText(fail("Missing required parameter: id"));
        }
        const validation = validatePromptId(id);
        if (validation) {
          return asText(fail(validation));
        }
        const result = addBookmark(id, note ? sanitizeString(note, 500) : undefined);
        return asText(result.added ? ok(result) : fail(result.reason ?? "Already bookmarked"));
      },
    );

    server.tool(
      "remove_bookmark",
      "Remove a prompt from the user's bookmark list.",
      {
        id: z.string().optional().describe("Prompt ID to remove."),
      },
      async ({ id }) => {
        if (!id) {
          return asText(fail("Missing required parameter: id"));
        }
        const result = removeBookmark(id);
        return asText(result.removed ? ok({ removed: true }) : fail("Bookmark not found"));
      },
    );
  }

  server.tool(
    "list_bookmarks",
    "List all prompts the user has bookmarked, with optional note for each. " +
      "Use when the user asks for their saved/favorite prompts. " +
      "Bookmarks are stored locally on the user's machine, not synced to any server.",
    {},
    async () => {
      const bookmarks = listBookmarks();
      const enriched = bookmarks.map((b) => {
        const prompt = getPromptById(b.id);
        return {
          id: b.id,
          name: prompt?.name ?? "(prompt not found in current data)",
          role: prompt?.ai_instructions.role,
          note: b.note,
          added_at: b.added_at,
        };
      });
      return asText(ok({ count: enriched.length, bookmarks: enriched }));
    },
  );
}
