# Track: Trading Algorítmico y Agéntico
> ID: trading | Tipo: service | Estado: active | Prioridad: P1

## Objetivo
Operar cuentas de trading directamente como experto financiero. CloseClaw actúa como asesor/operador que ejecuta trades, gestiona riesgo, y busca rentabilidad consistente a través de estrategias sistemáticas.

## Enfoque: IA-First, Tooling para el Agente

**El flujo es 100% agéntico.** CloseClaw (Claude) es el operador. Las herramientas son mis manos y ojos:

| Herramienta | Tipo | Estado | Propósito |
|-------------|------|--------|-----------|
| MCP Server: Exchange | MCP | ✅ Operativo | Leer mercado + ejecutar trades. 14 tools. |
| MCP Server: Analytics | MCP | ⬜ Pendiente | Análisis técnico, detección de régimen |
| CLI: Trading Ops | CLI | ⬜ Pendiente | Monitoreo, emergencias |
| Kill Switch | Proceso | ⬜ Pendiente | Circuit breaker fuera del control del agente |

## Estado Actual

- **MCP Server Exchange:** ✅ Implementado, testeado (72 tests, 93% coverage), conectado a Claude Code
- **Exchange activo:** Hyperliquid (wallet `0x163f...4500`, $5.95 USDC real)
- **Estrategia definida:** [strategy.md](strategy.md) — BTC momentum long con orderbook reading
- **Paper trading:** [paper-trades.md](paper-trades.md) — 8 trades cerrados, 1 abierto. P&L: -$0.16
- **Dev server:** Auto-reload activo (tsx + file watcher)
- **Siguiente:** Continuar paper trading, converger a profit factor >1.0

## Documentación

| Documento | Propósito |
|-----------|-----------|
| [strategy.md](strategy.md) | Estrategia formalizada: triggers, sizing, risk management, lecciones |
| [paper-trades.md](paper-trades.md) | Log de paper trading con capital simulado ($100 USDC) |
| [spec-mcp-exchange.md](spec-mcp-exchange.md) | Spec técnica del MCP Server Exchange (14 tools) |
| [log.md](log.md) | Registro cronológico de actividades del track |
| [research/brainstorm-arquitectura.md](research/brainstorm-arquitectura.md) | Input original de Thiago (arquitectura, estrategias) |
| [research/analisis-decisiones-fundacionales.md](research/analisis-decisiones-fundacionales.md) | Decisiones fundacionales con justificaciones |

## Plan

- [x] Brainstorm de arquitectura y estrategias (input de Thiago)
- [x] Definir enfoque: 100% agéntico, herramientas para CloseClaw
- [x] Analizar brainstorm y tomar decisiones fundacionales
- [x] Spec técnica: MCP Server Exchange
- [x] Implementar MCP Server Exchange (14 tools, 72 tests)
- [x] Conectar a Hyperliquid (wallet configurado, balance visible)
- [x] Primer trade real (roundtrip ETH, validación de pipeline)
- [x] Dev server con auto-reload (tsx + file watcher)
- [x] Definir estrategia de trading (strategy.md)
- [x] Paper trading Session 1 (8 trades, 12 lecciones)
- [ ] Paper trading: converger a profit factor >1.0
- [ ] Implementar Kill Switch (proceso independiente)
- [ ] Implementar monitor script 24/7 (no depender de sesión Claude)
- [ ] Conectar Binance (API keys pendientes)
- [ ] Trading real con capital mínimo

## Code Projects

| Proyecto | Path | Estado | Descripción |
|----------|------|--------|-------------|
| trading-mcp-exchange | `src/trading-mcp-exchange/` | ✅ Operativo | 14 tools, 72 tests, 93% coverage. Conectado a Hyperliquid. |
| trading-mcp-analytics | `src/trading-mcp-analytics/` | ⬜ Pendiente | Análisis técnico y señales |
| trading-cli | `src/trading-cli/` | ⬜ Pendiente | CLI para operaciones |
| trading-killswitch | `src/trading-killswitch/` | ⬜ Pendiente | Circuit breaker independiente |

## Exchanges y Capital

| Exchange | Tipo | Capital | KYC | API keys | Estado |
|----------|------|---------|-----|----------|--------|
| Hyperliquid | DEX | ~$5.95 USDC | ✅ | ✅ Configuradas | 🟢 Operativo |
| Binance | CEX | ~$50 | ✅ | ⬜ Por crear | 🟡 Siguiente |
| Bybit | CEX | ~$50 | ✅ | ⬜ Por crear | ⬜ Fase 2 |
| Blofin | CEX | ~$50 | ✅ | ⬜ Por crear | ⬜ Fase 3 |

**Pares autorizados:** BTC/USDT, ETH/USDT, SOL/USDT, BTC/USDC:USDC, ETH/USDC:USDC, SOL/USDC:USDC
**Mercados:** Spot, margin, futuros perpetuos.
**Control:** Cuentas exclusivas de CloseClaw. Autonomía total. 24/7.

## Métricas

| Métrica | Valor |
|---------|-------|
| Tiempo invertido | ~8h (research, dev, paper trading) |
| MCP tools implementados | 14 |
| Tests | 72 (93% branch coverage) |
| Paper trades ejecutados | 9 (8 cerrados, 1 abierto) |
| Paper P&L | -$0.16 (capital $99.83 de $100) |
| Paper win rate | 37.5% (3/8) |
| Trade real ejecutado | 1 (roundtrip ETH, -$0.015) |
| P&L real | -$0.015 |

## Decisiones Tomadas

| Fecha | Decisión | Razón |
|-------|----------|-------|
| 2 abr 2026 | Flujo 100% agéntico | Construir herramientas para que el agente opere, no un bot autónomo |
| 2 abr 2026 | MCP servers como interfaz | Claude necesita tools para operar exchanges en sesión |
| 2 abr 2026 | CCXT como abstracción | Multi-exchange con cambio de config, no de código |
| 2 abr 2026 | Cash & Carry como estrategia MVP | Menor complejidad, delta-neutral, valida todo el stack |
| 2 abr 2026 | Autonomía total, 24/7, logs | Thiago confía en CloseClaw dentro de límites |
| 3 abr 2026 | Hyperliquid como exchange operativo | Wallet disponible, DEX sin restricciones, USDC |
| 3 abr 2026 | BTC momentum long como edge | Paper trading validó: winners = BTC longs con paciencia |
| 4 abr 2026 | Estrategia formalizada en strategy.md | 12 lecciones de 8 paper trades sistematizadas |

## Siguiente Acción
Continuar paper trading aplicando strategy.md. Objetivo: profit factor >1.0 y win rate >40%. Trade #9 abierto (long BTC @ $67,441).
