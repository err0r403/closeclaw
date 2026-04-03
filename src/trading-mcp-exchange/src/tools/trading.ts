import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getExchange, isSupportedExchange } from "../exchange/factory.js";
import { loadRiskConfig } from "../risk/config.js";
import { validateTrade } from "../risk/validator.js";
import { logTrade } from "../logger/trade-logger.js";

const ExchangeParam = z.string().describe("Exchange name: binance, bybit, hyperliquid, blofin");
const SymbolParam = z.string().describe("Trading pair, e.g. BTC/USDT");

function validateExchange(name: string): void {
  if (!isSupportedExchange(name)) {
    throw new Error(`Unsupported exchange: ${name}. Supported: binance, bybit, hyperliquid, blofin`);
  }
}

function textResult(data: unknown): { content: { type: "text"; text: string }[] } {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(message: string): { content: { type: "text"; text: string }[]; isError: true } {
  return { content: [{ type: "text" as const, text: `ERROR: ${message}` }], isError: true };
}

export function registerTradingTools(server: McpServer): void {
  server.tool(
    "place_order",
    "Place a market or limit order (spot or perpetual). Validates against risk limits.",
    {
      exchange: ExchangeParam,
      symbol: SymbolParam,
      side: z.enum(["buy", "sell"]).describe("Order side"),
      type: z.enum(["market", "limit"]).describe("Order type"),
      amount: z.number().positive().describe("Amount in base currency (e.g. 0.001 for BTC)"),
      price: z.number().positive().optional().describe("Price for limit orders"),
      marginMode: z.enum(["cross", "isolated"]).optional().describe("Margin mode for perps"),
      leverage: z.number().positive().optional().describe("Leverage for perps (max 3x)"),
      reduceOnly: z.boolean().optional().default(false).describe("Reduce-only order"),
      stopLoss: z.number().positive().optional().describe("Stop loss price"),
      takeProfit: z.number().positive().optional().describe("Take profit price"),
    },
    async (input) => {
      const { exchange, symbol, side, type, amount, price, marginMode, leverage, reduceOnly, stopLoss, takeProfit } = input;

      validateExchange(exchange);
      const riskConfig = loadRiskConfig();

      // Get exchange instance and current state for risk validation
      const ex = getExchange(exchange as any, true);

      // Estimate position value
      let estimatedPrice = price;
      if (!estimatedPrice) {
        const ticker = await ex.fetchTicker(symbol);
        estimatedPrice = ticker.last ?? 0;
      }
      const positionValueUsd = amount * estimatedPrice;

      // Get current balance for risk checks
      const balance = await ex.fetchBalance();
      const totalUsd =
        (balance.total as unknown as Record<string, number>)["USDT"] ?? 0;

      // Get current open positions count
      let openPositionCount = 0;
      try {
        const positions = await ex.fetchPositions();
        openPositionCount = positions.filter(
          (p: any) => Math.abs(p.contracts ?? 0) > 0
        ).length;
      } catch {
        // Some exchanges don't support fetchPositions for spot
      }

      // Risk validation
      const validation = validateTrade(riskConfig, {
        symbol,
        leverage,
        positionValueUsd,
        totalBalanceUsd: totalUsd,
        currentOpenPositions: openPositionCount,
      });

      if (!validation.valid) {
        return errorResult(validation.error!);
      }

      // Build params
      const params: Record<string, any> = {};
      if (marginMode) params.marginMode = marginMode;
      if (reduceOnly) params.reduceOnly = true;
      if (stopLoss) params.stopLoss = { triggerPrice: stopLoss };
      if (takeProfit) params.takeProfit = { triggerPrice: takeProfit };

      // Set leverage if specified
      if (leverage) {
        try {
          await ex.setLeverage(leverage, symbol);
        } catch {
          // Some exchanges set leverage differently
        }
      }

      // Execute order
      let order;
      if (type === "market") {
        // Some exchanges (Hyperliquid) require price for market orders to calculate max slippage
        // Pass estimatedPrice as the slippage cap
        order = await ex.createOrder(symbol, "market", side, amount, estimatedPrice, params);
      } else {
        if (!price) {
          return errorResult("Price is required for limit orders");
        }
        order = await ex.createOrder(symbol, "limit", side, amount, price, params);
      }

      const result = {
        id: order.id,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        price: order.price ?? order.average ?? estimatedPrice,
        amount: order.amount,
        cost: order.cost ?? (order.amount * (order.price ?? estimatedPrice)),
        status: order.status,
        timestamp: new Date(order.timestamp ?? Date.now()).toISOString(),
      };

      logTrade({
        timestamp: new Date().toISOString(),
        tool: "place_order",
        exchange,
        input: { symbol, side, type, amount, price, leverage, marginMode },
        result,
      });

      return textResult(result);
    }
  );

  server.tool(
    "cancel_order",
    "Cancel a specific open order",
    {
      exchange: ExchangeParam,
      orderId: z.string().describe("Order ID to cancel"),
      symbol: SymbolParam,
    },
    async ({ exchange, orderId, symbol }) => {
      validateExchange(exchange);
      const ex = getExchange(exchange as any, true);

      const result = await ex.cancelOrder(orderId, symbol);

      logTrade({
        timestamp: new Date().toISOString(),
        tool: "cancel_order",
        exchange,
        input: { orderId, symbol },
        result: { id: result.id, status: "canceled", symbol },
      });

      return textResult({ id: result.id, status: "canceled", symbol });
    }
  );

  server.tool(
    "cancel_all_orders",
    "Cancel all open orders, optionally filtered by symbol",
    {
      exchange: ExchangeParam,
      symbol: SymbolParam.optional().describe("Filter by symbol, or omit to cancel all"),
    },
    async ({ exchange, symbol }) => {
      validateExchange(exchange);
      const ex = getExchange(exchange as any, true);

      const openOrders = await ex.fetchOpenOrders(symbol);
      const canceled: { id: string; symbol: string }[] = [];

      for (const order of openOrders) {
        await ex.cancelOrder(order.id, order.symbol);
        canceled.push({ id: order.id, symbol: order.symbol });
      }

      logTrade({
        timestamp: new Date().toISOString(),
        tool: "cancel_all_orders",
        exchange,
        input: { symbol: symbol ?? "ALL" },
        result: { canceled: canceled.length, orders: canceled },
      });

      return textResult({ canceled: canceled.length, orders: canceled });
    }
  );

  server.tool(
    "close_position",
    "Close an open perpetual position completely using a market order",
    {
      exchange: ExchangeParam,
      symbol: SymbolParam,
    },
    async ({ exchange, symbol }) => {
      validateExchange(exchange);
      const ex = getExchange(exchange as any, true);

      // Find the position
      const positions = await ex.fetchPositions([symbol]);
      const position = positions.find(
        (p: any) => p.symbol === symbol && Math.abs(p.contracts ?? 0) > 0
      );

      if (!position) {
        return errorResult(`No open position found for ${symbol}`);
      }

      const side = position.side === "long" ? "sell" : "buy";
      const size = Math.abs(position.contracts ?? 0);

      // Use createOrder with price for exchanges that require slippage calc (Hyperliquid)
      const ticker = await ex.fetchTicker(symbol);
      const closePrice = ticker.last ?? 0;

      const order = await ex.createOrder(symbol, "market", side, size, closePrice, {
        reduceOnly: true,
      });

      const result = {
        symbol,
        side: position.side,
        closedSize: size,
        realizedPnl: position.unrealizedPnl ?? 0,
        closePrice: order.price ?? order.average ?? 0,
      };

      logTrade({
        timestamp: new Date().toISOString(),
        tool: "close_position",
        exchange,
        input: { symbol },
        result,
      });

      return textResult(result);
    }
  );
}
