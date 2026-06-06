# @ai3stack/prompts-mcp

> Plug **930+ expert-curated English AI prompts** into Claude, ChatGPT, Gemini, Copilot/VS Code, Cursor, Cline, and any MCP-capable AI client. Ask your AI for help with a task — it picks the right prompt automatically.

[![npm](https://img.shields.io/npm/v/@ai3stack/prompts-mcp)](https://www.npmjs.com/package/@ai3stack/prompts-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-compatible-purple)](https://modelcontextprotocol.io)
[![Prompts](https://img.shields.io/badge/prompts-930%2B-brightgreen)]()

## What you get

Stop writing prompts from scratch. After you install this in 30 seconds, your AI client can do this:

> **You**: Help me write a weekly report.
>
> **Claude/ChatGPT** _(silently calls `find_prompt_for_task("weekly report")`, picks AI³-00001 "Weekly Report" by Intel OKR designer, applies the structured framework)_: Here's a structured weekly report for you...

No more "what was that good prompt I saw last week" — your AI just uses the right one.

## Quick Start (30 seconds)

### Claude Desktop

1. Open `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)
2. Add this:
   ```json
   {
     "mcpServers": {
       "ai3-prompts": {
         "command": "npx",
         "args": ["-y", "@ai3stack/prompts-mcp"]
       }
     }
   }
   ```
3. Restart Claude Desktop
4. Ask Claude any work task — it'll pull from AI³

That's it. No install, no account, no API key. `npx -y` handles everything.

### Other clients

The same `npx -y @ai3stack/prompts-mcp` stdio config works across the major MCP ecosystem. Per-client config-file locations and formats differ — each has a 30-second setup doc in [docs/client-configs/](docs/client-configs/).

**First-party AI families**

| Family | Client | Doc |
|---|---|---|
| Anthropic Claude | Claude Desktop | [claude-desktop.md](docs/client-configs/claude-desktop.md) |
| OpenAI ChatGPT | ChatGPT (desktop / connectors) | [chatgpt.md](docs/client-configs/chatgpt.md) |
| Google Gemini | Gemini CLI | [gemini-cli.md](docs/client-configs/gemini-cli.md) |
| Microsoft Copilot | VS Code Copilot Chat | [vscode.md](docs/client-configs/vscode.md) |

**Editors & tools**

| Client | Doc |
|---|---|
| Cursor | [cursor.md](docs/client-configs/cursor.md) |
| Cline | [cline.md](docs/client-configs/cline.md) |
| Windsurf | [windsurf.md](docs/client-configs/windsurf.md) |
| Zed | [zed.md](docs/client-configs/zed.md) |
| Continue.dev | [continue.md](docs/client-configs/continue.md) |
| Cherry Studio | [cherry-studio.md](docs/client-configs/cherry-studio.md) |

### SSE Transport (remote / web deployments)

For web-based clients or remote deployments, run with SSE transport:

```bash
MCP_TRANSPORT=sse MCP_PORT=3001 npx @ai3stack/prompts-mcp
```

Then connect your client to `http://localhost:3001/sse`.

#### Remote / SSE deployment security

The SSE transport is reachable over the network, so it is gated by two environment
variables:

| Env var | Effect |
| --- | --- |
| `MCP_AUTH_TOKEN` | When set, every `GET /sse` and `POST /messages` request must send `Authorization: Bearer <token>`. Missing/incorrect tokens get `401`. Comparison is constant-time. |
| `MCP_READONLY` | Set to `1` to force read-only mode: the write tools (`add_custom_prompt`, `remove_custom_prompt`, `add_bookmark`, `remove_bookmark`) are not advertised or callable. |

Read-only mode is **automatically enabled** when running SSE without `MCP_AUTH_TOKEN`,
so an unauthenticated public endpoint can never expose write tools. On startup the
server logs its security posture (auth on/off, readonly on/off) to stderr and warns
when it is running unauthenticated read-only.

Recommended for any non-localhost deployment:

```bash
MCP_TRANSPORT=sse MCP_PORT=3001 MCP_AUTH_TOKEN="$(openssl rand -hex 32)" npx @ai3stack/prompts-mcp
```

The stdio transport is local and trusted, so it is unaffected by these variables
(write tools stay available unless you explicitly set `MCP_READONLY=1`).

## What it does

This MCP server exposes **11 tools** to your AI client:

| Tool | Purpose |
|---|---|
| `find_prompt_for_task` | Natural-language task → top 5 matching prompts |
| `search_prompts` | Filter by keyword / category / role |
| `get_prompt` | Retrieve a specific prompt's full content |
| `list_categories` | Browse all 47 categories across 4 sections |
| `random_prompt` | Get a random prompt suggestion (with optional filters) |
| `get_stats` | Catalog statistics: total counts, section breakdown |
| `add_custom_prompt` | Add your own prompt to the local overlay |
| `remove_custom_prompt` | Remove a custom prompt from the overlay |
| `add_bookmark` | Save a prompt to your local favorites |
| `remove_bookmark` | Remove a bookmark |
| `list_bookmarks` | List your saved prompts (stored locally, never synced) |

The AI calls these automatically based on what you ask. You don't see the tool names — you just get better answers.

## What's in the catalog

930+ prompts from the [AI³ Prompt Dictionary](https://ai3stack.com), every prompt is:

- **Structured** — not free text. Each has `role`, `task`, `framework`, `style`, output format
- **English** — every prompt is written in English
- **Classified** — 4 sections × 47 categories × 10 types
- **Versioned** — quality tier per prompt (`draft` / `community-reviewed` / `expert-reviewed`)

Categories span: weekly/monthly reports, OKR planning, market analysis, contract review, code review, lesson plans, travel itineraries, customer service routing, public communications, and 40 more.

## Custom Prompts

Add your own prompts that appear alongside the built-in catalog. Tell your AI "create a custom prompt for X" and it will call `add_custom_prompt`. Custom prompts are stored locally at `~/.config/ai3-prompts-mcp/custom-prompts.json` (or `%APPDATA%` on Windows).

## Privacy

- ✅ **Zero telemetry** — no tracking, no analytics, no phone-home
- ✅ **Zero network calls** in stdio mode — data is bundled into the package
- ✅ **Bookmarks stored locally** at `~/.local/share/ai3-prompts-mcp/bookmarks.json` (or `%APPDATA%` on Windows), never synced anywhere
- ✅ **Custom prompts stored locally** at `~/.config/ai3-prompts-mcp/custom-prompts.json`, never synced anywhere
- ✅ **MIT licensed** — fork it, audit it, ship it commercially

## Bookmarks

Tell your AI "I really like this one, save it" and the AI will call `add_bookmark`. Your bookmarks live as a JSON file on **your machine only**. Move computers? Copy the file.

## Updating

Prompts get updated monthly. `npx -y @ai3stack/prompts-mcp` always runs the latest version on cold start. To force-pin a version:

```json
"args": ["-y", "@ai3stack/prompts-mcp@0.2.0"]
```

## Development

```bash
# from the project root
npm install
npm run sync-data    # pull latest from upstream ai-prompt-dictionary
npm run build
npm test             # run test suite
npm run lint         # check code quality
npm run inspect      # opens MCP Inspector (official debug UI)
```

For local testing in Claude Desktop, point the config at your local build:

```json
{
  "mcpServers": {
    "ai3-prompts": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"]
    }
  }
}
```

## Architecture

```
Your AI client (Claude Desktop / Cursor / Cline / ...)
              │  stdio or SSE + JSON-RPC (MCP protocol)
              ▼
    ai3-prompts-mcp (this Node.js server)
              │
              ├── Bundled JSON  (930 English prompts, ~650KB)
              └── Local overlay  (user custom prompts, ~/.config/...)
```

No database, no external server. Single Node process, runs as child process of your AI client (stdio) or as standalone HTTP server (SSE). SSE deployments support Bearer-token auth and read-only mode (see [Remote / SSE deployment security](#remote--sse-deployment-security)).

## Project status

**v0.2** — current release. Working features:
- ✅ All 11 tools functional
- ✅ English keyword search (BM25 ranking)
- ✅ Bookmarks with local persistence
- ✅ stdio transport (default)
- ✅ SSE transport (for remote / web deployments)
- ✅ Custom prompt overlays
- ✅ Random prompt discovery
- ✅ Catalog statistics
- ✅ Full test suite (Vitest)
- ✅ CI pipeline (build + test + lint)

Coming in v1.0:
- Full English prompt pass to `expert-reviewed` quality
- Registry listings (official MCP registry, mcp.so, Smithery, Glama)

## Related

- **AI³ Prompt Dictionary**: [ai3stack.com](https://ai3stack.com) (the dictionary and web UI)
- **MCP protocol**: [modelcontextprotocol.io](https://modelcontextprotocol.io)

## Contributing

This server is a thin wrapper over the AI³ Prompt Dictionary catalog. **Most contributions belong upstream** in the dictionary — adding prompts, fixing schema, improving quality.

For server-specific changes (new tool, transport, bug fix), open an issue first.

## License

MIT. Use it however you want.
