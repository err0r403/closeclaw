import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync, existsSync, rmSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_DIR = join(__dirname, "..", "..", "logs");
const LOG_FILE = join(LOG_DIR, "trades.jsonl");

describe("logTrade", () => {
  beforeEach(() => {
    // Clean up log file before each test
    if (existsSync(LOG_FILE)) {
      rmSync(LOG_FILE);
    }
  });

  afterEach(() => {
    // Reset module cache so `initialized` flag resets
    vi.resetModules();
    if (existsSync(LOG_FILE)) {
      rmSync(LOG_FILE);
    }
  });

  it("creates log directory and writes JSONL entry", async () => {
    const { logTrade } = await import("../../src/logger/trade-logger.js");

    const entry = {
      timestamp: "2026-04-02T23:00:00Z",
      tool: "place_order",
      exchange: "binance",
      input: { symbol: "BTC/USDT", side: "buy" },
      result: { id: "123", status: "filled" },
    };

    logTrade(entry);

    expect(existsSync(LOG_FILE)).toBe(true);
    const content = readFileSync(LOG_FILE, "utf-8");
    const parsed = JSON.parse(content.trim());
    expect(parsed.tool).toBe("place_order");
    expect(parsed.exchange).toBe("binance");
    expect(parsed.input.symbol).toBe("BTC/USDT");
  });

  it("appends multiple entries as separate lines", async () => {
    const { logTrade } = await import("../../src/logger/trade-logger.js");

    logTrade({
      timestamp: "2026-04-02T23:00:00Z",
      tool: "place_order",
      exchange: "binance",
      input: { symbol: "BTC/USDT" },
      result: { id: "1" },
    });

    logTrade({
      timestamp: "2026-04-02T23:01:00Z",
      tool: "cancel_order",
      exchange: "binance",
      input: { orderId: "1" },
      result: { status: "canceled" },
    });

    const content = readFileSync(LOG_FILE, "utf-8");
    const lines = content.trim().split("\n");
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0]).tool).toBe("place_order");
    expect(JSON.parse(lines[1]).tool).toBe("cancel_order");
  });

  it("includes optional reason field", async () => {
    const { logTrade } = await import("../../src/logger/trade-logger.js");

    logTrade({
      timestamp: "2026-04-02T23:00:00Z",
      tool: "place_order",
      exchange: "binance",
      input: {},
      result: {},
      reason: "Cash & carry: opening spot leg",
    });

    const content = readFileSync(LOG_FILE, "utf-8");
    const parsed = JSON.parse(content.trim());
    expect(parsed.reason).toBe("Cash & carry: opening spot leg");
  });
});
