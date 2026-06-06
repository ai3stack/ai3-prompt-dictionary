# Zed

Zed runs MCP servers as **context servers**, configured in its `settings.json` under `context_servers`.

## Config file location

| OS | Path |
|---|---|
| macOS | `~/.config/zed/settings.json` |
| Linux | `~/.config/zed/settings.json` |

You can also open it from Zed via the command palette: **zed: open settings**.

## Snippet

```json
{
  "context_servers": {
    "ai3-prompts": {
      "command": {
        "path": "npx",
        "args": ["-y", "@ai3stack/prompts-mcp"]
      }
    }
  }
}
```

If you already have other context servers, add `"ai3-prompts": { ... }` inside the existing `context_servers` object.

## Verify

1. Open the Agent / Assistant panel.
2. `ai3-prompts` should be listed as an available context server; its tools become callable in chat.

> The `context_servers` schema can change between Zed releases. If the format differs, see the official **Zed MCP / context servers** docs.

## Try it

- "Find me a prompt for code review"
- "What categories of prompts are available?"
