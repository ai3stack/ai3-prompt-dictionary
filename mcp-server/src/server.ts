import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools, type RegisterToolsOptions } from "./tools.js";
import { NAME, VERSION } from "./version.js";

export function createServer(options: RegisterToolsOptions = {}): McpServer {
  const server = new McpServer({
    name: NAME,
    version: VERSION,
  });
  registerTools(server, options);
  return server;
}
