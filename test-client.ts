#!/usr/bin/env node
/**
 * Test MCP Client - Simulates agent handshake with the server
 *
 * This will spawn the server process and attempt to perform the MCP handshake
 * to help debug any STDIO/EPIPE issues.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testConnection() {
  console.log("🧪 Starting MCP Client Test...\n");

  // Path to the compiled server
  const serverPath = path.join(__dirname, "build", "index.js");

  console.log(`📍 Server path: ${serverPath}`);
  console.log("🚀 Spawning server process...\n");

  // Spawn the server process
  const serverProcess = spawn("node", [serverPath], {
    env: {
      ...process.env,
      MODE: "stdio",
      // Optionally add NWC_CONNECTION_STRING if you have one
      // NWC_CONNECTION_STRING: "nostr+walletconnect://..."
    },
    stdio: ["pipe", "pipe", "pipe"], // stdin, stdout, stderr
  });

  // Log server stderr (for debugging)
  serverProcess.stderr.on("data", (data) => {
    console.error("❌ Server stderr:", data.toString());
  });

  serverProcess.on("error", (error) => {
    console.error("❌ Server process error:", error);
  });

  serverProcess.on("exit", (code, signal) => {
    console.log(
      `\n🛑 Server process exited with code: ${code}, signal: ${signal}`
    );
  });

  try {
    // Create client transport using the server process
    console.log("🔗 Creating STDIO transport...");
    const transport = new StdioClientTransport({
      command: "node",
      args: [serverPath],
      env: {
        ...process.env,
        MODE: "stdio",
      },
    });

    // Create MCP client
    console.log("👤 Creating MCP client...");
    const client = new Client(
      {
        name: "test-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    // Connect to the server
    console.log("🤝 Connecting to server...\n");
    await client.connect(transport);
    console.log("✅ Successfully connected to server!");

    // List available tools
    console.log("\n📦 Listing available tools...");
    const toolsResult = await client.listTools();
    console.log(`✅ Found ${toolsResult.tools.length} tools:`);
    toolsResult.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
    });

    // Test calling a tool (fetchPosts)
    console.log("\n🛠️  Testing tool call: fetchPosts");
    try {
      const result = await client.callTool({
        name: "fetchPosts",
        arguments: {
          hashtag: "bitcoin",
          limit: 5,
          filterSpam: true,
        },
      });
      console.log("✅ Tool call successful!");
      console.log(
        "📝 Result:",
        JSON.stringify(result, null, 2).substring(0, 500) + "..."
      );
    } catch (toolError: any) {
      console.error("❌ Tool call failed:", toolError.message);
    }

    // Close the connection
    console.log("\n🔌 Closing connection...");
    await client.close();
    console.log("✅ Connection closed successfully!");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Test failed with error:");
    console.error("   Message:", error.message);
    console.error("   Stack:", error.stack);

    if (error.code === "EPIPE") {
      console.error("\n💡 EPIPE Error Detected!");
      console.error(
        "   This usually means the server closed the connection unexpectedly."
      );
      console.error("   Check the server logs above for more details.");
    }

    serverProcess.kill();
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on("SIGINT", () => {
  console.log("\n👋 Received SIGINT, exiting...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Received SIGTERM, exiting...");
  process.exit(0);
});

// Run the test
testConnection().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
