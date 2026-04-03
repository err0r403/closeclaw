# Track: Trading Algorítmico y Agéntico
> ID: trading | Tipo: service | Estado: active | Prioridad: P1

## Objetivo
Operar cuentas de trading directamente como experto financiero. CloseClaw actúa como asesor/operador que ejecuta trades, gestiona riesgo, y busca rentabilidad consistente a través de estrategias sistemáticas.

## Hipótesis
CloseClaw puede operar trading de forma **100% agéntica** — tomando datos, analizando, decidiendo, y ejecutando trades directamente — si dispone de las herramientas adecuadas (MCP servers, CLI) que le den acceso a exchanges y datos de mercado.

### Sub-hipótesis:
- Los LLMs son malos calculando pero buenos analizando contexto y régimen de mercado
- Las estrategias delta-neutral eliminan el riesgo de "bag holding"
- Un kill switch independiente puede contener el riesgo sistémico
- El arbitraje de tiempo (slow trading) es viable para un operador retail sin VPS colocado
- **CloseClaw como operador directo** (no un bot autónomo) permite adaptación y juicio que un script no tiene

## Enfoque: IA-First, Tooling para el Agente

**El flujo es 100% agéntico.** CloseClaw (Claude) es el operador. No construimos un bot autónomo que corre solo — construimos herramientas que CloseClaw usa directamente:

| Herramienta | Tipo | Propósito |
|-------------|------|-----------|
| MCP Server: Exchange | MCP | Leer mercado (precios, orderbook, funding rates, posiciones) y ejecutar trades |
| MCP Server: Analytics | MCP | Análisis técnico, detección de régimen, señales |
| CLI: Trading Ops | CLI | Operaciones manuales, monitoreo, emergencias |
| Kill Switch | Proceso independiente | Circuit breaker automático fuera del control del agente |

**El cerebro soy yo (CloseClaw/Claude).** Las herramientas son mis manos y ojos.

## Estado Actual
- **Fase:** Investigación y definición. No hay código ni spec técnica formal.
- **Input:** Brainstorm de arquitectura y estrategias → `research/brainstorm-arquitectura.md`
- **Dirección definida:** Flujo 100% agéntico. Construir MCP servers + CLI como herramientas para que CloseClaw opere directamente.
- **Siguiente:** Definir spec técnica de las herramientas (MCP server de exchange como MVP)

## Research
| Documento | Descripción |
|-----------|-------------|
| [brainstorm-arquitectura.md](research/brainstorm-arquitectura.md) | Lluvia de ideas sobre arquitectura y estrategias. Input de pensamiento, NO spec. |
| [analisis-decisiones-fundacionales.md](research/analisis-decisiones-fundacionales.md) | Análisis completo con decisiones justificadas. Respuestas de Thiago incorporadas. |

## Plan
- [x] Brainstorm de arquitectura y estrategias (input de Thiago)
- [x] Definir enfoque: 100% agéntico, herramientas para CloseClaw
- [ ] Analizar brainstorm: separar lo viable de lo especulativo
- [ ] Spec técnica: MCP Server Exchange (MVP — leer mercado + ejecutar trades)
- [ ] Spec técnica: Kill Switch (proceso independiente)
- [ ] Spec técnica: MCP Server Analytics (análisis y señales)
- [ ] Spec técnica: CLI Trading Ops
- [ ] Definir primera estrategia a operar (MVP)
- [ ] Setup de proyecto(s) en `src/`
- [ ] Implementar MCP Server Exchange
- [ ] Implementar Kill Switch
- [ ] Implementar MCP Server Analytics
- [ ] Implementar CLI
- [ ] Paper trading (CloseClaw operando con datos reales, sin capital)
- [ ] Trading real con capital mínimo

## Code Projects
| Proyecto | Path | Branch | Estado |
|----------|------|--------|--------|
| trading-mcp-exchange | `src/trading-mcp-exchange/` | — | Pendiente spec |
| trading-mcp-analytics | `src/trading-mcp-analytics/` | — | Pendiente spec |
| trading-cli | `src/trading-cli/` | — | Pendiente spec |
| trading-killswitch | `src/trading-killswitch/` | — | Pendiente spec |

## Métricas
| Métrica | Valor |
|---------|-------|
| Inversión acumulada | $0 |
| Ingreso generado | $0 |
| Tiempo invertido | ~1h (research y brainstorm) |
| P&L paper trading | N/A |
| P&L real | N/A |

## Exchanges y Capital

| Exchange | Tipo | Capital aprox | KYC | API keys | Prioridad |
|----------|------|---------------|-----|----------|-----------|
| Binance | CEX | ~$50 | ✅ | ⬜ Por crear | 🔴 MVP |
| Bybit | CEX | ~$50 | ✅ | ⬜ Por crear | 🟡 Fase 2 |
| Hyperliquid | DEX | ~$50 | ✅ | ⬜ Por crear | 🟡 Fase 2 |
| Blofin | CEX | ~$50 | ✅ | ⬜ Por crear | 🔵 Fase 3 |

**Pares autorizados:** BTC/USDT, ETH/USDT, SOL/USDT + pre-seleccionadas estrictamente.
**Mercados:** Spot, margin, futuros perpetuos.
**Control:** Cuentas exclusivas de CloseClaw. Autonomía total. 24/7.

## Estrategias en Evaluación
| Estrategia | Tipo | Riesgo | Complejidad | Estado |
|------------|------|--------|-------------|--------|
| Cash and carry (funding rates) | Delta-neutral | Bajo | Baja | 🔴 **MVP elegida** |
| Grid con cobertura (spot + short) | Delta-neutral | Bajo | Media | Investigación |
| Pairs trading (reversión a la media) | Estadístico | Medio | Media | Investigación |
| Arbitraje espacial (CEX vs DEX) | Delta-neutral | Medio (leg risk) | Alta | Investigación |
| Orquestador dinámico (supervisor IA) | Meta-estrategia | Variable | Alta | Investigación |

## Decisiones Tomadas
| Fecha | Decisión | Razón |
|-------|----------|-------|
| 2 abr 2026 | Track creado en estado `exploring` | Alto potencial pero requiere research profundo antes de invertir tiempo/dinero |
| 2 abr 2026 | Brainstorm preservado como research, no como spec | Es input de pensamiento, no decisión técnica final |
| 2 abr 2026 | Flujo 100% agéntico — CloseClaw opera directamente | No construir bot autónomo. Construir herramientas (MCP, CLI) que el agente usa |
| 2 abr 2026 | MCP servers como interfaz principal | CloseClaw (Claude) necesita tools para leer mercado y ejecutar trades en sesión |
| 2 abr 2026 | Binance como exchange MVP | Máxima liquidez, spot+margin+perps, CCXT full support |
| 2 abr 2026 | Cash & Carry como estrategia MVP | Menor complejidad, delta-neutral, valida todo el stack |
| 2 abr 2026 | Autonomía total, 24/7, reporting via logs | Thiago confía en CloseClaw dentro de límites definidos |
| 2 abr 2026 | Capital micro (~$50/exchange). Prioridad = validar pipeline | Generar retorno es secundario hasta que el sistema esté probado |

## Siguiente Acción
Definir spec técnica del MCP Server Exchange (MVP): qué tools expone, qué exchanges soporta, qué operaciones permite. Sin esta herramienta soy ciego y manco.
