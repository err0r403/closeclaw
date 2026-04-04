# Paper Trading Dashboard — Multi-Estrategia

> Última actualización: 2026-04-04 14:20
> Capital virtual por estrategia: $100 USDC cada una
> Exchange: Hyperliquid (datos reales, ejecución simulada)

---

## Performance Comparativa

| Estrategia | Capital | P&L | Win Rate | Trades | Avg Win | Avg Loss | Profit Factor | Estado |
|------------|---------|-----|----------|--------|---------|----------|---------------|--------|
| [A: Momentum Long](strategies/a-momentum-long.md) | $99.74 | -$0.25 | 33% (3/9) | 9 | +$0.011 | -$0.046 | 0.10 | ⏸️ En revisión |
| [B: Trend Following](strategies/b-trend-following.md) | $100.00 | $0.00 | — | 0 | — | — | — | 🟢 Nueva |
| [C: Funding Arbitrage](strategies/c-funding-arbitrage.md) | $99.99 | -$0.01 | — | 0 | — | — | — | 📈 Long abierto @ $67,312 |

## Ranking (por Profit Factor)
1. — Sin datos suficientes aún —

## Condiciones de Mercado Actuales

| Dato | Valor | Implicancia |
|------|-------|-------------|
| BTC | $67,311 | Estabilizándose post-corrección |
| Funding BTC | -1.62% anual | Shorts pagando, convergiendo desde -2.96% |
| Régimen | Transición (corrección → rango) | Precio flat, funding mejorando |

## Reglas del Framework
1. Cada estrategia tiene $100 USDC virtuales independientes
2. Todas ven los mismos datos de mercado
3. Cada una opera según sus propias reglas (documentadas en su archivo)
4. El dashboard se actualiza solo cuando hay trades o cambios de estado
5. Después de 20+ trades por estrategia, comparamos y eliminamos las peores
6. La ganadora se promueve a capital real

## Ciclo Operativo
```
1. Fetch datos de mercado (una vez, comparten todos)
2. Para cada estrategia activa:
   - ¿Tiene posición? → Evaluar cierre
   - ¿Sin posición? → Evaluar entrada según SUS reglas
   - Registrar acción en SU archivo
3. Actualizar dashboard si hubo trades
4. Reportar resumen
```
