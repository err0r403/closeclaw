# Spec: MCP Server Exchange (`trading-mcp-exchange`)

> **Track:** [trading](README.md)
> **Tipo:** MCP Server (stdio transport)
> **Stack:** TypeScript + CCXT + @modelcontextprotocol/sdk
> **Propósito:** Dar a CloseClaw (Claude) ojos y manos para operar exchanges de crypto

---

## 1. Resumen

Un MCP server que expone herramientas (tools) para que CloseClaw pueda, desde cualquier sesión de Claude Code:

- **Ver** precios, orderbooks, velas, funding rates, balances, posiciones
- **Operar** comprar, vender, abrir/cerrar posiciones, cancelar órdenes
- **Monitorear** estado de cuenta, P&L, órdenes abiertas

El server usa CCXT como capa de abstracción. Soportar un exchange nuevo es agregar configuración, no código.

---

## 2. Arquitectura

```
Claude Code (CloseClaw)
    │
    │ MCP Protocol (stdio, JSON-RPC)
    │
    ▼
┌─────────────────────────┐
│  trading-mcp-exchange    │
│                         │
│  ┌───────────────────┐  │
│  │   MCP Tool Layer  │  │  ← Define tools, valida inputs (Zod), formatea outputs
│  └─────────┬─────────┘  │
│            │             │
│  ┌─────────▼─────────┐  │
│  │   Exchange Layer   │  │  ← CCXT: conecta a exchanges, ejecuta operaciones
│  └─────────┬─────────┘  │
│            │             │
│  ┌─────────▼─────────┐  │
│  │   Config / Auth    │  │  ← .env: API keys, exchange config, risk limits
│  └───────────────────┘  │
└─────────────────────────┘
    │
    ▼
Exchanges (Binance, Bybit, Hyperliquid, Blofin)
```

---

## 3. Tools — Definición Completa

### 3.1 Market Data (read-only, no requiere API key con permisos de trading)

#### `get_ticker`
Precio actual, cambio 24h, volumen.
```
Input:  { exchange: string, symbol: string }
Output: { symbol, last, bid, ask, high, low, change24h, volume24h, timestamp }
```
**Uso:** "¿A cuánto está BTC ahora en Binance?"

#### `get_orderbook`
Profundidad del libro de órdenes.
```
Input:  { exchange: string, symbol: string, depth?: number (default 10) }
Output: { bids: [[price, amount], ...], asks: [[price, amount], ...], spread, spreadPct }
```
**Uso:** "¿Cuál es el spread de ETH en Bybit?" / "¿Hay paredes en el orderbook?"

#### `get_ohlcv`
Velas históricas.
```
Input:  { exchange: string, symbol: string, timeframe: string (1m/5m/1h/4h/1d), limit?: number (default 100) }
Output: [{ timestamp, open, high, low, close, volume }, ...]
```
**Uso:** "Dame las últimas 50 velas de 4h de BTC/USDT"

#### `get_funding_rate`
Tasa de financiación actual y predicha (perpetuos).
```
Input:  { exchange: string, symbol: string }
Output: { symbol, fundingRate, fundingTimestamp, nextFundingRate?, nextFundingTimestamp?, annualizedRate }
```
**Uso:** "¿Cuánto pagan los longs de BTC en Binance?" — **Crítico para Cash & Carry**

#### `get_markets`
Lista de mercados disponibles en un exchange.
```
Input:  { exchange: string, type?: "spot" | "margin" | "swap" | "future" }
Output: [{ symbol, type, base, quote, active, minAmount, minCost, makerFee, takerFee }, ...]
```
**Uso:** "¿Qué pares de perps tiene Binance?"

### 3.2 Account (read-only, requiere API key)

#### `get_balance`
Balances por activo.
```
Input:  { exchange: string, type?: "spot" | "margin" | "swap" }
Output: { total: { USDT: x, BTC: y, ... }, free: { ... }, used: { ... } }
```
**Uso:** "¿Cuánto tengo disponible en Binance?"

#### `get_positions`
Posiciones abiertas en perpetuos/futuros.
```
Input:  { exchange: string, symbol?: string }
Output: [{ symbol, side, size, entryPrice, markPrice, unrealizedPnl, liquidationPrice, leverage, marginType }, ...]
```
**Uso:** "¿Tengo posiciones abiertas?"

