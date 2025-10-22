#!/usr/bin/env node

// CRITICAL: Suppress all console output before any imports
// MCP requires pure JSON-RPC on stdout - any other output breaks the protocol
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;
const originalConsoleDebug = console.debug;

console.log = () => {};
console.error = (...args: any[]) => process.stderr.write(args.join(" ") + "\n");
console.warn = () => {};
console.info = () => {};
console.debug = () => {};

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMCPServer } from "./mcp_server.js";

/**
 * Nostr Posts Fetcher MCP Server (Paid)
 *
 * Paid MCP server for fetching Nostr posts by hashtag.
 * Requires NWC_CONNECTION_STRING environment variable.
 */

class NostrMCPServer {
  async runSTDIO() {
    try {
      // Get NWC connection string from environment
      const NWC_CONNECTION_STRING = process.env.NWC_CONNECTION_STRING;

      if (!NWC_CONNECTION_STRING) {
        throw new Error(
          "NWC_CONNECTION_STRING environment variable is required for paid tools"
        );
      }

      // Create transport and server
      const transport = new StdioServerTransport();
      const server = createMCPServer(NWC_CONNECTION_STRING);

      // Connect
      await server.connect(transport);
    } catch (error) {
      // Log to stderr (not stdout) to avoid breaking MCP protocol
      process.stderr.write(
        `Failed to start Nostr MCP Server: ${
          error instanceof Error ? error.message : String(error)
        }\n`
      );
      process.exit(1);
    }
  }
}

// Handle EPIPE errors gracefully
process.on("uncaughtException", (error: Error) => {
  const nodeError = error as NodeJS.ErrnoException;
  if (nodeError.code === "EPIPE") {
    // EPIPE is normal when the client disconnects
    process.exit(0);
  }
  // Log to stderr (not stdout) to avoid breaking MCP protocol
  process.stderr.write(`Uncaught exception: ${error}\n`);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  // Log to stderr (not stdout) to avoid breaking MCP protocol
  process.stderr.write(`Unhandled rejection: ${reason}\n`);
  process.exit(1);
});

process.on("SIGINT", () => {
  process.exit(0);
});

process.on("SIGTERM", () => {
  process.exit(0);
});

const mode = process.env.MODE || "stdio";
switch (mode.toLowerCase()) {
  case "stdio":
    new NostrMCPServer().runSTDIO().catch((err) => {
      process.stderr.write(`Error: ${err}\n`);
      process.exit(1);
    });
    break;
  default:
    process.stderr.write("Unknown mode: " + mode + ". Use 'stdio'\n");
    process.exit(1);
}
