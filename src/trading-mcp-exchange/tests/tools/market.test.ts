import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the exchange factory
vi.mock("../../src/exchange/factory.js", () => ({
  getExchange: vi.fn(),
  isSupportedExchange: vi.fn((name: string) =>
    ["binance", "bybit", "hyperliquid", "blofin"].includes(name)
  ),
}));

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getExchange } from "../../src/exchange/factory.js";
import { registerMarketTools } from "../../src/tools/market.js";

const mockGetExchange = vi.mocked(getExchange);

// Helper to capture tool handlers from McpServer
function captureTools(server: McpServer): Map<string, Function> {
  const tools = new Map<string, Function>();
  const origTool = server.tool.bind(server);
  server.tool = ((...args: any[]) => {
    // server.tool(name, description, schema, handler)
    const name = args[0] as string;
    const handler = args[args.length - 1] as Function;
    tools.set(name, handler);
    return origTool(...args);
  }) as any;
  return tools;
}

describe("Market Tools", () => {
  let server: McpServer;
  let tools: Map<string, Function>;

  beforeEach(() => {
    vi.clearAllMocks();
    server = new McpServer({ name: "test", version: "0.0.1" });
    tools = captureTools(server);
    registerMarketTools(server);
  });

  describe("get_ticker", () => {
    it("returns formatted ticker data", async () => {
      const mockExchange = {
        fetchTicker: vi.fn().mockResolvedValue({
          symbol: "BTC/USDT",
          last: 84500,
          bid: 84499,
          ask: 84501,
          high: 85000,
          low: 83000,
          percentage: 1.5,
          quoteVolume: 1200000000,
          timestamp: 1711929600000,
        }),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_ticker")!;
      const result = await handler({ exchange: "binance", symbol: "BTC/USDT" });

      const data = JSON.parse(result.content[0].text);
      expect(data.symbol).toBe("BTC/USDT");
      expect(data.last).toBe(84500);
      expect(data.bid).toBe(84499);
      expect(data.ask).toBe(84501);
      expect(data.change24h).toBe(1.5);
      expect(data.volume24h).toBe(1200000000);
    });

    it("handles null/undefined ticker fields with defaults", async () => {
      const mockExchange = {
        fetchTicker: vi.fn().mockResolvedValue({
          symbol: "BTC/USDT",
          last: null,
          bid: null,
          ask: null,
          high: null,
          low: null,
          percentage: null,
          quoteVolume: null,
          timestamp: null,
        }),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_ticker")!;
      const result = await handler({ exchange: "binance", symbol: "BTC/USDT" });

      const data = JSON.parse(result.content[0].text);
      expect(data.last).toBe(0);
      expect(data.bid).toBe(0);
      expect(data.change24h).toBe(0);
    });

    it("throws for unsupported exchange", async () => {
      await expect(
        tools.get("get_ticker")!({ exchange: "ftx", symbol: "BTC/USDT" })
      ).rejects.toThrow("Unsupported exchange");
    });
  });

  describe("get_orderbook", () => {
    it("returns orderbook with spread calculation", async () => {
      const mockExchange = {
        fetchOrderBook: vi.fn().mockResolvedValue({
          bids: [[84499, 1.5], [84498, 2.0], [84497, 0.5]],
          asks: [[84501, 1.0], [84502, 3.0], [84503, 0.8]],
        }),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_orderbook")!;
      const result = await handler({ exchange: "binance", symbol: "BTC/USDT", depth: 3 });

      const data = JSON.parse(result.content[0].text);
      expect(data.bids).toHaveLength(3);
      expect(data.asks).toHaveLength(3);
      expect(data.spread).toBe(2);
      expect(data.spreadPct).toBeGreaterThan(0);
    });

    it("handles empty orderbook", async () => {
      const mockExchange = {
        fetchOrderBook: vi.fn().mockResolvedValue({ bids: [], asks: [] }),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_orderbook")!;
      const result = await handler({ exchange: "binance", symbol: "BTC/USDT", depth: 10 });

      const data = JSON.parse(result.content[0].text);
      expect(data.spread).toBe(0);
      expect(data.spreadPct).toBe(0);
    });
  });

  describe("get_ohlcv", () => {
    it("returns formatted candle data", async () => {
      const mockExchange = {
        fetchOHLCV: vi.fn().mockResolvedValue([
          [1711929600000, 84000, 85000, 83500, 84500, 100],
          [1711933200000, 84500, 84800, 84200, 84300, 80],
        ]),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_ohlcv")!;
      const result = await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        timeframe: "1h",
        limit: 2,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveLength(2);
      expect(data[0].open).toBe(84000);
      expect(data[0].close).toBe(84500);
      expect(data[0].timestamp).toContain("2024");
    });
  });

  describe("get_funding_rate", () => {
    it("returns funding rate with annualized calculation", async () => {
      const mockExchange = {
        fetchFundingRate: vi.fn().mockResolvedValue({
          symbol: "BTC/USDT",
          fundingRate: 0.0001,
          fundingDatetime: "2026-04-02T08:00:00Z",
          nextFundingRate: 0.00012,
          nextFundingDatetime: "2026-04-02T16:00:00Z",
        }),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_funding_rate")!;
      const result = await handler({ exchange: "binance", symbol: "BTC/USDT" });

      const data = JSON.parse(result.content[0].text);
      expect(data.fundingRate).toBe(0.0001);
      expect(data.annualizedRate).toBeCloseTo(10.95, 1);
      expect(data.nextFundingRate).toBe(0.00012);
    });

    it("handles null funding rate fields", async () => {
      const mockExchange = {
        fetchFundingRate: vi.fn().mockResolvedValue({
          symbol: "BTC/USDT",
          fundingRate: null,
          fundingDatetime: null,
          nextFundingRate: null,
          nextFundingDatetime: null,
        }),
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_funding_rate")!;
      const result = await handler({ exchange: "binance", symbol: "BTC/USDT" });

      const data = JSON.parse(result.content[0].text);
      expect(data.fundingRate).toBe(0);
      expect(data.annualizedRate).toBe(0);
      expect(data.nextFundingRate).toBeNull();
    });
  });

  describe("get_markets", () => {
    it("returns filtered USDT markets", async () => {
      const mockExchange = {
        loadMarkets: vi.fn(),
        markets: {
          "BTC/USDT": { symbol: "BTC/USDT", type: "spot", base: "BTC", quote: "USDT", active: true, limits: { amount: { min: 0.00001 }, cost: { min: 5 } }, maker: 0.001, taker: 0.001 },
          "ETH/BTC": { symbol: "ETH/BTC", type: "spot", base: "ETH", quote: "BTC", active: true, limits: {}, maker: 0.001, taker: 0.001 },
          "ETH/USDT": { symbol: "ETH/USDT", type: "swap", base: "ETH", quote: "USDT", active: true, limits: { amount: { min: 0.001 }, cost: { min: 5 } }, maker: 0.0002, taker: 0.0005 },
        },
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_markets")!;
      const result = await handler({ exchange: "binance" });

      const data = JSON.parse(result.content[0].text);
      // ETH/BTC should be filtered out (not USDT-quoted)
      expect(data).toHaveLength(2);
      expect(data.map((m: any) => m.symbol)).toContain("BTC/USDT");
      expect(data.map((m: any) => m.symbol)).not.toContain("ETH/BTC");
    });

    it("handles markets with missing limits/fees", async () => {
      const mockExchange = {
        loadMarkets: vi.fn(),
        markets: {
          "BTC/USDT": { symbol: "BTC/USDT", type: "spot", base: "BTC", quote: "USDT", active: true, limits: {}, maker: null, taker: null },
        },
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_markets")!;
      const result = await handler({ exchange: "binance" });

      const data = JSON.parse(result.content[0].text);
      expect(data[0].minAmount).toBeNull();
      expect(data[0].makerFee).toBeNull();
    });

    it("filters by type when specified", async () => {
      const mockExchange = {
        loadMarkets: vi.fn(),
        markets: {
          "BTC/USDT": { symbol: "BTC/USDT", type: "spot", base: "BTC", quote: "USDT", active: true, limits: {}, maker: 0.001, taker: 0.001 },
          "BTC/USDT:USDT": { symbol: "BTC/USDT:USDT", type: "swap", base: "BTC", quote: "USDT", active: true, limits: {}, maker: 0.0002, taker: 0.0005 },
        },
      };
      mockGetExchange.mockReturnValue(mockExchange as any);

      const handler = tools.get("get_markets")!;
      const result = await handler({ exchange: "binance", type: "swap" });

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveLength(1);
      expect(data[0].type).toBe("swap");
    });
  });
});
