# Cline (VSCode Extension)

## Config

Cline manages MCP servers via its sidebar UI:

1. Open VSCode
2. Click the Cline icon in the sidebar
3. Settings (⚙️) → MCP Servers → Edit
4. Add this entry:

```json
{
  "mcpServers": {
    "ai3-prompts": {
      "command": "npx",
      "args": ["-y", "@ai3stack/prompts-mcp"],
      "disabled": false,
      "autoApprove": ["find_prompt_for_task", "search_prompts", "get_prompt", "list_categories"]
    }
  }
}
```

The `autoApprove` list lets Cline call read-only tools without confirmation each time.

## Verify

1. Reopen the Cline panel
2. The MCP servers section should show `ai3-prompts` as connected
3. Tools list should show 7 tools

## Try it

Open Cline and say:
- "Find me a prompt template for writing technical documentation"
- "Save the project status report prompt to my bookmarks"
