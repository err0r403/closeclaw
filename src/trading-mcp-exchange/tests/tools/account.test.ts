import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/exchange/factory.js", () => ({
  getExchange: vi.fn(),
  isSupportedExchange: vi.fn((name: string) =>
    ["binance", "bybit", "hyperliquid", "blofin"].includes(name)
  ),
}));

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getExchange } from "../../src/exchange/factory.js";
import { registerAccountTools } from "../../src/tools/account.js";

const mockGetExchange = vi.mocked(getExchange);

function captureTools(server: McpServer): Map<string, Function> {
  const tools = new Map<string, Function>();
  const origTool = server.tool.bind(server);
  server.tool = ((...args: any[]) => {
    tools.set(args[0] as string, args[args.length - 1] as Function);
    return origTool(...args);
  }) as any;
  return tools;
}

describe("Account Tools", () => {
  let server: McpServer;
  let tools: Map<string, Function>;

  beforeEach(() => {
    vi.clearAllMocks();
    server = new McpServer({ name: "test", version: "0.0.1" });
    tools = captureTools(server);
    registerAccountTools(server);
  });

  describe("get_balance", () => {
    it("returns filtered balances (no dust)", async () => {
      const mockExchange = {
        fetchBalance: vi.fn().mockResolvedValue({
          total: { USDT: 48.5, BTC: 0.001, ETH: 0.0000001 },
          free: { USDT: 48.5, BTC: 0.001, ETH: 0.0000001 },
          used: { USDT: 0, BTC: 0, ETH: 0 },
        }),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_balance")!;
      const result = await handler({ exchange: "binance" });

      const data = JSON.parse(result.content[0].text);
      expect(data.total.USDT).toBe(48.5);
      expect(data.total.BTC).toBe(0.001);
      expect(data.total.ETH).toBeUndefined(); // filtered as dust
    });

    it("passes type param to fetchBalance", async () => {
      const mockFetchBalance = vi.fn().mockResolvedValue({
        total: { USDT: 50 },
        free: { USDT: 50 },
        used: {},
      });
      mockGetExchange.mockReturnValue({ fetchBalance: mockFetchBalance } as any);

      const handler = tools.get("get_balance")!;
      await handler({ exchange: "binance", type: "swap" });

      expect(mockFetchBalance).toHaveBeenCalledWith({ type: "swap" });
    });

    it("throws for unsupported exchange", async () => {
      await expect(
        tools.get("get_balance")!({ exchange: "kraken" })
      ).rejects.toThrow("Unsupported exchange");
    });
  });

  describe("get_balance", () => {
    it("calls fetchBalance without params when no type", async () => {
      const mockFetchBalance = vi.fn().mockResolvedValue({
        total: { USDT: 50 },
        free: { USDT: 50 },
        used: {},
      });
      mockGetExchange.mockReturnValue({ fetchBalance: mockFetchBalance } as any);

      const handler = tools.get("get_balance")!;
      await handler({ exchange: "binance" });

      expect(mockFetchBalance).toHaveBeenCalledWith({});
    });
  });

  describe("get_positions", () => {
    it("returns only positions with non-zero contracts", async () => {
      const mockExchange = {
        fetchPositions: vi.fn().mockResolvedValue([
          { symbol: "BTC/USDT:USDT", side: "long", contracts: 0.001, entryPrice: 84000, markPrice: 84500, unrealizedPnl: 0.5, liquidationPrice: 70000, leverage: 2, marginMode: "cross" },
          { symbol: "ETH/USDT:USDT", side: "short", contracts: 0, entryPrice: 0, markPrice: 0, unrealizedPnl: 0, liquidationPrice: null, leverage: 1, marginMode: "cross" },
        ]),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_positions")!;
      const result = await handler({ exchange: "binance" });

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveLength(1);
      expect(data[0].symbol).toBe("BTC/USDT:USDT");
      expect(data[0].size).toBe(0.001);
    });

    it("filters by symbol when provided", async () => {
      const mockFetchPositions = vi.fn().mockResolvedValue([]);
      mockGetExchange.mockReturnValue({ fetchPositions: mockFetchPositions } as any);

      const handler = tools.get("get_positions")!;
      await handler({ exchange: "binance", symbol: "BTC/USDT" });

      expect(mockFetchPositions).toHaveBeenCalledWith(["BTC/USDT"]);
    });
  });

  describe("get_positions", () => {
    it("handles positions with null/missing fields", async () => {
      const mockExchange = {
        fetchPositions: vi.fn().mockResolvedValue([
          { symbol: "BTC/USDT:USDT", side: "long", contracts: 0.001, entryPrice: null, markPrice: null, unrealizedPnl: null, liquidationPrice: null, leverage: null, marginMode: null },
        ]),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_positions")!;
      const result = await handler({ exchange: "binance" });

      const data = JSON.parse(result.content[0].text);
      expect(data[0].entryPrice).toBe(0);
      expect(data[0].leverage).toBe(1);
      expect(data[0].marginType).toBe("unknown");
    });

    it("omits all when no symbol provided", async () => {
      const mockFetchPositions = vi.fn().mockResolvedValue([]);
      mockGetExchange.mockReturnValue({ fetchPositions: mockFetchPositions } as any);

      const handler = tools.get("get_positions")!;
      await handler({ exchange: "binance" });

      expect(mockFetchPositions).toHaveBeenCalledWith(undefined);
    });
  });

  describe("get_open_orders", () => {
    it("returns formatted orders", async () => {
      const mockExchange = {
        fetchOpenOrders: vi.fn().mockResolvedValue([
          { id: "ord1", symbol: "BTC/USDT", side: "buy", type: "limit", price: 83000, amount: 0.001, filled: 0, remaining: 0.001, status: "open", timestamp: 1711929600000 },
        ]),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_open_orders")!;
      const result = await handler({ exchange: "binance" });

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe("ord1");
      expect(data[0].price).toBe(83000);
    });

    it("handles orders with null fields", async () => {
      const mockExchange = {
        fetchOpenOrders: vi.fn().mockResolvedValue([
          { id: "ord1", symbol: "BTC/USDT", side: "buy", type: "limit", price: 83000, amount: 0.001, filled: null, remaining: null, status: "open", timestamp: null },
        ]),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_open_orders")!;
      const result = await handler({ exchange: "binance" });

      const data = JSON.parse(result.content[0].text);
      expect(data[0].filled).toBe(0);
      expect(data[0].remaining).toBe(0.001);
    });
  });

  describe("get_trades", () => {
    it("returns formatted trade history", async () => {
      const mockExchange = {
        fetchMyTrades: vi.fn().mockResolvedValue([
          { id: "t1", symbol: "BTC/USDT", side: "buy", price: 84500, amount: 0.001, cost: 84.5, fee: { cost: 0.085 }, timestamp: 1711929600000 },
        ]),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_trades")!;
      const result = await handler({ exchange: "binance", symbol: "BTC/USDT", limit: 10 });

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveLength(1);
      expect(data[0].fee).toBe(0.085);
      expect(data[0].cost).toBe(84.5);
    });

    it("handles trades with null cost and fee", async () => {
      const mockExchange = {
        fetchMyTrades: vi.fn().mockResolvedValue([
          { id: "t1", symbol: "BTC/USDT", side: "buy", price: 84500, amount: 0.001, cost: null, fee: null, timestamp: null },
        ]),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_trades")!;
      const result = await handler({ exchange: "binance", symbol: "BTC/USDT", limit: 5 });

      const data = JSON.parse(result.content[0].text);
      expect(data[0].cost).toBe(84.5); // fallback: price * amount
      expect(data[0].fee).toBe(0);
    });
  });
});
