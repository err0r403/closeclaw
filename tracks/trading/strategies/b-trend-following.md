# Estrategia B: BTC Trend Following (Bi-direccional)

> Estado: 🟢 Nueva | Capital: $100.00 | P&L: $0.00

## Concepto
Opera en la dirección que el mercado confirma. No predice — sigue. Usa funding como indicador de consenso y precio como confirmación.

## Reglas

**Entrada LONG:**
1. Funding < -1% anualizado (shorts saturados)
2. Precio SUBIENDO (higher lows en 3+ ciclos consecutivos)
3. Funding convergiendo hacia 0 (shorts cerrando — confirmación)
4. Bid wall >5 BTC soportando

**Entrada SHORT:**
1. Funding < -2% anualizado (consenso bearish extremo)
2. Precio BAJANDO (lower highs en 3+ ciclos consecutivos)
3. Funding divergiendo (haciéndose más negativo — shorts tienen razón)
4. Ask wall >5 BTC presionando

**Entrada LONG (reversa):**
1. Funding > +1% anualizado (longs saturados)
2. Precio BAJANDO (distribución)
3. Funding convergiendo hacia 0 (longs cerrando)

**Clave:** El precio debe CONFIRMAR la dirección del funding. Si divergen → no operar.

**Salida:**
- TP: reversión de la estructura del orderbook (wall flip), o target +$150
- SL: -$100 desde entry, o precio revierte 3 ciclos consecutivos
- Trailing: +$50 → breakeven, +$100 → trail -$70

**Sizing:** 0.0004 BTC, leverage 2x (~$27 notional)

## Posición Actual
Ninguna.

## Performance
| Métrica | Valor |
|---------|-------|
| Trades | 0 |
| Win rate | — |
| P&L total | $0.00 |

## Historial
| # | Open | Close | Side | Entry | Exit | P&L | Nota |
|---|------|-------|------|-------|------|-----|------|
