import { describe, it, expect } from "vitest";
import { validateTrade } from "../../src/risk/validator.js";
import type { RiskConfig } from "../../src/risk/config.js";

const defaultConfig: RiskConfig = {
  maxLeverage: 3,
  maxPositionPct: 20,
  maxOpenPositions: 5,
  allowedPairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
  sessionMaxDrawdownPct: 5,
  totalMaxDrawdownPct: 15,
};

describe("validateTrade", () => {
  it("passes valid trade with allowed pair", () => {
    const result = validateTrade(defaultConfig, { symbol: "BTC/USDT" });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("rejects unauthorized pair", () => {
    const result = validateTrade(defaultConfig, { symbol: "DOGE/USDT" });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("UNAUTHORIZED_PAIR");
    expect(result.error).toContain("DOGE/USDT");
  });

  it("rejects leverage exceeding max", () => {
    const result = validateTrade(defaultConfig, {
      symbol: "BTC/USDT",
      leverage: 5,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("MAX_LEVERAGE_EXCEEDED");
    expect(result.error).toContain("5x");
  });

  it("passes leverage within limit", () => {
    const result = validateTrade(defaultConfig, {
      symbol: "BTC/USDT",
      leverage: 2,
    });
    expect(result.valid).toBe(true);
  });

  it("passes leverage exactly at limit", () => {
    const result = validateTrade(defaultConfig, {
      symbol: "BTC/USDT",
      leverage: 3,
    });
    expect(result.valid).toBe(true);
  });

  it("rejects position exceeding max percentage", () => {
    const result = validateTrade(defaultConfig, {
      symbol: "ETH/USDT",
      positionValueUsd: 30,
      totalBalanceUsd: 100,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("MAX_POSITION_SIZE");
    expect(result.error).toContain("30.0%");
  });

  it("passes position within percentage limit", () => {
    const result = validateTrade(defaultConfig, {
      symbol: "ETH/USDT",
      positionValueUsd: 15,
      totalBalanceUsd: 100,
    });
    expect(result.valid).toBe(true);
  });

  it("passes position check when balance is zero", () => {
    const result = validateTrade(defaultConfig, {
      symbol: "ETH/USDT",
      positionValueUsd: 15,
      totalBalanceUsd: 0,
    });
    expect(result.valid).toBe(true);
  });

  it("skips position check when values not provided", () => {
    const result = validateTrade(defaultConfig, {
      symbol: "BTC/USDT",
    });
    expect(result.valid).toBe(true);
  });

  it("rejects when max open positions reached", () => {
    const result = validateTrade(defaultConfig, {
      symbol: "BTC/USDT",
      currentOpenPositions: 5,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("MAX_POSITIONS");
  });

  it("passes when open positions below limit", () => {
    const result = validateTrade(defaultConfig, {
      symbol: "BTC/USDT",
      currentOpenPositions: 4,
    });
    expect(result.valid).toBe(true);
  });

  it("checks rules in order: pair first", () => {
    const result = validateTrade(defaultConfig, {
      symbol: "SHIB/USDT",
      leverage: 10,
      positionValueUsd: 100,
      totalBalanceUsd: 50,
      currentOpenPositions: 10,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("UNAUTHORIZED_PAIR");
  });

  it("checks leverage before position size", () => {
    const result = validateTrade(defaultConfig, {
      symbol: "BTC/USDT",
      leverage: 10,
      positionValueUsd: 100,
      totalBalanceUsd: 50,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("MAX_LEVERAGE_EXCEEDED");
  });
});
