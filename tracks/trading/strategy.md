# CloseClaw — Estrategia de Trading v1.0

> Autor: CloseClaw
> Basada en: Paper Trading Session 1 (8 trades, 3 abr 2026)
> Última actualización: 4 abr 2026

---

## 1. Edge

**BTC momentum long con orderbook reading.**

Opero a favor de la tendencia macro de BTC, usando el orderbook para timing de entrada y funding rates como indicador de crowding/squeeze. No opero ETH independientemente. No shorteo contra tendencia.

---

## 2. Triggers de Entrada

### 2.1 LONG BTC — Señal Estándar

Todos estos criterios deben cumplirse:

| # | Criterio | Condición | Razón |
|---|----------|-----------|-------|
| 1 | Tendencia macro | BTC subió >$100 en últimas horas | No ir contra la corriente |
| 2 | Funding rate | Entre -2.5% y +0.5% anualizado | >+1% = longs crowded. <-2.5% = bearish extremo |
| 3 | Bid wall | >10 BTC en o arriba del last price | Compradores institucionales activos |
| 4 | Ask side | <3 BTC en primeros 5 niveles | Camino libre arriba |
| 5 | Ratio bid:ask | >3:1 en primeros 5 niveles | Asimetría clara a favor |

### 2.2 LONG BTC — Señal de Compresión (mejor setup, mayor convicción)

Criterios estándar + todos estos:

| # | Criterio | Condición |
|---|----------|-----------|
| 1 | Rango estrechándose | 3+ ciclos con lower highs y higher lows |
| 2 | Bid walls crecientes | Secuencia ascendente (10 → 20 → 40+ BTC) |
| 3 | Ask vacío | <1 BTC en primeros 5 niveles |

### 2.3 LONG BTC — Señal de Short Squeeze

| # | Criterio | Condición |
|---|----------|-----------|
| 1 | Funding rate | <-0.5% anualizado (shorts saturados, pagando) |
| 2 | Precio subiendo | A pesar de funding negativo = shorts perdiendo |
| 3 | Funding convergiendo a 0 | Los shorts están cerrando |

---

## 3. Triggers de NO entrada

| Condición | Razón | Trade que lo enseñó |
|-----------|-------|---------------------|
| Mercado choppy (rango <$80 con walls en ambos lados) | Fees comen cualquier ganancia | Ciclos 16:32-16:46 |
| Funding >+1% anualizado | Longs crowded, reversal probable | Distribución pre-$67K |
| Post-funding inmediato (<3 min) | Volatilidad impredecible | Trade #8 |
| FOMO — move ya ocurrió | Entrar tarde = comprar el top | Post trade #6 |
| ETH "catch-up" o "fuerza relativa" | ETH no sigue a BTC en este régimen | Trades #1, #5 |
| Short contra tendencia macro | Un retroceso de $100 no es reversal | Trade #4 |

---

## 4. Gestión de Posición

### 4.1 Take Profit

| Condición | Acción | Prioridad |
|-----------|--------|-----------|
| Sell wall >20 BTC aparece + bids se vacían | Cerrar inmediato | Máxima |
| Target price alcanzado | Cerrar | Alta |
| Funding >+1% + precio estancado | Evaluar cierre | Media |

### 4.2 Stop Loss

| Condición | Acción |
|-----------|--------|
| Stop price tocado | Cerrar sin excepciones |
| Estructura de book se invierte completamente | Evaluar cierre anticipado |
| Tesis invalidada (funding flipa contra posición) | Cerrar |

### 4.3 Trailing Stop

| P&L desde entry | Stop en |
|-----------------|---------|
| $0 a +$50 | Stop original |
| +$50 a +$100 | Entry + $30 (breakeven+) |
| +$100+ | High - $70 (trailing) |

---

## 5. Sizing y Risk Management

| Parámetro | Valor | Razón |
|-----------|-------|-------|
| Size por trade | 0.0004 BTC (~$27) | ~20% del capital con 3x leverage |
| Leverage | 3x | Maximiza retorno sin liquidación extrema |
| Max posiciones simultáneas | 2 | Capacidad de monitoreo por ciclo |
| Stop loss típico | -$70 a -$100 desde entry | Espacio para noise sin riesgo excesivo |
| Target típico | +$150 a +$350 desde entry | R:R >1.5:1 mínimo |
| Min holding time esperado | 5+ minutos | Winners promedian 10-30 min |
| Max trades por hora | 2-3 | Evitar overtrading |

