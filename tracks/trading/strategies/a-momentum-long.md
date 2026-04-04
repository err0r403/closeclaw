# Estrategia A: BTC Momentum Long

> Estado: ⏸️ En revisión | Capital: $99.74 | P&L: -$0.25

## Reglas

**Entrada (todos deben cumplirse):**
1. BTC en tendencia alcista macro (>$100 en últimas horas)
2. Funding entre -0.5% y +0.5% anualizado (no crowded)
3. Bid wall >10 BTC en o arriba del last price
4. Ask side <3 BTC en primeros 5 niveles
5. Ratio bid:ask >3:1

**Entrada variante — Short Squeeze:**
1. Funding < -0.5% (shorts saturados)
2. Precio SUBIENDO a pesar de funding negativo
3. Funding convergiendo a 0 (shorts cerrando)

**Salida:**
- TP: sell wall >20 BTC + bids vacíos, o target alcanzado
- SL: precio toca stop, o tesis invalidada
- Trailing: +$50 → breakeven, +$100 → trail -$70

**Sizing:** 0.0004 BTC, leverage 3x (~$27 notional)

## Posición Actual
Ninguna.

## Performance
| Métrica | Valor |
|---------|-------|
| Trades | 9 |
| Win rate | 33% (3/9) |
| P&L total | -$0.25 |
| Avg winner | +$0.011 |
| Avg loser | -$0.046 |
| Profit factor | 0.10 |
| Best trade | #6: +$0.024 |
| Worst trade | #9: -$0.087 |

## Historial
| # | Open | Close | Entry | Exit | P&L | Nota |
|---|------|-------|-------|------|-----|------|
| 1 | 04-03 00:16 | 04-03 00:19 | $2,055.3 (ETH) | $2,053.7 | -$0.034 | ETH catch-up falló |
| 2 | 04-03 00:15 | 04-03 00:22 | $66,619 | $66,688 | +$0.003 | Squeeze ✓ |
| 3 | 04-03 00:23 | 04-03 00:25 | $66,664 | $66,658 | -$0.016 | Short micro, fees>gain |
| 4 | 04-03 00:28 | 04-03 ~00:45 | $66,584 | $66,700 | -$0.053 | Stop hit, contra tendencia |
| 5 | 04-03 12:59 | 04-03 13:06 | $2,051 (ETH) | $2,049.7 | -$0.045 | ETH catch-up falló |
| 6 | 04-03 12:59 | 04-03 13:31 | $66,818 | $66,938 | +$0.024 | BEST ✓ momentum+paciencia |
| 7 | 04-03 13:47 | 04-03 13:55 | $66,924 | $67,001 | +$0.007 | Compresión ✓ |
| 8 | 04-03 13:57 | 04-03 14:01 | $66,992 | $66,948 | -$0.042 | Funding dip falló |
| 9 | 04-04 13:46 | 04-04 14:01 | $67,441 | $67,284 | -$0.087 | Squeeze no convergió |

## Análisis
- Winners: BTC long con paciencia cuando funding convergía y orderbook era bullish
- Losers: ETH trades, shorts, entries sin confirmación de momentum, squeeze sin convergencia
- **Problema principal:** Entrar en squeeze cuando funding diverge en vez de converger
- **Estado:** Pausada para revisión. Las reglas core son válidas (trades #2,#6,#7) pero necesitan filtro adicional de confirmación de precio
