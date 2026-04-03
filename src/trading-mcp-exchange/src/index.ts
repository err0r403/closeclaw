import "dotenv/config";
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