#### `get_open_orders`
Órdenes pendientes.
```
Input:  { exchange: string, symbol?: string }
Output: [{ id, symbol, side, type, price, amount, filled, remaining, status, timestamp }, ...]
```
**Uso:** "¿Hay órdenes sin ejecutar?"

#### `get_trades`
Historial de trades recientes.
```
Input:  { exchange: string, symbol: string, limit?: number (default 20) }
Output: [{ id, symbol, side, price, amount, cost, fee, timestamp }, ...]
```
**Uso:** "¿Qué trades hice hoy en ETH?"

### 3.3 Trading (write, requiere API key con permisos de trading)

#### `place_order`
Colocar orden (market o limit, spot o perps).
```
Input:  {
  exchange: string,
  symbol: string,
  side: "buy" | "sell",
  type: "market" | "limit",
  amount: number,
  price?: number (requerido si type = "limit"),
  params?: {
    marginMode?: "cross" | "isolated",
    leverage?: number (max 3),
    reduceOnly?: boolean,
    stopLoss?: number,
    takeProfit?: number
  }
}
Output: { id, symbol, side, type, price, amount, cost, status, timestamp }
```
**Uso:** "Compra 0.001 BTC spot en Binance a market" / "Abre short de 0.01 ETH en perps con leverage 2x"

**Validaciones hard-coded:**
- `leverage` no puede exceder 3
- `amount * price` no puede exceder 20% del balance total
- Pares no autorizados son rechazados

#### `cancel_order`
Cancelar una orden específica.
```
Input:  { exchange: string, orderId: string, symbol: string }
Output: { id, status: "canceled", symbol }
```

#### `cancel_all_orders`
Cancelar todas las órdenes de un par (o todas).
```
Input:  { exchange: string, symbol?: string }
Output: { canceled: number, orders: [{ id, symbol }, ...] }
```

#### `close_position`
Cerrar una posición de perpetuos completamente.
```
Input:  { exchange: string, symbol: string }
Output: { symbol, side, closedSize, realizedPnl, closePrice }
```
**Uso:** "Cierra mi short de BTC en Binance"

---

## 4. Seguridad y Risk Management Embebido

### 4.1 Validaciones en cada trade

| Regla | Implementación | Error si viola |
|-------|---------------|----------------|
| Par autorizado | Whitelist en config: BTC/USDT, ETH/USDT, SOL/USDT | `UNAUTHORIZED_PAIR: {symbol} not in whitelist` |
| Max leverage | Hard cap 3x en `place_order` | `MAX_LEVERAGE_EXCEEDED: max 3x, got {n}x` |
| Max position size | 20% del balance total | `MAX_POSITION_SIZE: would use {pct}% of balance (max 20%)` |
| Max open positions | 5 simultáneas | `MAX_POSITIONS: already have {n} open (max 5)` |

### 4.2 Config de riesgo (en .env, NO modificable por el agente)

```env
RISK_MAX_LEVERAGE=3
RISK_MAX_POSITION_PCT=20
RISK_MAX_OPEN_POSITIONS=5
RISK_ALLOWED_PAIRS=BTC/USDT,ETH/USDT,SOL/USDT
RISK_SESSION_MAX_DRAWDOWN_PCT=5
RISK_TOTAL_MAX_DRAWDOWN_PCT=15
```

Estos valores son **firewall**. Yo (CloseClaw) no puedo cambiarlos. Solo Thiago editando el `.env`.

### 4.3 Logging de trades

Cada operación de write (`place_order`, `cancel_order`, `close_position`) genera un log entry:
```json
{
  "timestamp": "2026-04-02T23:15:00Z",
  "tool": "place_order",
  "exchange": "binance",
  "input": { "symbol": "BTC/USDT", "side": "buy", "type": "market", "amount": 0.001 },
  "result": { "id": "123", "price": 84500, "cost": 84.5, "status": "filled" },
  "reason": "Cash & carry: opening spot leg"
}
```

El log se escribe en `src/trading-mcp-exchange/logs/trades.jsonl` (append-only, JSON Lines).

---

## 5. Configuración

