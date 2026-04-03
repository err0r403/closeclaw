import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../src/exchange/factory.js", () => ({
  getExchange: vi.fn(),
  isSupportedExchange: vi.fn((name: string) =>
    ["binance", "bybit", "hyperliquid", "blofin"].includes(name)
  ),
}));

vi.mock("../../src/logger/trade-logger.js", () => ({
  logTrade: vi.fn(),
}));

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getExchange } from "../../src/exchange/factory.js";
import { logTrade } from "../../src/logger/trade-logger.js";
import { registerTradingTools } from "../../src/tools/trading.js";

const mockGetExchange = vi.mocked(getExchange);
const mockLogTrade = vi.mocked(logTrade);

function captureTools(server: McpServer): Map<string, Function> {
  const tools = new Map<string, Function>();
  const origTool = server.tool.bind(server);
  server.tool = ((...args: any[]) => {
    tools.set(args[0] as string, args[args.length - 1] as Function);
    return origTool(...args);
  }) as any;
  return tools;
}

describe("Trading Tools", () => {
  let server: McpServer;
  let tools: Map<string, Function>;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RISK_ALLOWED_PAIRS = "BTC/USDT,ETH/USDT,SOL/USDT";
    process.env.RISK_MAX_LEVERAGE = "3";
    process.env.RISK_MAX_POSITION_PCT = "20";
    process.env.RISK_MAX_OPEN_POSITIONS = "5";

    server = new McpServer({ name: "test", version: "0.0.1" });
    tools = captureTools(server);
    registerTradingTools(server);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  function createMockExchange(overrides: Record<string, any> = {}) {
    return {
      fetchTicker: vi.fn().mockResolvedValue({ last: 84500 }),
      fetchBalance: vi.fn().mockResolvedValue({
        total: { USDT: 1000 },
        free: { USDT: 1000 },
      }),
      fetchPositions: vi.fn().mockResolvedValue([]),
      createMarketOrder: vi.fn().mockResolvedValue({
        id: "ord1",
        symbol: "BTC/USDT",
        side: "buy",
        type: "market",
        price: 84500,
        amount: 0.001,
        cost: 84.5,
        status: "filled",
        timestamp: 1711929600000,
      }),
      createLimitOrder: vi.fn().mockResolvedValue({
        id: "ord2",
        symbol: "BTC/USDT",
        side: "buy",
        type: "limit",
        price: 83000,
        amount: 0.001,
        cost: 83,
        status: "open",
        timestamp: 1711929600000,
      }),
      cancelOrder: vi.fn().mockResolvedValue({ id: "ord1" }),
      fetchOpenOrders: vi.fn().mockResolvedValue([]),
      setLeverage: vi.fn(),
      ...overrides,
    };
  }

  describe("place_order", () => {
    it("places a market order and logs it", async () => {
      const mockEx = createMockExchange();
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      const result = await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        side: "buy",
        type: "market",
        amount: 0.001,
        reduceOnly: false,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.id).toBe("ord1");
      expect(data.status).toBe("filled");
      expect(mockEx.createMarketOrder).toHaveBeenCalledWith(
        "BTC/USDT", "buy", 0.001, undefined, expect.any(Object)
      );
      expect(mockLogTrade).toHaveBeenCalledOnce();
    });

    it("places a limit order with price", async () => {
      const mockEx = createMockExchange();
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      const result = await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        side: "buy",
        type: "limit",
        amount: 0.001,
        price: 83000,
        reduceOnly: false,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.id).toBe("ord2");
      expect(mockEx.createLimitOrder).toHaveBeenCalledWith(
        "BTC/USDT", "buy", 0.001, 83000, expect.any(Object)
      );
    });

    it("returns error for limit order without price", async () => {
      const mockEx = createMockExchange();
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      const result = await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        side: "buy",
        type: "limit",
        amount: 0.001,
        reduceOnly: false,
      });

      expect(result.content[0].text).toContain("ERROR");
      expect(result.isError).toBe(true);
    });

    it("rejects unauthorized pair", async () => {
      const mockEx = createMockExchange();
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      const result = await handler({
        exchange: "binance",
        symbol: "DOGE/USDT",
        side: "buy",
        type: "market",
        amount: 100,
        reduceOnly: false,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("UNAUTHORIZED_PAIR");
    });

    it("rejects leverage exceeding max", async () => {
      const mockEx = createMockExchange();
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      const result = await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        side: "buy",
        type: "market",
        amount: 0.001,
        leverage: 10,
        reduceOnly: false,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("MAX_LEVERAGE_EXCEEDED");
    });

    it("rejects position exceeding max percentage", async () => {
      const mockEx = createMockExchange({
        fetchBalance: vi.fn().mockResolvedValue({
          total: { USDT: 50 },
          free: { USDT: 50 },
        }),
      });
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      // 0.001 BTC at $84500 = $84.5, which is > 20% of $50
      const result = await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        side: "buy",
        type: "market",
        amount: 0.001,
        reduceOnly: false,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("MAX_POSITION_SIZE");
    });

    it("rejects when max positions reached", async () => {
      const mockEx = createMockExchange({
        fetchPositions: vi.fn().mockResolvedValue([
          { contracts: 0.001 },
          { contracts: 0.002 },
          { contracts: 0.001 },
          { contracts: 0.003 },
          { contracts: 0.001 },
        ]),
      });
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      const result = await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        side: "buy",
        type: "market",
        amount: 0.0001,
        reduceOnly: false,
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("MAX_POSITIONS");
    });

    it("uses price from ticker when market order (no price)", async () => {
      const mockEx = createMockExchange();
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        side: "buy",
        type: "market",
        amount: 0.0001,
        reduceOnly: false,
      });

      expect(mockEx.fetchTicker).toHaveBeenCalledWith("BTC/USDT");
    });

    it("passes marginMode, stopLoss, takeProfit params", async () => {
      const mockEx = createMockExchange();
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        side: "sell",
        type: "market",
        amount: 0.0001,
        marginMode: "isolated",
        stopLoss: 90000,
        takeProfit: 80000,
        reduceOnly: true,
      });

      expect(mockEx.createMarketOrder).toHaveBeenCalledWith(
        "BTC/USDT", "sell", 0.0001, undefined,
        expect.objectContaining({
          marginMode: "isolated",
          reduceOnly: true,
          stopLoss: { triggerPrice: 90000 },
          takeProfit: { triggerPrice: 80000 },
        })
      );
    });

    it("handles fetchPositions failure gracefully (spot exchange)", async () => {
      const mockEx = createMockExchange({
        fetchPositions: vi.fn().mockRejectedValue(new Error("Not supported")),
      });
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      const result = await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        side: "buy",
        type: "market",
        amount: 0.0001,
        reduceOnly: false,
      });

      // Should succeed since position count defaults to 0 on error
      const data = JSON.parse(result.content[0].text);
      expect(data.id).toBe("ord1");
    });

    it("handles setLeverage failure gracefully", async () => {
      const mockEx = createMockExchange({
        setLeverage: vi.fn().mockRejectedValue(new Error("Not supported")),
      });
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      const result = await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        side: "buy",
        type: "market",
        amount: 0.0001,
        leverage: 2,
        reduceOnly: false,
      });

      // Should succeed despite setLeverage failure
      const data = JSON.parse(result.content[0].text);
      expect(data.id).toBe("ord1");
    });

    it("uses provided price for position value estimation", async () => {
      const mockEx = createMockExchange();
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        side: "buy",
        type: "limit",
        amount: 0.0001,
        price: 83000,
        reduceOnly: false,
      });

      // Should NOT call fetchTicker since price is provided
      expect(mockEx.fetchTicker).not.toHaveBeenCalled();
    });

    it("handles order response with null price/cost fields", async () => {
      const mockEx = createMockExchange({
        createMarketOrder: vi.fn().mockResolvedValue({
          id: "ord1", symbol: "BTC/USDT", side: "buy", type: "market",
          price: null, average: null, amount: 0.0001, cost: null,
          status: "filled", timestamp: null,
        }),
      });
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      const result = await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        side: "buy",
        type: "market",
        amount: 0.0001,
        reduceOnly: false,
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.price).toBe(84500); // falls back to estimatedPrice from ticker
    });

    it("sets leverage when specified", async () => {
      const mockEx = createMockExchange();
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("place_order")!;
      await handler({
        exchange: "binance",
        symbol: "BTC/USDT",
        side: "sell",
        type: "market",
        amount: 0.0001,
        leverage: 2,
        reduceOnly: false,
      });

      expect(mockEx.setLeverage).toHaveBeenCalledWith(2, "BTC/USDT");
    });
  });

  describe("cancel_order", () => {
    it("cancels order and logs it", async () => {
      const mockEx = createMockExchange();
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("cancel_order")!;
      const result = await handler({
        exchange: "binance",
        orderId: "ord1",
        symbol: "BTC/USDT",
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.status).toBe("canceled");
      expect(mockEx.cancelOrder).toHaveBeenCalledWith("ord1", "BTC/USDT");
      expect(mockLogTrade).toHaveBeenCalledOnce();
    });
  });

  describe("cancel_all_orders", () => {
    it("cancels all open orders", async () => {
      const mockEx = createMockExchange({
        fetchOpenOrders: vi.fn().mockResolvedValue([
          { id: "o1", symbol: "BTC/USDT" },
          { id: "o2", symbol: "BTC/USDT" },
        ]),
      });
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("cancel_all_orders")!;
      const result = await handler({ exchange: "binance" });

      const data = JSON.parse(result.content[0].text);
      expect(data.canceled).toBe(2);
      expect(mockEx.cancelOrder).toHaveBeenCalledTimes(2);
    });

    it("handles no open orders", async () => {
      const mockEx = createMockExchange();
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("cancel_all_orders")!;
      const result = await handler({ exchange: "binance" });

      const data = JSON.parse(result.content[0].text);
      expect(data.canceled).toBe(0);
    });
  });

  describe("close_position", () => {
    it("closes a long position with sell market order", async () => {
      const mockEx = createMockExchange({
        fetchPositions: vi.fn().mockResolvedValue([
          { symbol: "BTC/USDT", side: "long", contracts: 0.001, unrealizedPnl: 0.5 },
        ]),
        createMarketOrder: vi.fn().mockResolvedValue({ price: 84500, average: 84500 }),
      });
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("close_position")!;
      const result = await handler({ exchange: "binance", symbol: "BTC/USDT" });

      const data = JSON.parse(result.content[0].text);
      expect(data.side).toBe("long");
      expect(data.closedSize).toBe(0.001);
      expect(mockEx.createMarketOrder).toHaveBeenCalledWith(
        "BTC/USDT", "sell", 0.001, undefined, { reduceOnly: true }
      );
    });

    it("closes a short position with buy market order", async () => {
      const mockEx = createMockExchange({
        fetchPositions: vi.fn().mockResolvedValue([
          { symbol: "ETH/USDT", side: "short", contracts: 0.01, unrealizedPnl: -0.2 },
        ]),
      });
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("close_position")!;
      const result = await handler({ exchange: "binance", symbol: "ETH/USDT" });

      const data = JSON.parse(result.content[0].text);
      expect(data.side).toBe("short");
      expect(mockEx.createMarketOrder).toHaveBeenCalledWith(
        "ETH/USDT", "buy", 0.01, undefined, { reduceOnly: true }
      );
    });

    it("returns error when no position found", async () => {
      const mockEx = createMockExchange({
        fetchPositions: vi.fn().mockResolvedValue([]),
      });
      mockGetExchange.mockReturnValue(mockEx as any);

      const handler = tools.get("close_position")!;
      const result = await handler({ exchange: "binance", symbol: "BTC/USDT" });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("No open position found");
    });
  });
});
