import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fetch from "node-fetch";
import { z } from "zod";

const RAG_BASE = process.env.RAG_BASE || "http://localhost:4100";

async function start() {
  const server = new McpServer({
    name: "rag-mcp-bridge",
    version: "1.0.0",
  });

  // Trigger re/ingestion
  server.tool(
    "rag_ingest",
    {
      description: "Rebuild the index, optionally clearing first",
      parameters: z.object({
        clear: z.boolean().optional().describe("If true, clears and rebuilds the index"),
      }),
    },
    async ({ clear }) => {
      const resp = await fetch(`${RAG_BASE}/ingest`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clear: !!clear }),
      });
      const json = await resp.json();
      return { content: [{ type: "text", text: JSON.stringify(json, null, 2) }] };
    }
  );

  // Search the KB
  server.tool(
    "rag_search",
    {
      description: "Search the knowledge base",
      parameters: z.object({
        query: z.string().describe("Natural language query"),
        k: z.number().min(1).max(10).default(4).describe("Top k passages (default 4)"),
        filter: z.string().optional().describe("Optional keyword to bias search (e.g., product)"),
      }),
    },
    async ({ query, k, filter }) => {
      const url = new URL(`${RAG_BASE}/search`);
      url.searchParams.set("query", query);
      url.searchParams.set("k", String(k));
      if (filter) url.searchParams.set("filter", filter);

      const resp = await fetch(url.toString());
      const json = await resp.json();
      return { content: [{ type: "text", text: JSON.stringify(json, null, 2) }] };
    }
  );

  // Health
  server.tool(
    "rag_health",
    {
      description: "Check if RAG service is healthy",
      parameters: z.object({}),
    },
    async () => {
      const resp = await fetch(`${RAG_BASE}/health`);
      const json = await resp.json();
      return { content: [{ type: "text", text: JSON.stringify(json, null, 2) }] };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("RAG MCP bridge ready ->", RAG_BASE);
}

start().catch((e) => {
  console.error("RAG MCP bridge failed:", e);
  process.exit(1);
});