### .env.example
```env
# Exchange: binance | bybit | hyperliquid | blofin
BINANCE_API_KEY=
BINANCE_API_SECRET=
BYBIT_API_KEY=
BYBIT_API_SECRET=
HYPERLIQUID_API_KEY=
HYPERLIQUID_API_SECRET=
BLOFIN_API_KEY=
BLOFIN_API_SECRET=

# Risk limits (firewall — not modifiable by agent)
RISK_MAX_LEVERAGE=3
RISK_MAX_POSITION_PCT=20
RISK_MAX_OPEN_POSITIONS=5
RISK_ALLOWED_PAIRS=BTC/USDT,ETH/USDT,SOL/USDT
RISK_SESSION_MAX_DRAWDOWN_PCT=5
RISK_TOTAL_MAX_DRAWDOWN_PCT=15
```

### claude_desktop_config.json / settings
```json
{
  "mcpServers": {
    "trading-exchange": {
      "command": "node",
      "args": ["src/trading-mcp-exchange/dist/index.js"],
      "env": {
        "BINANCE_API_KEY": "...",
        "BINANCE_API_SECRET": "..."
      }
    }
  }
}
```

---

## 6. Estructura del Proyecto

```
src/trading-mcp-exchange/
  README.md                    # Docs técnicos, cómo correr, a qué track pertenece
  package.json
  tsconfig.json
  .env.example
  src/
    index.ts                   # Entry point: crea McpServer, registra tools, conecta stdio
    tools/
      market.ts                # get_ticker, get_orderbook, get_ohlcv, get_funding_rate, get_markets
      account.ts               # get_balance, get_positions, get_open_orders, get_trades
      trading.ts               # place_order, cancel_order, cancel_all_orders, close_position
    exchange/
      factory.ts               # Crea instancia CCXT por exchange name
      types.ts                 # Interfaces propias (no depender de tipos CCXT directamente)
    risk/
      validator.ts             # Valida cada trade contra límites de riesgo
      config.ts                # Lee risk limits de env
    logger/
      trade-logger.ts          # Append-only JSONL logger para trades
  tests/
    tools/
    exchange/
    risk/
  logs/                        # Trade logs (gitignored)
```

---

## 7. Dependencias

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.29.0",
    "ccxt": "^4.5.0",
    "zod": "^3.23.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^20.0.0",
    "vitest": "^2.0.0"
  }
}
```

---

## 8. Fases de Implementación

| Fase | Scope | Criterio de éxito |
|------|-------|--------------------|
| **0: Skeleton** | Project setup, MCP server boots, 1 dummy tool | `node dist/index.js` inicia sin error |
| **1: Market Data** | get_ticker, get_ohlcv, get_funding_rate | Puedo ver precios y funding rates desde Claude |
| **2: Account** | get_balance, get_positions | Puedo ver mi capital y posiciones |
| **3: Trading** | place_order, cancel_order, close_position | Puedo ejecutar un trade desde Claude |
| **4: Risk** | Validaciones, logging, limits | Trades rechazados si violan límites |
| **5: Full** | Todos los tools, tests, docs | Sistema completo y validado |

---

## 9. Ejemplo de Uso (cómo CloseClaw opera)

```
CloseClaw: "Voy a revisar si vale la pena abrir cash & carry en BTC"

→ get_funding_rate({ exchange: "binance", symbol: "BTC/USDT" })
  Result: { fundingRate: 0.0002, annualizedRate: 21.9%, nextFundingTimestamp: "..." }

→ get_ticker({ exchange: "binance", symbol: "BTC/USDT" })
  Result: { last: 84500, bid: 84499, ask: 84501, spread: 0.002% }

→ get_balance({ exchange: "binance", type: "spot" })
  Result: { free: { USDT: 48.50 } }

CloseClaw analiza: "Funding rate 0.02% cada 8h = ~21% APY. Spread es tight.
Tengo $48.50. Voy a poner $24 en spot y $24 en short perp."

→ place_order({ exchange: "binance", symbol: "BTC/USDT", side: "buy", type: "market", amount: 0.00028 })
  Result: { id: "1001", price: 84501, cost: 23.66, status: "filled" }

→ place_order({ exchange: "binance", symbol: "BTC/USDT", side: "sell", type: "market", amount: 0.00028,
    params: { marginMode: "cross", leverage: 1 } })
  Result: { id: "1002", price: 84499, cost: 23.66, status: "filled" }

CloseClaw: "Cash & carry abierto. Delta neutral. Cobrando funding cada 8h.
Voy a monitorear en próxima sesión."
```

---

> **Estado:** Spec completa. Lista para implementación.
> **Siguiente:** Crear el proyecto en `src/trading-mcp-exchange/` y empezar por Fase 0 (skeleton).
