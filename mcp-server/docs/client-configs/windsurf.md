# Windsurf (Codeium)

## Config file location

| OS | Path |
|---|---|
| macOS | `~/.codeium/windsurf/mcp_config.json` |
| Windows | `%USERPROFILE%\.codeium\windsurf\mcp_config.json` |
| Linux | `~/.codeium/windsurf/mcp_config.json` |

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

## Verify

Open Windsurf settings → Cascade → MCP Servers. `ai3-prompts` should appear with green status.

## Try it

In Cascade chat:
- "Help me draft a weekly engineering report"
- "Show me prompts in the planning category"
