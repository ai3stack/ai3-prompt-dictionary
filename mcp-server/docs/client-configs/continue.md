# Continue.dev

## Config file location

| OS | Path |
|---|---|
| macOS / Linux | `~/.continue/config.json` |
| Windows | `%USERPROFILE%\.continue\config.json` |

## Snippet

Add an `experimental.modelContextProtocolServers` entry:

```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "@ai3stack/prompts-mcp"]
        }
      }
    ]
  }
}
```

## Verify

Open Continue's chat panel. In the model dropdown info, MCP servers should list `ai3-prompts`.

## Try it

In Continue chat:
- "Find a prompt for explaining code to a junior developer"
- "List all prompt categories"
