# VS Code (GitHub Copilot Chat — Agent mode)

VS Code's Copilot Chat supports MCP servers in **Agent mode**. Configure them per-workspace in `.vscode/mcp.json`, or globally in user settings.

## Workspace config (`.vscode/mcp.json`)

Create `.vscode/mcp.json` in your project root:

```json
{
  "servers": {
    "ai3-prompts": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@ai3stack/prompts-mcp"]
    }
  }
}
```

## Global config (user settings)

Alternatively add an `mcp` block to your user `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "ai3-prompts": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@ai3stack/prompts-mcp"]
      }
    }
  }
}
```

## Verify

1. Open the Copilot Chat view and switch to **Agent** mode.
2. Click the tools/wrench icon — `ai3-prompts` and its tools should be listed.
3. If the server doesn't appear, run **MCP: List Servers** from the Command Palette to start/inspect it.

> Key/setting names occasionally change between VS Code releases. If the schema differs, see the official **VS Code MCP** docs.

## Try it

- "Find me a prompt for code review"
- "What categories of prompts are available?"
