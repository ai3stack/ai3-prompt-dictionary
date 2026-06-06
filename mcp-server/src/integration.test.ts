import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

function getJson<T>(result: unknown): T {
  const r = result as { content: Array<{ type: string; text: string }> };
  const parsed = JSON.parse(r.content[0]!.text) as { success: boolean; data?: T; error?: string };
  return parsed.data as T;
}

function getRaw(result: unknown): { success: boolean; data?: unknown; error?: string } {
  const r = result as { content: Array<{ type: string; text: string }> };
  return JSON.parse(r.content[0]!.text);
}

describe("MCP Integration Tests", () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"],
    });
    client = new Client({ name: "integration-test", version: "1.0.0" });
    await client.connect(transport);
  });

  afterAll(async () => {
    await client.close();
  });

  it("lists all 11 tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.length).toBe(11);
    const names = tools.map((t) => t.name).sort();
    expect(names).toContain("find_prompt_for_task");
    expect(names).toContain("search_prompts");
    expect(names).toContain("get_prompt");
    expect(names).toContain("list_categories");
    expect(names).toContain("random_prompt");
    expect(names).toContain("get_stats");
    expect(names).toContain("add_custom_prompt");
    expect(names).toContain("remove_custom_prompt");
    expect(names).toContain("add_bookmark");
    expect(names).toContain("remove_bookmark");
    expect(names).toContain("list_bookmarks");
  });

  it("find_prompt_for_task returns results", async () => {
    const result = await client.callTool({
      name: "find_prompt_for_task",
      arguments: { task: "weekly report" },
    });
    const parsed = getJson<{ matches: Array<{ id: string; name: string }> }>(result);
    expect(parsed.matches.length).toBeGreaterThan(0);
    expect(parsed.matches[0]!.name.toLowerCase()).toContain("weekly");
  });

  it("get_prompt returns full prompt content", async () => {
    const result = await client.callTool({
      name: "get_prompt",
      arguments: { id: "AI³-00001" },
    });
    const raw = getRaw(result);
    expect(raw.success).toBe(true);
    const prompt = raw.data as Record<string, unknown>;
    expect(prompt.id).toBe("AI³-00001");
    expect(prompt.name).toBe("Weekly Report");
  });

  it("get_prompt returns error for unknown ID", async () => {
    const result = await client.callTool({
      name: "get_prompt",
      arguments: { id: "AI³-99999" },
    });
    const raw = getRaw(result);
    expect(raw.success).toBe(false);
    expect(raw.error).toContain("not found");
  });

  it("search_prompts filters by category", async () => {
    const result = await client.callTool({
      name: "search_prompts",
      arguments: { category_code: "01-01" },
    });
    const parsed = getJson<{ total_in_pool: number; results: unknown[] }>(result);
    expect(parsed.total_in_pool).toBeGreaterThan(0);
    expect(parsed.results.length).toBeGreaterThan(0);
  });

  it("search_prompts filters by role_keyword", async () => {
    const result = await client.callTool({
      name: "search_prompts",
      arguments: { role_keyword: "OKR" },
    });
    const parsed = getJson<{ results: unknown[] }>(result);
    expect(parsed.results.length).toBeGreaterThan(0);
  });

  it("list_categories returns all categories", async () => {
    const result = await client.callTool({
      name: "list_categories",
      arguments: {},
    });
    const parsed = getJson<{ total_categories: number; total_prompts: number }>(result);
    expect(parsed.total_categories).toBeGreaterThan(0);
    expect(parsed.total_prompts).toBeGreaterThan(900);
  });

  it("random_prompt returns a prompt", async () => {
    const result = await client.callTool({
      name: "random_prompt",
      arguments: {},
    });
    const parsed = getJson<{ id: string; name: string }>(result);
    expect(parsed.id).toMatch(/^AI³-\d+$/);
    expect(parsed.name).toBeTruthy();
  });

  it("random_prompt filters by section", async () => {
    const result = await client.callTool({
      name: "random_prompt",
      arguments: { section_code: "01" },
    });
    const parsed = getJson<{ id: string }>(result);
    expect(parsed.id).toBeTruthy();
  });

  it("get_stats returns catalog statistics", async () => {
    const result = await client.callTool({
      name: "get_stats",
      arguments: {},
    });
    const parsed = getJson<{
      version: string;
      total_prompts: number;
      built_in_prompts: number;
      sections: Record<string, unknown>;
    }>(result);
    expect(parsed.version).toBe("0.2.0");
    expect(parsed.total_prompts).toBeGreaterThan(900);
    expect(parsed.built_in_prompts).toBeGreaterThan(900);
    expect(parsed.sections).toBeDefined();
  });

  it("bookmark workflow: add → list → remove", async () => {
    await client.callTool({
      name: "remove_bookmark",
      arguments: { id: "AI³-00001" },
    });

    const addResult = await client.callTool({
      name: "add_bookmark",
      arguments: { id: "AI³-00001", note: "integration test" },
    });
    const addRaw = getRaw(addResult);
    expect(addRaw.success).toBe(true);

    const listResult = await client.callTool({
      name: "list_bookmarks",
      arguments: {},
    });
    const listParsed = getJson<{ count: number }>(listResult);
    expect(listParsed.count).toBeGreaterThan(0);

    const removeResult = await client.callTool({
      name: "remove_bookmark",
      arguments: { id: "AI³-00001" },
    });
    const removeRaw = getRaw(removeResult);
    expect(removeRaw.success).toBe(true);
  });
});
