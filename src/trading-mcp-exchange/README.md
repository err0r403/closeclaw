# trading-mcp-exchange

> Track: [trading](../../tracks/trading/README.md) | Status: dev | Branch: master

MCP server that gives CloseClaw (Claude) direct access to crypto exchanges. Read market data, manage positions, execute trades — all from within a Claude Code session.

## Quick Start

```bash
cd src/trading-mcp-exchange
npm install
cp .env.example .env  # Fill in API keys
npm run build
npm start             # Starts MCP server on stdio
```

## Tools

### Market Data (no auth required)
- `get_ticker` — Price, 24h change, volume
- `get_orderbook` — Bid/ask depth, spread
- `get_ohlcv` — Historical candles
- `get_funding_rate` — Perpetual funding rates (critical for Cash & Carry)
- `get_markets` — Available trading pairs

### Account (requires API key)
- `get_balance` — Balances per asset
- `get_positions` — Open perpetual positions
- `get_open_orders` — Pending orders
- `get_trades` — Recent trade history

### Trading (requires API key with trade permission)
- `place_order` — Market or limit order (spot/perps)
- `cancel_order` — Cancel specific order
- `cancel_all_orders` — Cancel all orders
- `close_position` — Close perpetual position

## Risk Management

Hard-coded limits in `.env` (not modifiable by the agent):
- Max leverage: 3x
- Max position size: 20% of balance
- Max open positions: 5
- Allowed pairs: BTC/USDT, ETH/USDT, SOL/USDT
- Session max drawdown: 5%
- Total max drawdown: 15%

## Claude Code Config

Add to your MCP settings:
```json
{
  "mcpServers": {
    "trading-exchange": {
      "command": "node",
      "args": ["/path/to/src/trading-mcp-exchange/dist/index.js"]
    }
  }
}
```
