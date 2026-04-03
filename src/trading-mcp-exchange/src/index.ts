import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Find .env by walking up from the compiled file until we find it
const __dirname = dirname(fileURLToPath(import.meta.url));
for (const candidate of [
  resolve(__dirname, "..", ".env"),       // from dist/ -> project root
  resolve(__dirname, "..", "..", ".env"), // fallback
  resolve(__dirname, ".env"),            // same dir
]) {
  if (existsSync(candidate)) {
    config({ path: candidate });
    break;
  }
}
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerMarketTools } from "./tools/market.js";
import { registerAccountTools } from "./tools/account.js";
import { registerTradingTools } from "./tools/trading.js";

const server = new McpServer({
  name: "trading-exchange",
  version: "0.1.0",
});

// Register all tool groups
registerMarketTools(server);
registerAccountTools(server);
registerTradingTools(server);

// Connect via stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
