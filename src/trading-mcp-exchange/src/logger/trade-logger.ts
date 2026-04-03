import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_DIR = join(__dirname, "..", "..", "logs");
const LOG_FILE = join(LOG_DIR, "trades.jsonl");

export interface TradeLogEntry {
  timestamp: string;
  tool: string;
  exchange: string;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
  reason?: string;
}

let initialized = false;

function ensureLogDir(): void {
  if (!initialized) {
    mkdirSync(LOG_DIR, { recursive: true });
    initialized = true;
  }
}

export function logTrade(entry: TradeLogEntry): void {
  ensureLogDir();
  const line = JSON.stringify(entry) + "\n";
  appendFileSync(LOG_FILE, line, "utf-8");
}
