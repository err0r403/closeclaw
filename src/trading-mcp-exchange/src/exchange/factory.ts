import ccxt, { type Exchange } from "ccxt";
import type { SupportedExchange } from "./types.js";

const exchangeInstances = new Map<string, Exchange>();

interface ExchangeKeys {
  apiKey: string;
  secret: string;
}

function getKeys(exchange: SupportedExchange): ExchangeKeys | null {
  const prefix = exchange.toUpperCase();
  const apiKey = process.env[`${prefix}_API_KEY`];
  const secret = process.env[`${prefix}_API_SECRET`];
  if (!apiKey || !secret) return null;
  return { apiKey, secret };
}

export function getExchange(name: SupportedExchange, requireAuth = false): Exchange {
  const cacheKey = `${name}:${requireAuth}`;

  if (exchangeInstances.has(cacheKey)) {
    return exchangeInstances.get(cacheKey)!;
  }

  const keys = getKeys(name);
  if (requireAuth && !keys) {
    throw new Error(
      `API keys not configured for ${name}. Set ${name.toUpperCase()}_API_KEY and ${name.toUpperCase()}_API_SECRET in .env`
    );
  }

  const ExchangeClass = (ccxt as Record<string, any>)[name];
  if (!ExchangeClass) {
    throw new Error(`Exchange "${name}" is not supported by CCXT`);
  }

  const config: Record<string, any> = {
    enableRateLimit: true,
  };

  if (keys) {
    config.apiKey = keys.apiKey;
    config.secret = keys.secret;
  }

  const instance = new ExchangeClass(config) as Exchange;
  exchangeInstances.set(cacheKey, instance);
  return instance;
}

const SUPPORTED: SupportedExchange[] = ["binance", "bybit", "hyperliquid", "blofin"];

export function isSupportedExchange(name: string): name is SupportedExchange {
  return SUPPORTED.includes(name as SupportedExchange);
}
