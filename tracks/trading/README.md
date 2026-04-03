# Track: Trading Algorítmico y Agéntico
> ID: trading | Tipo: service | Estado: exploring | Prioridad: P1

## Objetivo
Operar cuentas de trading directamente como experto financiero. CloseClaw actúa como asesor/operador que ejecuta trades, gestiona riesgo, y busca rentabilidad consistente a través de estrategias sistemáticas.

## Hipótesis
Un sistema multi-capa (ejecución + pre-procesamiento de datos + agentes IA) puede explotar ineficiencias de mercado — spreads, funding rates, arbitraje estadístico — con enfoque **delta-neutral** (sin riesgo direccional), generando retornos consistentes y medibles.

### Sub-hipótesis:
- Los LLMs son malos calculando pero buenos analizando contexto y régimen de mercado
- Las estrategias delta-neutral eliminan el riesgo de "bag holding"
- Un kill switch independiente puede contener el riesgo sistémico
- El arbitraje de tiempo (slow trading) es viable para un operador retail sin VPS colocado

## Estado Actual
- **Fase:** Investigación y definición. No hay código ni spec técnica formal.
- **Input:** Brainstorm de arquitectura y estrategias → `research/brainstorm-arquitectura.md`
- **Siguiente:** Analizar el brainstorm, identificar qué es viable, construir spec técnica formal

## Research
| Documento | Descripción |
|-----------|-------------|
| [brainstorm-arquitectura.md](research/brainstorm-arquitectura.md) | Lluvia de ideas y análisis sobre arquitectura multi-capa, estrategias, y flujos agénticos. Input de pensamiento, NO spec final. |

## Plan
- [x] Brainstorm de arquitectura y estrategias (input de Thiago)
- [ ] Analizar brainstorm: separar lo viable de lo especulativo
- [ ] Definir spec técnica formal (arquitectura, capas, stack)
- [ ] Definir primera estrategia a implementar (MVP)
- [ ] Setup de proyecto(s) en `src/`
- [ ] Implementar Layer 1 (ejecución + estado)
- [ ] Implementar Kill Switch
- [ ] Implementar Layer 2 (traductor de datos)
- [ ] Implementar Layer 3 (agentes)
- [ ] Backtesting con datos históricos
- [ ] Paper trading (ejecución simulada)
- [ ] Trading real con capital mínimo

## Code Projects
| Proyecto | Path | Branch | Estado |
|----------|------|--------|--------|
| — | — | — | Sin proyectos aún. Se crean después de la spec técnica |

## Métricas
| Métrica | Valor |
|---------|-------|
| Inversión acumulada | $0 |
| Ingreso generado | $0 |
| Tiempo invertido | ~1h (research y brainstorm) |
| P&L paper trading | N/A |
| P&L real | N/A |

## Estrategias en Evaluación
| Estrategia | Tipo | Riesgo | Complejidad | Estado |
|------------|------|--------|-------------|--------|
| Arbitraje espacial (CEX vs DEX) | Delta-neutral | Medio (leg risk) | Alta | Investigación |
| Grid con cobertura (spot + short) | Delta-neutral | Bajo | Media | Investigación |
| Pairs trading (reversión a la media) | Estadístico | Medio | Media | Investigación |
| Cash and carry (funding rates) | Delta-neutral | Bajo | Baja | Investigación |
| Orquestador dinámico (supervisor IA) | Meta-estrategia | Variable | Alta | Investigación |

## Decisiones Tomadas
| Fecha | Decisión | Razón |
|-------|----------|-------|
| 2 abr 2026 | Track creado en estado `exploring` | Alto potencial pero requiere research profundo antes de invertir tiempo/dinero |
| 2 abr 2026 | Brainstorm preservado como research, no como spec | Es input de pensamiento, no decisión técnica final |

## Siguiente Acción
Analizar el brainstorm en detalle. Separar lo viable de lo teórico. Identificar la estrategia MVP con menor complejidad y mayor probabilidad de retorno.
