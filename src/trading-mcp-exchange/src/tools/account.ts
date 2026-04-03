import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getExchange, isSupportedExchange } from "../exchange/factory.js";
import type { BalanceData, PositionData, OrderData, TradeData } from "../exchange/types.js";

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

function filterSmallBalances(balances: Record<string, number>): Record<string, number> {
  const filtered: Record<string, number> = {};
  for (const [asset, amount] of Object.entries(balances)) {
    if (amount > 0.00001) {
      filtered[asset] = amount;
    }
  }
  return filtered;
}

export function registerAccountTools(server: McpServer): void {
  server.tool(
    "get_balance",
    "Get account balances per asset. Requires API key.",
    {
      exchange: ExchangeParam,
      type: z
        .enum(["spot", "margin", "swap"])
        .optional()
        .describe("Account type (default: all)"),
    },
    async ({ exchange, type }) => {
      validateExchange(exchange);
      const ex = getExchange(exchange as any, true);

      const params: Record<string, string> = {};
      if (type) params.type = type;

      const balance = await ex.fetchBalance(params);

      const data: BalanceData = {
        total: filterSmallBalances(balance.total as unknown as Record<string, number>),
        free: filterSmallBalances(balance.free as unknown as Record<string, number>),
        used: filterSmallBalances(balance.used as unknown as Record<string, number>),
      };

      return textResult(data);
    }
  );

  server.tool(
    "get_positions",
    "Get open perpetual/futures positions. Requires API key.",
    {
      exchange: ExchangeParam,
      symbol: SymbolParam.optional().describe("Filter by symbol, or omit for all"),
    },
    async ({ exchange, symbol }) => {
      validateExchange(exchange);
      const ex = getExchange(exchange as any, true);

      const symbols = symbol ? [symbol] : undefined;
      const positions = await ex.fetchPositions(symbols);

      const data: PositionData[] = positions
        .filter((p: any) => Math.abs(p.contracts ?? 0) > 0)
        .map((p: any) => ({
          symbol: p.symbol,
          side: p.side,
          size: p.contracts ?? 0,
          entryPrice: p.entryPrice ?? 0,
          markPrice: p.markPrice ?? 0,
          unrealizedPnl: p.unrealizedPnl ?? 0,
          liquidationPrice: p.liquidationPrice ?? null,
          leverage: p.leverage ?? 1,
          marginType: p.marginMode ?? "unknown",
        }));

      return textResult(data);
    }
  );

  server.tool(
    "get_open_orders",
    "Get pending/open orders. Requires API key.",
    {
      exchange: ExchangeParam,
      symbol: SymbolParam.optional().describe("Filter by symbol, or omit for all"),
    },
    async ({ exchange, symbol }) => {
      validateExchange(exchange);
      const ex = getExchange(exchange as any, true);

      const orders = await ex.fetchOpenOrders(symbol);

      const data: OrderData[] = orders.map((o: any) => ({
        id: o.id,
        symbol: o.symbol,
        side: o.side,
        type: o.type,
        price: o.price,
        amount: o.amount,
        filled: o.filled ?? 0,
        remaining: o.remaining ?? o.amount,
        status: o.status,
        timestamp: new Date(o.timestamp ?? Date.now()).toISOString(),
      }));

      return textResult(data);
    }
  );

  server.tool(
    "get_trades",
    "Get recent trade history for a symbol. Requires API key.",
    {
      exchange: ExchangeParam,
      symbol: SymbolParam,
      limit: z.number().optional().default(20).describe("Number of trades (default 20)"),
    },
    async ({ exchange, symbol, limit }) => {
      validateExchange(exchange);
      const ex = getExchange(exchange as any, true);

      const trades = await ex.fetchMyTrades(symbol, undefined, limit);

      const data: TradeData[] = trades.map((t: any) => ({
        id: t.id,
        symbol: t.symbol,
        side: t.side,
        price: t.price,
        amount: t.amount,
        cost: t.cost ?? t.price * t.amount,
        fee: t.fee?.cost ?? 0,
        timestamp: new Date(t.timestamp ?? Date.now()).toISOString(),
      }));

      return textResult(data);
    }
  );
}
