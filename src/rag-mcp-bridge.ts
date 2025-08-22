import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fetch from "node-fetch";

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
      type: "object",
      properties: { clear: { type: "boolean", description: "If true, clears and rebuilds the index" } },
      required: [],
      additionalProperties: false
    },
    async ({ clear }) => {
      const resp = await fetch(`${RAG_BASE}/ingest`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clear: !!clear })
      });
      const json = await resp.json();
      return { content: [{ type: "text", text: JSON.stringify(json, null, 2) }] };
    }
  );

  // Search the KB
  server.tool(
    "rag_search",
    {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural language query" },
        k: { type: "integer", minimum: 1, maximum: 10, description: "Top k passages (default 4)" },
        filter: { type: "string", description: "Optional keyword to bias search (e.g., product)" }
      },
      required: ["query"],
      additionalProperties: false
    },
    async ({ query, k, filter }) => {
      const url = new URL(`${RAG_BASE}/search`);
      url.searchParams.set("query", String(query));
      if (k) url.searchParams.set("k", String(k));
      if (filter) url.searchParams.set("filter", String(filter));
      const resp = await fetch(url.toString());
      const json = await resp.json();
      return { content: [{ type: "text", text: JSON.stringify(json, null, 2) }] };
    }
  );

  // Health
  server.tool(
    "rag_health",
    { type: "object", properties: {}, required: [] },
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
