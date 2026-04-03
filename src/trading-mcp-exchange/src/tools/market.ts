import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getExchange, isSupportedExchange } from "../exchange/factory.js";
import type {
  TickerData,
  OrderBookData,
  OHLCVCandle,
  FundingRateData,
  MarketInfo,
} from "../exchange/types.js";

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

export function registerMarketTools(server: McpServer): void {
  server.tool(
    "get_ticker",
    "Get current price, 24h change, and volume for a trading pair",
    {
      exchange: ExchangeParam,
      symbol: SymbolParam,
    },
    async ({ exchange, symbol }) => {
      validateExchange(exchange);
      const ex = getExchange(exchange as any);
      const ticker = await ex.fetchTicker(symbol);

      const data: TickerData = {
        symbol: ticker.symbol,
        last: ticker.last ?? 0,
        bid: ticker.bid ?? 0,
        ask: ticker.ask ?? 0,
        high: ticker.high ?? 0,
        low: ticker.low ?? 0,
        change24h: ticker.percentage ?? 0,
        volume24h: ticker.quoteVolume ?? 0,
        timestamp: new Date(ticker.timestamp ?? Date.now()).toISOString(),
      };

      return textResult(data);
    }
  );

  server.tool(
    "get_orderbook",
    "Get order book depth with bids, asks, and spread",
    {
      exchange: ExchangeParam,
      symbol: SymbolParam,
      depth: z.number().optional().default(10).describe("Number of levels (default 10)"),
    },
    async ({ exchange, symbol, depth }) => {
      validateExchange(exchange);
      const ex = getExchange(exchange as any);
      const book = await ex.fetchOrderBook(symbol, depth);

      const bestBid = book.bids[0]?.[0] ?? 0;
      const bestAsk = book.asks[0]?.[0] ?? 0;
      const spread = bestAsk - bestBid;
      const spreadPct = bestBid > 0 ? (spread / bestBid) * 100 : 0;

      const data: OrderBookData = {
        bids: book.bids.slice(0, depth) as [number, number][],
        asks: book.asks.slice(0, depth) as [number, number][],
        spread: parseFloat(spread.toFixed(8)),
        spreadPct: parseFloat(spreadPct.toFixed(6)),
      };

      return textResult(data);
    }
  );

  server.tool(
    "get_ohlcv",
    "Get historical OHLCV candles for a trading pair",
    {
      exchange: ExchangeParam,
      symbol: SymbolParam,
      timeframe: z
        .string()
        .optional()
        .default("1h")
        .describe("Candle timeframe: 1m, 5m, 15m, 1h, 4h, 1d"),
      limit: z.number().optional().default(100).describe("Number of candles (default 100)"),
    },
    async ({ exchange, symbol, timeframe, limit }) => {
      validateExchange(exchange);
      const ex = getExchange(exchange as any);
      const candles = await ex.fetchOHLCV(symbol, timeframe, undefined, limit);

      const data: OHLCVCandle[] = candles.map((c: any) => ({
        timestamp: new Date(c[0]).toISOString(),
        open: c[1],
        high: c[2],
        low: c[3],
        close: c[4],
        volume: c[5],
      }));

      return textResult(data);
    }
  );

  server.tool(
    "get_funding_rate",
    "Get current and predicted funding rate for a perpetual contract. Critical for Cash & Carry strategy.",
    {
      exchange: ExchangeParam,
      symbol: SymbolParam,
    },
    async ({ exchange, symbol }) => {
      validateExchange(exchange);
      const ex = getExchange(exchange as any);

      const fundingRate = await ex.fetchFundingRate(symbol);

      const rate = fundingRate.fundingRate ?? 0;
      // 3 funding events per day * 365 days
      const annualized = rate * 3 * 365 * 100;

      const data: FundingRateData = {
        symbol: fundingRate.symbol,
        fundingRate: rate,
        fundingTimestamp: fundingRate.fundingDatetime ?? new Date().toISOString(),
        nextFundingRate: fundingRate.nextFundingRate ?? null,
        nextFundingTimestamp: fundingRate.nextFundingDatetime ?? null,
        annualizedRate: parseFloat(annualized.toFixed(2)),
      };

      return textResult(data);
    }
  );

  server.tool(
    "get_markets",
    "List available markets on an exchange, optionally filtered by type",
    {
      exchange: ExchangeParam,
      type: z
        .enum(["spot", "margin", "swap", "future"])
        .optional()
        .describe("Filter by market type"),
    },
    async ({ exchange, type }) => {
      validateExchange(exchange);
      const ex = getExchange(exchange as any);
      await ex.loadMarkets();

      let markets = Object.values(ex.markets);
      if (type) {
        markets = markets.filter((m: any) => m.type === type);
      }

      // Only return USDT-quoted markets to keep output manageable
      markets = markets.filter((m: any) => m.quote === "USDT" && m.active);

      const data: MarketInfo[] = markets.slice(0, 50).map((m: any) => ({
        symbol: m.symbol,
        type: m.type,
        base: m.base,
        quote: m.quote,
        active: m.active,
        minAmount: m.limits?.amount?.min ?? null,
        minCost: m.limits?.cost?.min ?? null,
        makerFee: m.maker ?? null,
        takerFee: m.taker ?? null,
      }));

      return textResult(data);
    }
  );
}
