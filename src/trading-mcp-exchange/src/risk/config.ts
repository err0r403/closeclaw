export interface RiskConfig {
  maxLeverage: number;
  maxPositionPct: number;
  maxOpenPositions: number;
  allowedPairs: string[];
  sessionMaxDrawdownPct: number;
  totalMaxDrawdownPct: number;
}

export function loadRiskConfig(): RiskConfig {
  return {
    maxLeverage: parseInt(process.env.RISK_MAX_LEVERAGE || "3", 10),
    maxPositionPct: parseInt(process.env.RISK_MAX_POSITION_PCT || "20", 10),
    maxOpenPositions: parseInt(process.env.RISK_MAX_OPEN_POSITIONS || "5", 10),
    allowedPairs: (process.env.RISK_ALLOWED_PAIRS || "BTC/USDT,ETH/USDT,SOL/USDT")
      .split(",")
      .map((p) => p.trim()),
    sessionMaxDrawdownPct: parseInt(process.env.RISK_SESSION_MAX_DRAWDOWN_PCT || "5", 10),
    totalMaxDrawdownPct: parseInt(process.env.RISK_TOTAL_MAX_DRAWDOWN_PCT || "15", 10),
  };
}
