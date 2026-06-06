# Google Gemini CLI

The Gemini CLI reads MCP servers from its `settings.json` under an `mcpServers` block.

## Config file location

| Scope | Path |
|---|---|
| User (global) | `~/.gemini/settings.json` |
| Project | `.gemini/settings.json` in the project root |

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

If the file already defines other servers, add `"ai3-prompts": { ... }` inside the existing `mcpServers` object.

## Verify

1. Start `gemini`.
2. Run `/mcp` (or `/tools`) to list connected MCP servers and their tools — `ai3-prompts` should appear.

> Exact slash commands and setting keys can change between releases. If the schema differs, see the official **Gemini CLI** docs.

## Try it

- "Help me write a weekly report"
- "Find a prompt for market analysis"
