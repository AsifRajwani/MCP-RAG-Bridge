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

  // Test tool for verifying input schema and MCP setup
  server.tool(
    "test_tool",
    {
      description: "A simple test tool to verify the connection and input schema.",
      foo: z.string()
    },
    async ({ foo }) => {
      return {
        content: [{ type: "text", text: `Test tool received input: ${foo}` }],
      };
    }
  );

  // Trigger re/ingestion
  server.tool(
    "rag_ingest",
    {
      description: "Ingests or re-ingests documents into the RAG knowledge base. Use 'clear: true' to delete existing data before ingestion.",
      clear: z.boolean().optional()
    },
    async (args) => {
      try {
        console.error("rag_ingest called with args:", JSON.stringify(args));
        const clear = args?.clear ?? false;

        const resp = await fetch(`${RAG_BASE}/ingest`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ clear }),
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`RAG ingest failed: ${resp.status} ${resp.statusText} - ${text}`);
        }

        const json = await resp.json();
        return { content: [{ type: "text", text: JSON.stringify(json, null, 2) }] };
      } catch (e: any) {
        console.error("Error in rag_ingest tool:", e);
        throw e;
      }
    }
  );

  // Search the KB
  server.tool(
    "rag_search",
    {
      description: "Searches the RAG knowledge base for information relevant to a given query. Returns a summary of the most relevant documents.",
      query: z.string(),
      k: z.number().min(1).max(10).default(4),
      filter: z.string().optional(),
    },
    async ({ query, k, filter }) => {
      try {
        const url = new URL(`${RAG_BASE}/search`);
        url.searchParams.set("query", query);
        url.searchParams.set("k", String(k ?? 4));
        if (filter) url.searchParams.set("filter", filter);

        const resp = await fetch(url.toString());
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`RAG search failed: ${resp.status} ${resp.statusText} - ${text}`);
        }

        const json = await resp.json();
        return { content: [{ type: "text", text: JSON.stringify(json, null, 2) }] };
      } catch (e: any) {
        console.error("Error in rag_search tool:", e);
        throw e;
      }
    }
  );

  // Health
  server.tool(
    "rag_health",
    {
      description: "Performs a health check on the RAG server to ensure it is running and accessible.",
    },
    async () => {
      try {
        const resp = await fetch(`${RAG_BASE}/health`);
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`RAG health check failed: ${resp.status} ${resp.statusText} - ${text}`);
        }

        const json = await resp.json();
        return { content: [{ type: "text", text: JSON.stringify(json, null, 2) }] };
      } catch (e: any) {
        console.error("Error in rag_health tool:", e);
        throw e;
      }
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