# Log: trading

<!-- Registro cronológico. Append-only. Más reciente arriba. -->

## 2026-04-04

**13:46 — Paper trade #9 abierto + estrategia formalizada**
- Primer ciclo del día. BTC $67,440 (+$500 desde ayer). Funding -2.24% (shorts saturados).
- Abrí long BTC @ $67,441, target $67,800, stop $67,200. Short squeeze setup más fuerte que ayer.
- Gap de ~24h sin monitoreo (sesión cerrada). Refuerza necesidad de monitor script 24/7.
- Formalicé estrategia completa en `strategy.md` (triggers, sizing, risk management, 12 lecciones).

## 2026-04-03

**13:57-14:01 — Paper trade #8 (loss)**
- Buy-the-funding-dip: entré long pre-funding @ $66,992. Post-funding no rebotó. Cerré @ $66,948. P&L: -$0.042.
- Lección #12: buy-the-funding-dip es unreliable.

**13:47-13:55 — Paper trade #7 (win)**
- Long BTC @ $66,924. Compresión + bid wall 84 BTC + ask vacío. BTC cruzó $67,000. Cerré @ $67,001 pre-funding.
- P&L: +$0.007. Tercer winner consecutivo.

**12:59-13:31 — Paper trade #6 (win) — BEST TRADE**
- Long BTC @ $66,818. Tendencia macro + funding neutro + 3x leverage.
- BTC subió $120 en 32 min. Sell wall de 50 BTC apareció → cerré @ $66,938. P&L: +$0.024.
- Lección #9: paciencia es el edge. Lección #10: orderbook reversals son señales de salida.

**12:59-13:06 — Paper trade #5 (loss)**
- ETH long catch-up @ $2,051. Squeeze completó (funding -0.78%→-0.03%) pero precio no corrió. Cerré @ $2,049.7.
- P&L: -$0.045. Lección #7/#8: ETH catch-up unreliable, funding squeeze ≠ price squeeze.

**00:28-~00:45 — Paper trade #4 (stop hit)**
- Short BTC @ $66,584 contra tendencia macro. Stop hit en $66,700. P&L: -$0.053.
- Lección #5: no shortear contra tendencia macro.

**00:23-00:25 — Paper trade #3 (loss)**
- Short BTC @ $66,664. Cerré a $66,658 por bid wall de 34 BTC. Fees > ganancia. P&L: -$0.016.
- Lección #1: fees dominan en trades cortos. Lección #4: walls pueden ser spoofs.

**00:16-00:19 — Paper trade #1 (loss)**
- ETH long @ $2,055.3 por fuerza relativa. ETH no siguió a BTC. Corte rápido @ $2,053.7. P&L: -$0.034.
- Lección #3: ETH no sigue a BTC en este régimen.

**00:15-00:22 — Paper trade #2 (win)**
- Long BTC @ $66,619. Short squeeze: funding -0.76% convergiendo + momentum. Cerré @ $66,688. P&L: +$0.003.
- Lección #2: short squeeze thesis funciona.

**~00:00 — MCP Server operativo, primer escaneo de mercado**
- MCP tools conectados a Claude Code. Primer ciclo de monitoreo real.
- Balance Hyperliquid: $5.97 USDC. Todos los funding rates negativos.
- Primer trade real: roundtrip 0.005 ETH @ $2,051.50/$2,050.30. P&L: -$0.0149. Pipeline validado.
- Bugs encontrados y corregidos en vivo: Hyperliquid requiere precio en market orders, close_position mismo fix.

## 2026-04-02

**Noche — MCP Server Exchange implementado**
- 14 tools en 3 categorías (market, account, trading). TypeScript + CCXT + MCP SDK.
- Risk validator, trade logger (JSONL), exchange factory multi-exchange.
- 72 tests, 93% branch coverage. Compila y bootea limpio.

**Noche — Decisiones fundacionales y Q&A con Thiago**
- Ronda de preguntas y respuestas. 13 decisiones documentadas.
- Exchanges: Binance MVP, Hyperliquid disponible. Capital: ~$50/exchange. Autonomía total 24/7.
- Cash & Carry como estrategia MVP. BTC/ETH/SOL autorizados.

**Noche — Dirección del track redefinida**
- Thiago define: flujo 100% agéntico. CloseClaw opera directamente.
- No construir bot autónomo. Construir herramientas (MCP, CLI) que el agente usa.
- 4 proyectos de código definidos: MCP exchange, MCP analytics, CLI, kill switch.

**Track creado**
- Brainstorm de Thiago preservado como research.
- Track en estado exploring (luego pasó a active).
