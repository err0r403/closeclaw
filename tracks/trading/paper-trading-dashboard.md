# Paper Trading Dashboard — Multi-Estrategia

> Última actualización: 2026-04-04 15:40
> Capital virtual por estrategia: $100 USDC cada una
> Exchange: Hyperliquid (datos reales, ejecución simulada)

---

## Performance Comparativa

| Estrategia | Capital | P&L | Win Rate | Trades | Avg Win | Avg Loss | Profit Factor | Estado |
|------------|---------|-----|----------|--------|---------|----------|---------------|--------|
| [A: Momentum Long](strategies/a-momentum-long.md) | $99.74 | -$0.25 | 33% (3/9) | 9 | +$0.011 | -$0.046 | 0.10 | ⏸️ En revisión |
| [B: Trend Following](strategies/b-trend-following.md) | $100.00 | $0.00 | — | 0 | — | — | — | 🟢 Nueva |
| [C: Funding Arbitrage](strategies/c-funding-arbitrage.md) | $99.96 | -$0.042 | 0% (0/1) | 1 | — | -$0.042 | 0 | ❌ No viable con micro-capital |

## Ranking (por Profit Factor)
1. — Sin datos suficientes aún —

## Condiciones de Mercado Actuales

| Dato | Valor | Implicancia |
|------|-------|-------------|
| BTC | $67,261 | Corrección lenta continúa |
| Funding BTC | -1.66% anual | Shorts pagando pero tienen razón (precio baja) |
| Régimen | Bearish lento | Lower highs desde $67,441, sin soporte claro |

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
