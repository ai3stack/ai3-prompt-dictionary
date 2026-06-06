import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

function parseResult(result: { content: Array<{ type: string; text: string }> }): unknown {
  const raw = JSON.parse(result.content[0]!.text) as { success: boolean; data?: unknown; error?: string };
  if (!raw.success) throw new Error(raw.error ?? "Unknown error");
  return raw.data;
}

async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
  });

  const client = new Client({ name: "smoke-test", version: "1.0.0" });
  await client.connect(transport);

  console.log("=== Connected to MCP server ===\n");

  console.log("1. Listing tools...");
  const tools = await client.listTools();
  console.log(`   Found ${tools.tools.length} tools: ${tools.tools.map((t) => t.name).join(", ")}\n`);

  console.log("2. find_prompt_for_task('weekly report')...");
  const findResult = await client.callTool({
    name: "find_prompt_for_task",
    arguments: { task: "weekly report", language: "en" },
  });
  const findData = parseResult(findResult) as { matches: Array<{ id: string; name: string; score: number }> };
  console.log(`   Top match: ${findData.matches[0]!.name} (${findData.matches[0]!.id}, score=${findData.matches[0]!.score})\n`);

  console.log("3. get_prompt('AI³-00001', zh)...");
  const getResult = await client.callTool({
    name: "get_prompt",
    arguments: { id: "AI³-00001", language: "zh" },
  });
  const prompt = parseResult(getResult) as { name: string; ai_instructions: { role: string; task: string } };
  console.log(`   Name: ${prompt.name}`);
  console.log(`   Role: ${prompt.ai_instructions.role}`);
  console.log(`   Task: ${prompt.ai_instructions.task}\n`);

  console.log("4. list_categories(zh)...");
  const catResult = await client.callTool({
    name: "list_categories",
    arguments: { language: "zh" },
  });
  const cats = parseResult(catResult) as { total_categories: number; total_prompts: number };
  console.log(`   Total categories: ${cats.total_categories}`);
  console.log(`   Total prompts: ${cats.total_prompts}\n`);

  console.log("5. get_stats(en)...");
  const statsResult = await client.callTool({
    name: "get_stats",
    arguments: { language: "en" },
  });
  const stats = parseResult(statsResult) as { version: string; total_prompts: number; built_in_prompts: number };
  console.log(`   Version: ${stats.version} | Total: ${stats.total_prompts} | Built-in: ${stats.built_in_prompts}\n`);

  console.log("6. random_prompt(zh)...");
  const randomResult = await client.callTool({
    name: "random_prompt",
    arguments: { language: "zh" },
  });
  const random = parseResult(randomResult) as { id: string; name: string; role: string };
  console.log(`   Random: ${random.name} (${random.id}) - ${random.role}\n`);

  console.log("=== All smoke tests passed! ===");
  await client.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
