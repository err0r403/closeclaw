import type { RiskConfig } from "./config.js";

export interface TradeValidation {
  valid: boolean;
  error?: string;
}

export function validateTrade(
  config: RiskConfig,
  params: {
    symbol: string;
    leverage?: number;
    positionValueUsd?: number;
    totalBalanceUsd?: number;
    currentOpenPositions?: number;
  }
): TradeValidation {
  if (!config.allowedPairs.includes(params.symbol)) {
    return {
      valid: false,
      error: `UNAUTHORIZED_PAIR: ${params.symbol} not in whitelist [${config.allowedPairs.join(", ")}]`,
    };
  }

  if (params.leverage && params.leverage > config.maxLeverage) {
    return {
      valid: false,
      error: `MAX_LEVERAGE_EXCEEDED: max ${config.maxLeverage}x, got ${params.leverage}x`,
    };
  }

  if (
    params.positionValueUsd &&
    params.totalBalanceUsd &&
    params.totalBalanceUsd > 0
  ) {
    const pct = (params.positionValueUsd / params.totalBalanceUsd) * 100;
    if (pct > config.maxPositionPct) {
      return {
        valid: false,
        error: `MAX_POSITION_SIZE: would use ${pct.toFixed(1)}% of balance (max ${config.maxPositionPct}%)`,
      };
    }
  }

  if (
    params.currentOpenPositions !== undefined &&
    params.currentOpenPositions >= config.maxOpenPositions
  ) {
    return {
      valid: false,
      error: `MAX_POSITIONS: already have ${params.currentOpenPositions} open (max ${config.maxOpenPositions})`,
    };
  }

  return { valid: true };
}
