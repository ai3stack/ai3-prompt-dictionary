# OpenAI ChatGPT

ChatGPT supports MCP servers two ways: as local **connectors** in the desktop app, and as remote MCP servers surfaced through the **App Directory / connectors** for hosted deployments.

## Desktop app (local stdio connector)

1. Open the ChatGPT desktop app → **Settings → Connectors** (availability depends on your plan; developer/connector features may need to be enabled).
2. Add a connector and point it at this server using the standard stdio launch:
   - **Command**: `npx`
   - **Args**: `-y @ai3stack/prompts-mcp`
3. Save and start a new chat. The model can now call the AI³ tools.

If your version exposes a config file instead of (or in addition to) the in-app UI:

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/ChatGPT/mcp_config.json` |
| Windows | `%APPDATA%\ChatGPT\mcp_config.json` |

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

> Exact menu labels and the JSON config location move between ChatGPT releases. If the UI differs, see the official **OpenAI ChatGPT connectors / MCP** docs for the current path.

## Remote MCP (App Directory)

For a hosted/remote deployment, ChatGPT connects over the network. Run the SSE transport with a bearer token:

```bash
MCP_TRANSPORT=sse MCP_PORT=3001 MCP_AUTH_TOKEN="$(openssl rand -hex 32)" npx @ai3stack/prompts-mcp
```

Then register the public `https://<your-host>/sse` endpoint (with the bearer token) as a remote MCP connector. Listing a public connector in the OpenAI **App Directory** is a submission/review process handled by OpenAI — see their developer docs.

## Try it

- "Help me write a weekly report"
- "Find a prompt for analyzing a competitor"
- "What categories of prompts do you have?"