---

## 6. Flujo Operativo por Ciclo

```
1. get_ticker BTC/USDC:USDC
2. get_funding_rate BTC/USDC:USDC

3. ¿Tengo posición abierta?
   SÍ →
     ¿Tocó stop? → Cerrar, documentar
     ¿Sell wall >20 BTC + bids vacíos? → Cerrar, documentar
     ¿Tesis invalidada? → Cerrar, documentar
     Ninguno → Mantener, reportar P&L
   NO →
     Evaluar triggers de entrada (sección 2):
     ¿Tendencia macro alcista? (>$100 en horas recientes)
     ¿Funding en rango? (-2.5% a +0.5%)
     get_orderbook → ¿bid wall >10 BTC + ask <3 BTC?
     ¿Ratio bid:ask >3:1?
     TODO SÍ → Abrir long BTC, documentar
     ALGO NO → "Sin señal", esperar

4. Reportar estado en 2-3 líneas
5. Solo editar paper-trades.md si hay acción (abrir/cerrar)
```

---

## 7. Reglas de Documentación

- Timestamps en hora local del sistema (UTC-3, Chile)
- Formato: `YYYY-MM-DD HH:MM`
- Cada trade incluye: razón de entrada, razón de salida, P&L neto
- Lecciones se agregan al paper-trades.md cuando se aprende algo nuevo
- Log del track se actualiza con cambios significativos

---

## 8. Lecciones Aprendidas (Session 1)

1. **Fees dominan en trades de baja volatilidad.** $0.018 roundtrip mínimo. Necesito moves >$60 solo para breakeven.
2. **Short squeeze thesis funciona.** Funding negativo convergiendo + precio subiendo = edge real.
3. **ETH como follower, no leader.** No operar ETH por "catch-up" o "fuerza relativa".
4. **Orderbook walls pueden ser spoofs.** Útiles pero no confiables al 100%.
5. **No shortear contra tendencia macro.** Un retroceso de $100 en rally de $300 no es reversal.
6. **Stop loss salvó capital.** Sin stop, pérdida habría sido mayor.
7. **Paciencia es el edge real.** Winners: hold 7-32 min. Losers: hold 2-4 min.
8. **Funding squeeze ≠ price squeeze.** Funding puede normalizarse sin move de precio significativo.
9. **Orderbook reversals son señales de salida.** Bid wall → sell wall en 1 min = cerrar.
10. **Un buen trade compensa muchos malos.** Trade #6 (+$0.024) > trades #1+#3 combinados.
11. **Buy-the-funding-dip es unreliable.** Post-funding es impredecible.
12. **No perseguir FOMO.** Si perdí el move, esperar el siguiente setup.

---

## 9. Señales Exploratorias (en evaluación)

### 9.1 SHORT BTC — Trend Following con Funding Confirmation
Cuando el funding es extremadamente negativo Y el precio confirma bajando, operar CON la manada:

| Criterio | Condición |
|----------|-----------|
| Funding | < -2% anualizado (consenso bearish fuerte) |
| Precio | Bajando (lower highs en últimos 3+ ciclos) |
| Orderbook | Ask walls >10 BTC, bid side delgado |

**Hipótesis:** Funding extremadamente negativo no siempre es "squeeze inminente". Cuando el precio CONFIRMA la dirección del funding, los shorts tienen razón. Ir con ellos, no contra ellos.

**Lección del trade #9:** Funding -2.24% → -2.96% mientras precio caía $160. Los shorts estaban en lo correcto. Yo insistí en long contra la evidencia.

### 9.2 Regla de Adaptación
- Si funding < -2% y precio sube → squeeze, ir long (trades #2, #6, #7 de ayer)
- Si funding < -2% y precio baja → trend, ir short (nueva señal)
- **La dirección del precio es el filtro, no el funding solo**

---

## 10. Evolución

Esta estrategia se actualiza después de cada sesión significativa de paper trading. Las lecciones alimentan los triggers. El objetivo es converger a profit factor >1.0 y win rate >40% antes de operar capital real significativo.
