#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createServer } from "./server.js";
import {
  createServer as createHttpServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { timingSafeEqual } from "node:crypto";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

const TRANSPORT = process.env["MCP_TRANSPORT"] ?? "stdio";
const PORT = parseInt(process.env["MCP_PORT"] ?? "3001", 10);
const SESSION_TTL_MS = 5 * 60 * 1000;

const AUTH_TOKEN = process.env["MCP_AUTH_TOKEN"];
// Read-only when explicitly requested, or when serving SSE with no auth token
// (a public, unauthenticated endpoint must NEVER expose write tools).
const READONLY = process.env["MCP_READONLY"] === "1" || (TRANSPORT === "sse" && !AUTH_TOKEN);

/**
 * Constant-time check of the Authorization: Bearer <token> header against
 * MCP_AUTH_TOKEN. Returns true if auth is not configured (caller decides).
 */
function isAuthorized(req: IncomingMessage): boolean {
  if (!AUTH_TOKEN) return true;
  const header = req.headers["authorization"];
  if (typeof header !== "string") return false;
  const match = /^Bearer (.+)$/.exec(header);
  if (!match) return false;
  const provided = Buffer.from(match[1]!, "utf-8");
  const expected = Buffer.from(AUTH_TOKEN, "utf-8");
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

interface Session {
  transport: SSEServerTransport;
  server: ReturnType<typeof createServer>;
  lastActivity: number;
  timer: ReturnType<typeof setTimeout>;
}

async function main(): Promise<void> {
  if (TRANSPORT === "sse") {
    const sessions = new Map<string, Session>();

    function touchSession(sessionId: string) {
      const session = sessions.get(sessionId);
      if (session) {
        session.lastActivity = Date.now();
        clearTimeout(session.timer);
        session.timer = setTimeout(() => {
          sessions.delete(sessionId);
          console.error(`Session expired: ${sessionId.slice(0, 8)}...`);
        }, SESSION_TTL_MS);
      }
    }

    const httpServer = createHttpServer(async (req: IncomingMessage, res: ServerResponse) => {
      try {
        if (req.url === "/sse" && req.method === "GET") {
          if (!isAuthorized(req)) {
            res.writeHead(401);
            res.end();
            return;
          }
          const server = createServer({ readonly: READONLY });
          const transport = new SSEServerTransport("/messages", res);
          const sessionId = transport.sessionId;
          const timer = setTimeout(() => {
            sessions.delete(sessionId);
          }, SESSION_TTL_MS);
          sessions.set(sessionId, { transport, server, lastActivity: Date.now(), timer });
          console.error(`SSE connected: ${sessionId.slice(0, 8)}... (total: ${sessions.size})`);
          await server.connect(transport);
          return;
        }

        if (req.url?.startsWith("/messages") && req.method === "POST") {
          if (!isAuthorized(req)) {
            res.writeHead(401);
            res.end();
            return;
          }
          const sessionId = new URL(req.url, `http://${req.headers.host}`).searchParams.get(
            "sessionId",
          );
          if (!sessionId) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Missing sessionId" }));
            return;
          }
          const session = sessions.get(sessionId);
          if (!session) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Session not found" }));
            return;
          }
          touchSession(sessionId);
          const body = await readBody(req);
          let parsedBody: unknown;
          try {
            parsedBody = JSON.parse(body);
          } catch {
            parsedBody = body;
          }
          await session.transport.handlePostMessage(req, res, parsedBody);
          return;
        }

        res.writeHead(404);
        res.end("Not found");
      } catch (err) {
        console.error("Request error:", err);
        if (!res.headersSent) {
          res.writeHead(500);
          res.end("Internal server error");
        }
      }
    });

    httpServer.listen(PORT, () => {
      console.error(`ai3-prompts-mcp SSE server listening on http://localhost:${PORT}/sse`);
      console.error(
        `  security: auth=${AUTH_TOKEN ? "enabled" : "disabled"} readonly=${READONLY ? "on" : "off"}`,
      );
      if (!AUTH_TOKEN) {
        console.error(
          "  WARNING: MCP_AUTH_TOKEN is not set — running READ-ONLY (write tools disabled) " +
            "and accepting unauthenticated connections. Set MCP_AUTH_TOKEN to enable write tools " +
            "and require Bearer auth on /sse and /messages.",
        );
      }
    });
  } else {
    const server = createServer({ readonly: READONLY });
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}

main().catch((err) => {
  console.error("ai3-prompts-mcp fatal error:", err);
  process.exit(1);
});
