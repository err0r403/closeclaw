export interface TickerData {
  symbol: string;
  last: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  change24h: number;
  volume24h: number;
  timestamp: string;
}

export interface OrderBookData {
  bids: [number, number][];
  asks: [number, number][];
  spread: number;
  spreadPct: number;
}

export interface OHLCVCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FundingRateData {
  symbol: string;
  fundingRate: number;
  fundingTimestamp: string;
  nextFundingRate: number | null;
  nextFundingTimestamp: string | null;
  annualizedRate: number;
}

export interface MarketInfo {
  symbol: string;
  type: string;
  base: string;
  quote: string;
  active: boolean;
  minAmount: number | null;
  minCost: number | null;
  makerFee: number | null;
  takerFee: number | null;
}

export interface BalanceData {
  total: Record<string, number>;
  free: Record<string, number>;
  used: Record<string, number>;
}

export interface PositionData {
  symbol: string;
  side: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  liquidationPrice: number | null;
  leverage: number;
  marginType: string;
}

export interface OrderData {
  id: string;
  symbol: string;
  side: string;
  type: string;
  price: number | null;
  amount: number;
  filled: number;
  remaining: number;
  status: string;
  timestamp: string;
}

export interface TradeData {
  id: string;
  symbol: string;
  side: string;
  price: number;
  amount: number;
  cost: number;
  fee: number;
  timestamp: string;
}

export type SupportedExchange = "binance" | "bybit" | "hyperliquid" | "blofin";
