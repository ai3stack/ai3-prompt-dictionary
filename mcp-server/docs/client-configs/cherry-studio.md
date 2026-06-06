# Cherry Studio

> Cherry Studio is an open-source desktop AI client that supports multiple LLM backends and has first-class MCP support.

## Config

1. Open Cherry Studio
2. Settings → MCP Servers
3. Click "Add"
4. Fill in:
   - **Name**: `ai3-prompts`
   - **Command**: `npx`
   - **Args**: `-y @ai3stack/prompts-mcp`
   - **Transport**: stdio
5. Save and the server will start

## Verify

In any chat, type a query like "weekly report" or "find a prompt for market analysis". The AI should call AI³ tools.

## Try it

- "Help me write a project weekly report"
- "Find a prompt for market analysis"
- "Save this one to my favorites"
