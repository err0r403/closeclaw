import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadRiskConfig } from "../../src/risk/config.js";

describe("loadRiskConfig", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns default values when no env vars set", () => {
    delete process.env.RISK_MAX_LEVERAGE;
    delete process.env.RISK_MAX_POSITION_PCT;
    delete process.env.RISK_MAX_OPEN_POSITIONS;
    delete process.env.RISK_ALLOWED_PAIRS;
    delete process.env.RISK_SESSION_MAX_DRAWDOWN_PCT;
    delete process.env.RISK_TOTAL_MAX_DRAWDOWN_PCT;

    const config = loadRiskConfig();

    expect(config.maxLeverage).toBe(3);
    expect(config.maxPositionPct).toBe(20);
    expect(config.maxOpenPositions).toBe(5);
    expect(config.allowedPairs).toEqual(["BTC/USDT", "ETH/USDT", "SOL/USDT"]);
    expect(config.sessionMaxDrawdownPct).toBe(5);
    expect(config.totalMaxDrawdownPct).toBe(15);
  });

  it("reads values from environment variables", () => {
    process.env.RISK_MAX_LEVERAGE = "5";
    process.env.RISK_MAX_POSITION_PCT = "30";
    process.env.RISK_MAX_OPEN_POSITIONS = "10";
    process.env.RISK_ALLOWED_PAIRS = "BTC/USDT,DOGE/USDT";
    process.env.RISK_SESSION_MAX_DRAWDOWN_PCT = "10";
    process.env.RISK_TOTAL_MAX_DRAWDOWN_PCT = "25";

    const config = loadRiskConfig();

    expect(config.maxLeverage).toBe(5);
    expect(config.maxPositionPct).toBe(30);
    expect(config.maxOpenPositions).toBe(10);
    expect(config.allowedPairs).toEqual(["BTC/USDT", "DOGE/USDT"]);
    expect(config.sessionMaxDrawdownPct).toBe(10);
    expect(config.totalMaxDrawdownPct).toBe(25);
  });

  it("trims whitespace from allowed pairs", () => {
    process.env.RISK_ALLOWED_PAIRS = "BTC/USDT , ETH/USDT , SOL/USDT";
    const config = loadRiskConfig();
    expect(config.allowedPairs).toEqual(["BTC/USDT", "ETH/USDT", "SOL/USDT"]);
  });
});
