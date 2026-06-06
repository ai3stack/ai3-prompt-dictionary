import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";

const PORT = 31731;
const TOKEN = "test-secret-token";
const BASE = `http://127.0.0.1:${PORT}`;

function waitForListening(child: ChildProcess): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("server start timeout")), 10000);
    child.stderr?.on("data", (chunk: Buffer) => {
      if (chunk.toString().includes("SSE server listening")) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.on("exit", (code) => reject(new Error(`server exited early: ${code}`)));
  });
}

describe("SSE Bearer auth", () => {
  let child: ChildProcess;

  beforeAll(async () => {
    child = spawn("node", ["dist/index.js"], {
      env: {
        ...process.env,
        MCP_TRANSPORT: "sse",
        MCP_PORT: String(PORT),
        MCP_AUTH_TOKEN: TOKEN,
      },
      stdio: ["ignore", "ignore", "pipe"],
    });
    await waitForListening(child);
  });

  afterAll(() => {
    child.kill("SIGKILL");
  });

  it("rejects GET /sse with no Authorization header (401)", async () => {
    const res = await fetch(`${BASE}/sse`);
    expect(res.status).toBe(401);
    expect(await res.text()).toBe("");
  });

  it("rejects GET /sse with wrong token (401)", async () => {
    const res = await fetch(`${BASE}/sse`, {
      headers: { Authorization: "Bearer wrong-token" },
    });
    expect(res.status).toBe(401);
  });

  it("rejects POST /messages with no Authorization header (401)", async () => {
    const res = await fetch(`${BASE}/messages?sessionId=anything`, {
      method: "POST",
      body: "{}",
    });
    expect(res.status).toBe(401);
  });

  it("accepts GET /sse with correct Bearer token (not 401)", async () => {
    const controller = new AbortController();
    const res = await fetch(`${BASE}/sse`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: controller.signal,
    });
    expect(res.status).not.toBe(401);
    expect(res.status).toBe(200);
    controller.abort();
  });
});
