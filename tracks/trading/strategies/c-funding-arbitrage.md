# Estrategia C: Funding Rate Arbitrage (Cobrar Funding)

> Estado: 🟢 Nueva | Capital: $100.00 | P&L: $0.00

## Concepto
No predice dirección. Se posiciona para **cobrar** funding rate. Si funding es positivo (longs pagan), shortea. Si funding es negativo (shorts pagan), longuea. Ingreso pasivo por funding cada 8h, no por movimiento de precio.

## Reglas

**Entrada LONG (cuando shorts pagan):**
1. Funding < -1% anualizado sostenido (2+ ciclos)
2. Precio en rango (no cayendo >$100 en última hora)
3. No hay sell wall >15 BTC amenazando

**Entrada SHORT (cuando longs pagan):**
1. Funding > +1% anualizado sostenido (2+ ciclos)
2. Precio en rango (no subiendo >$100 en última hora)
3. No hay bid wall >15 BTC soportando un rally

**NO operar si:**
- Funding entre -1% y +1% (no vale el riesgo por tan poco)
- Precio en tendencia fuerte (el move de precio mata el ingreso de funding)
- Próximo funding event en <15 min (timing risk)

**Salida:**
- TP: Cobrar 2-3 periodos de funding (16-24h), luego cerrar
- SL: -$50 desde entry (el funding no compensa una pérdida grande)
- Cerrar si funding flipa de signo

**Sizing:** 0.0004 BTC, leverage 2x (~$27 notional)

**Ingreso esperado por trade:**
- Funding -2% anual en $27 notional = ~$0.0015/periodo (8h) = ~$0.0045/día
- Con fees de $0.024 roundtrip, necesito ~16 periodos (5.3 días) para breakeven
- **Esta es una estrategia de largo holding, no de scalping**

## Posición Actual
Ninguna.

## Performance
| Métrica | Valor |
|---------|-------|
| Trades | 0 |
| Win rate | — |
| P&L total | $0.00 |
| Funding cobrado | $0.00 |

## Historial
| # | Open | Close | Side | Entry | Exit | Funding cobrado | Price P&L | Fee | Net P&L | Nota |
|---|------|-------|------|-------|------|-----------------|-----------|-----|---------|------|
