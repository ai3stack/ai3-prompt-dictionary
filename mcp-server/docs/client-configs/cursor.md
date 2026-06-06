# Cursor

## Config file location

| OS | Path |
|---|---|
| macOS | `~/.cursor/mcp.json` |
| Windows | `%USERPROFILE%\.cursor\mcp.json` |
| Linux | `~/.cursor/mcp.json` |

## Snippet

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

## Per-project config

Alternatively, create `.cursor/mcp.json` in your project root for project-scoped MCP servers (same JSON structure).

## Verify

1. Open Cursor Settings → MCP
2. `ai3-prompts` should appear with status "Active"
3. In any chat, the agent can now call AI³ tools

## Try it

In Cursor's agent mode:
- "Find me a prompt for code review"
- "What categories of prompts are available?"
