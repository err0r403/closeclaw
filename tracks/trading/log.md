# Log: trading

<!-- Registro cronológico. Append-only. Más reciente arriba. -->

## 3 abril 2026 (madrugada)
**Acción:** Primer roundtrip real en Hyperliquid. Long 0.005 ETH @ $2,051.50, closed @ $2,050.30.
**Resultado:** P&L: -$0.0149 (~1.5 centavos). Fees confirmados: ~$0.0046/lado (0.045% taker). Roundtrip fee: ~$0.009.
**Bugs encontrados y corregidos en vivo (dev-server auto-reload):**
1. `place_order` market: Hyperliquid requiere precio para calcular slippage → cambiado a `createOrder` con precio
2. `close_position`: mismo issue → mismo fix
3. `get_markets` filtraba solo USDT, Hyperliquid usa USDC → detectado, pendiente fix
**Tools validados end-to-end:** get_ticker, get_balance, get_funding_rate, get_positions, get_open_orders, place_order (market+limit), cancel_order, close_position.
**Siguiente:** Fix get_markets para USDC. Investigar estrategias con funding negativo. Monitorear mercado.

## 2 abril 2026 (noche, sesión 4)
**Acción:** MCP server conectado a Claude Code. Primer escaneo de mercado real con mis propias herramientas.
**Resultado:**
- Balance Hyperliquid: $5.97 USDC. 0 posiciones. 0 órdenes.
- BTC $66,292 | ETH $2,043 | SOL ~$79
- Todos los funding rates negativos (shorts pagan a longs): BTC -1.12%, ETH -0.58%, SOL -1.69% anualizado
- Cash & Carry clásico NO rentable en este régimen. Reverse carry no posible sin short en spot.
**Decisión:** No operar. Funding negativo = sin edge delta-neutral. Pipeline validado — tools funcionan end-to-end.
**Siguiente:** Monitorear funding rates. Operar cuando cambien a positivo. Explorar si hay oportunidades en otros regímenes.

## 2 abril 2026 (noche, sesión 3)
**Acción:** Implementación completa del MCP Server Exchange. 14 tools en 3 categorías (market, account, trading). Risk validator, trade logger, exchange factory con CCXT. Compila y bootea limpio.
**Resultado:** Proyecto en `src/trading-mcp-exchange/`. Build OK. Server inicia sin errores. Listo para conectar a Claude Code con API keys.
**Siguiente:** Crear API keys en Binance, configurar .env, conectar MCP server a Claude Code, probar con datos reales.

## 2 abril 2026 (noche, sesión 2)
**Acción:** Ronda de Q&A con Thiago. Respuestas incorporadas al análisis. Decisiones fundacionales documentadas en `research/analisis-decisiones-fundacionales.md`.
**Datos clave:** ~$50/exchange, KYC hecho en 4 exchanges, BTC/ETH/SOL autorizados, spot+margin+futuros, 24/7, autonomía total, reporting via logs.
**Decisiones:** Binance MVP, CCXT abstracción, Cash & Carry primera estrategia, capital micro = prioridad es validar pipeline.
**Siguiente:** Spec técnica del MCP Server Exchange.

## 2 abril 2026 (noche, sesión 1)
**Acción:** Dirección del track redefinida por Thiago: flujo 100% agéntico. CloseClaw opera directamente, no se construye un bot autónomo. Se construyen herramientas (MCP servers, CLI) que el agente usa.
**Resultado:** README actualizado con enfoque IA-first. Plan reescrito con 4 proyectos de código definidos (MCP exchange, MCP analytics, CLI, kill switch). Siguiente acción clara: spec del MCP Server Exchange.
**Siguiente:** Ronda de Q&A para definiciones fundacionales.

## 2 abril 2026
**Acción:** Track creado. Brainstorm de Thiago preservado como material de research. README con hipótesis, estrategias en evaluación, y plan de alto nivel.
**Resultado:** Track en estado `exploring`. No hay spec técnica ni código aún.
**Siguiente:** Analizar brainstorm, separar lo viable, definir MVP.
