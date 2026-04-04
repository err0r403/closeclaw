# Paper Trading Log — CloseClaw

> Capital simulado: $100 USDC (virtual)
> Exchange: Hyperliquid (datos reales, ejecución simulada)
> Inicio: 3 abril 2026, 03:15 UTC

## Reglas
- Datos de mercado son REALES (precios, funding rates, orderbook)
- Ejecución es SIMULADA (no se tocan fondos reales)
- Fees se calculan al taker rate real: 0.045% por lado
- Leverage max: 3x
- Posición max: 20% del capital simulado ($20)
- Se registra cada trade con timestamp, razón, entry, exit, fees, P&L

## Estado Actual
| Concepto | Valor |
|----------|-------|
| Capital inicial | $100.00 |
| Capital actual | $99.83 |
| P&L total | -$0.16 |
| Trades cerrados | 8 |
| Win rate | 37.5% (3/8) |
| Posiciones abiertas | 1 |

## Posiciones Abiertas
| # | Timestamp | Par | Side | Size | Entry | Leverage | Notional | Razón |
|---|-----------|-----|------|------|-------|----------|----------|-------|
| 9 | 2026-04-04 13:46 | BTC/USDC:USDC | long | 0.0004 BTC | $67,441 | 3x | $26.98 | Short squeeze setup: funding -2.24% (más fuerte que -0.76% de ayer que generó +$300 rally), tendencia macro +$500/24h, ask vacío (0.73 BTC), bid:ask 5:1. Target: $67,800 (+$359). Stop: $67,200 (-$241). R:R 1.5:1. Fee: $0.012 |

## Historial de Trades
| # | Open | Close | Par | Side | Size | Entry | Exit | Fee | P&L | Razón entrada | Razón salida |
|---|------|-------|-----|------|------|-------|------|-----|-----|----------------|--------------|
| 1 | 2026-04-03 00:16 | 2026-04-03 00:19 | ETH/USDC:USDC | long | 0.0097 | $2,055.3 | $2,053.7 | $0.018 | -$0.034 | ETH fuerza relativa + bid wall | ETH no siguió a BTC, debilidad relativa. Corte de pérdida. |
| 2 | 2026-04-03 00:15 | 2026-04-03 00:22 | BTC/USDC:USDC | long | 0.0003 | $66,619 | $66,688 | $0.018 | +$0.003 | BTC momentum + funding neg (-0.56%) = short squeeze | Squeeze completo: funding -0.76%→-0.25%, +$69. Take profit. |
| 3 | 2026-04-03 00:23 | 2026-04-03 00:25 | BTC/USDC:USDC | short | 0.0003 | $66,664 | $66,658 | $0.018 | -$0.016 | Post-squeeze reversal, sell wall 25 BTC | Bid wall 34 BTC apareció a $66,682. Fees >ganancia. Cierre defensivo. |
| 4 | 2026-04-03 00:28 | 2026-04-03 ~00:45* | BTC/USDC:USDC | short | 0.0003 | $66,584 | $66,700 | $0.018 | -$0.053 | Selloff post-squeeze, momentum bajista | STOP HIT. BTC revirtió +$256. Contra tendencia macro. |
| 5 | 2026-04-03 12:59 | 2026-04-03 13:06 | ETH/USDC:USDC | long | 0.0145 | $2,051 | $2,049.7 | $0.026 | -$0.045 | ETH squeeze setup (funding -0.52%) + BTC catch-up | Squeeze completó pero ETH no corrió. $2,050 roto. Corte disciplinado. |
| 6 | 2026-04-03 12:59 | 2026-04-03 13:31 | BTC/USDC:USDC | long | 0.0004 | $66,818 | $66,938 | $0.024 | +$0.024 | BTC tendencia alcista macro, funding neutro, leverage 3x | TP: +$120 en 32min. Sell wall 50 BTC + bids vacíos. Cierre defensivo. |
| 7 | 2026-04-03 13:47 | 2026-04-03 13:55 | BTC/USDC:USDC | long | 0.0004 | $66,924 | $67,001 | $0.024 | +$0.007 | Compresión + bid wall 84 BTC + ask vacío, R:R 2.4:1 | TP pre-funding: +$77, $67K cracking. 3 winners seguidos. |
| 8 | 2026-04-03 13:57 | 2026-04-03 14:01 | BTC/USDC:USDC | long | 0.0004 | $66,992 | $66,948 | $0.024 | -$0.042 | Buy-the-funding-dip: pre-funding dump | Tesis falló: post-funding no rebotó, < trigger $66,950. Corte disciplinado. |

## Lecciones

> Las 12 lecciones de esta sesión están formalizadas en [strategy.md](strategy.md) sección 8.
> Resumen: fees dominan micro-trades, BTC long con paciencia es el edge, ETH catch-up no funciona, no shortear contra tendencia, orderbook reading útil pero walls pueden ser spoofs, stop loss obligatorio.
