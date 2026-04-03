import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getExchange, isSupportedExchange } from "../../src/exchange/factory.js";

describe("isSupportedExchange", () => {
  it("returns true for binance", () => {
    expect(isSupportedExchange("binance")).toBe(true);
  });

  it("returns true for bybit", () => {
    expect(isSupportedExchange("bybit")).toBe(true);
  });

  it("returns true for hyperliquid", () => {
    expect(isSupportedExchange("hyperliquid")).toBe(true);
  });

  it("returns true for blofin", () => {
    expect(isSupportedExchange("blofin")).toBe(true);
  });

  it("returns false for unsupported exchange", () => {
    expect(isSupportedExchange("ftx")).toBe(false);
    expect(isSupportedExchange("")).toBe(false);
    expect(isSupportedExchange("kraken")).toBe(false);
  });
});

describe("getExchange", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("creates a binance exchange instance without auth", () => {
    const ex = getExchange("binance", false);
    expect(ex).toBeDefined();
    expect(ex.id).toBe("binance");
  });

  it("throws when auth required but no keys", () => {
    delete process.env.BINANCE_API_KEY;
    delete process.env.BINANCE_API_SECRET;

    // Need a fresh instance (not cached)
    expect(() => getExchange("binance", true)).toThrow("API keys not configured");
  });

  it("creates authenticated instance when keys present", () => {
    process.env.BYBIT_API_KEY = "test-key";
    process.env.BYBIT_API_SECRET = "test-secret";

    const ex = getExchange("bybit", true);
    expect(ex).toBeDefined();
    expect(ex.id).toBe("bybit");
  });

  it("caches exchange instances", () => {
    const ex1 = getExchange("blofin", false);
    const ex2 = getExchange("blofin", false);
    expect(ex1).toBe(ex2);
  });

  it("separate cache for auth vs non-auth", () => {
    process.env.HYPERLIQUID_API_KEY = "key";
    process.env.HYPERLIQUID_API_SECRET = "secret";

    const noAuth = getExchange("hyperliquid", false);
    const auth = getExchange("hyperliquid", true);
    expect(noAuth).not.toBe(auth);
  });
});
