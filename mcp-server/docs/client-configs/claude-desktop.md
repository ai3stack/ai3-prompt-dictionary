# Claude Desktop

## Config file location

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

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

If the file already has other MCP servers, just add `"ai3-prompts": { ... }` inside the existing `mcpServers` object.

## Verify

1. Restart Claude Desktop fully (Quit, not just close window)
2. Click the 🔌 (plug) icon in the chat input
3. You should see "ai3-prompts" with 7 tools listed

## Try it

Ask Claude:
- "Help me write a weekly report"
- "Find a prompt for analyzing a competitor"
- "What categories of prompts do you have?"
- "Save this prompt to my favorites"

## Troubleshooting

- **No 🔌 icon**: enable Developer Mode in Claude Desktop settings
- **"npx not found"**: install Node.js 18+ from [nodejs.org](https://nodejs.org)
- **Tools not showing**: check Claude Desktop logs (Help → Show Logs)
