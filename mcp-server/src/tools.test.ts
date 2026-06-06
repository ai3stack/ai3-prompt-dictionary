import { describe, it, expect } from "vitest";
import { registerTools } from "./tools.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const WRITE_TOOLS = [
  "add_custom_prompt",
  "remove_custom_prompt",
  "add_bookmark",
  "remove_bookmark",
];

function registeredToolNames(server: McpServer): string[] {
  // McpServer keeps registered tools in an internal map; read it for assertions.
  const internal = server as unknown as { _registeredTools: Record<string, unknown> };
  return Object.keys(internal._registeredTools);
}

describe("registerTools", () => {
  it("registers all 11 tools without error", () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    expect(() => registerTools(server)).not.toThrow();
    expect(registeredToolNames(server)).toHaveLength(11);
  });

  it("registers write tools in default (read-write) mode", () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerTools(server);
    const names = registeredToolNames(server);
    for (const t of WRITE_TOOLS) {
      expect(names).toContain(t);
    }
  });

  it("omits all write tools in readonly mode", () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerTools(server, { readonly: true });
    const names = registeredToolNames(server);
    for (const t of WRITE_TOOLS) {
      expect(names).not.toContain(t);
    }
    // Read tools (e.g. list_bookmarks, search_prompts) must remain.
    expect(names).toContain("search_prompts");
    expect(names).toContain("list_bookmarks");
    expect(names).toHaveLength(7);
  });
});
