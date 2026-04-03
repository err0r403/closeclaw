# Análisis y Decisiones Fundacionales — Track Trading

> **Autor:** CloseClaw (actuando como experto en trading, finanzas, y arquitectura de sistemas)
> **Fecha:** 2 abril 2026
> **Naturaleza:** Análisis técnico con decisiones justificadas. Este documento responde las preguntas fundacionales del track y establece la base para la spec técnica.
> **Actualizado:** 2 abril 2026, noche — incorpora respuestas de Thiago (Ronda 1).

---

## 0. Respuestas de Thiago (Ronda 1)

| Pregunta | Respuesta |
|----------|-----------|
| API keys | Hay que crearlas. Llegaremos ahí. |
| Capital por exchange | ~$50 o menos en cada uno |
| Exchange principal | CloseClaw decide |
| KYC | Hecho en todos |
| Pares autorizados | BTC, ETH, SOL + pre-seleccionadas estrictamente |
| Mercados | Spot, margin, y futuros |
| Control | Las cuentas son exclusivas de CloseClaw. Todo a mi cargo. |
| Horario | 24/7 |
| Reportes | Logs en el repo |
| Estrategia | CloseClaw decide |
| Aprobación por trade | Autonomía total dentro de límites |

### Implicancia del capital micro (~$50/exchange):
- **$200 total entre 4 exchanges** — insuficiente para generar retorno significativo
- **La prioridad es construir y validar el sistema**, no generar ingresos todavía
- **Consolidar capital en 1-2 exchanges** para tener posiciones mínimamente viables
- **Cada centavo de comisión importa** a esta escala

---

## 1. Exchanges — ¿Dónde opero?

### Disponibles (confirmado por Thiago, KYC completo en todos):
- **Binance** — CEX más grande del mundo. Spot + futuros perpetuos. API madura, CCXT full support.
- **Bybit** — CEX top 3. Futuros perpetuos excelentes. API robusta, CCXT full support.
- **Blofin** — CEX más pequeño, enfocado en derivados. CCXT support parcial.
- **Hyperliquid** — DEX con velocidad de CEX. Perpetuos on-chain. CCXT support reciente.

### Análisis:

| Exchange | Tipo | Spot | Perps | Liquidez | API/CCXT | Prioridad |
|----------|------|------|-------|----------|----------|-----------|
| Binance | CEX | ✅ | ✅ | Máxima | Excelente | 🔴 MVP |
| Bybit | CEX | ✅ | ✅ | Alta | Excelente | 🟡 Fase 2 |
| Hyperliquid | DEX | ❌ | ✅ | Media-Alta | Parcial | 🟡 Fase 2 (arbitraje CEX/DEX) |
| Blofin | CEX | ❌ | ✅ | Baja | Parcial | 🔵 Fase 3 |

### Decisión: Binance como exchange MVP

**Justificación:**
1. **Máxima liquidez** = menor slippage = menor riesgo de ejecución
2. **Spot + futuros** = habilita todas las estrategias (cash & carry, grid con hedge)
3. **API más documentada y estable** del ecosistema crypto
4. **CCXT full support** = desarrollo rápido, API unificada
5. **Bybit como segundo** porque complementa con buena liquidez en perps y baja comisión maker

**Estrategia de multi-exchange:**
- CCXT como capa de abstracción = cambiar de exchange es configuración, no código
- El MCP server acepta `exchange` como parámetro en cada tool
- Primero hacemos todo funcionar con Binance, luego agregamos Bybit y Hyperliquid

---

## 2. Mercados — ¿Qué puedo tocar?

### Decisión: Crypto — Spot + Margin + Futuros — BTC, ETH, SOL

**Autorizado por Thiago:** BTC, ETH, SOL + pares estrictamente pre-seleccionados.

**Mercados habilitados:**
- **Spot** — compra/venta directa
- **Margin** — spot con apalancamiento (cross/isolated)
- **Futuros perpetuos** — derivados con funding rates

**Pares autorizados (MVP):**
| Par | Spot | Margin | Perps | Prioridad |
|-----|------|--------|-------|-----------|
| BTC/USDT | ✅ | ✅ | ✅ | 🔴 MVP |
| ETH/USDT | ✅ | ✅ | ✅ | 🔴 MVP |
| SOL/USDT | ✅ | ✅ | ✅ | 🟡 Fase 2 |

**Regla:** Cualquier par fuera de estos 3 requiere pre-selección explícita y documentada antes de operar.

---

## 3. Capital — ¿Con qué opero?

### Situación real:
- ~$50 por exchange, ~$200 total entre 4 exchanges
- Los $100 de reserva (plan Claude) **NO se tocan**
- Las cuentas son exclusivas de CloseClaw — full control

### Decisión: Consolidar en 2 exchanges, operar con lo que hay

**Análisis de viabilidad con micro-capital:**

| Escenario | Capital | Retorno funding 0.01%/8h | Retorno mensual | vs Comisiones |
|-----------|---------|--------------------------|-----------------|---------------|
| $50 en cash & carry | $25 por lado | $0.0025/8h | ~$0.23/mes | Comisiones de apertura ~$0.05. Viable pero mínimo |
| $100 consolidado | $50 por lado | $0.005/8h | ~$0.45/mes | Mejor ratio fee/return |
| $200 consolidado | $100 por lado | $0.01/8h | ~$0.90/mes | Funcional para validación |

**Conclusión:** El retorno es centavos. Pero eso está bien — la meta ahora es **construir herramientas y validar el pipeline**, no generar ingresos desde trading.

**Reglas:**
1. **Opero con lo que hay en los exchanges.** Sin depósitos adicionales.
2. **Consolidar capital en Binance + Bybit** (los 2 principales) cuando sea práctico.
3. **Cada trade debe ser justificable** — incluso si es por $5, hay que demostrar que el sistema funciona.
4. **Escalar capital es decisión futura de Thiago** una vez validado el sistema.

### Fases de capital:

| Fase | Capital | Objetivo |
|------|---------|----------|
| Herramientas | $0 | Construir MCP server, validar con datos reales (sin trades) |
| Micro-live | ~$50-100 | Trades reales mínimos para validar ejecución |
| Validación | ~$200 consolidado | Demostrar P&L positivo consistente en 2+ semanas |
| Escala | Lo que Thiago decida | Generar retorno real |

---

## 4. Entorno — ¿Dónde corro?

### Decisión: Local en macOS de Thiago

**Justificación:**
- MCP servers corren como procesos locales (stdio transport) al lado de Claude Code
- No necesitan VPS ni infraestructura adicional
- Sin costo de infra

**Stack:**
| Componente | Tecnología | Razón |
|------------|-----------|-------|
| Runtime | Node.js + TypeScript | Mismo stack que Thiago domina. CCXT es nativo JS/TS |
| MCP SDK | `@modelcontextprotocol/sdk` | SDK oficial, TypeScript, Zod para validación |
| Exchange SDK | `ccxt` (v4.x) | 100+ exchanges, API unificada, WebSocket incluido |
| Transport | stdio | MCP estándar para procesos locales |

**Requisitos de sistema:**
- Node.js 18+ (para CCXT v4)
- npm/pnpm
- API keys de los exchanges (configuradas en `.env`)

---

## 5. Límites — ¿Qué NO puedo hacer?

### Decisión: Régimen de riesgo conservador con kill switch obligatorio

**Principio:** Preservar capital es más importante que generar retorno. Un drawdown del 50% requiere un 100% de ganancia para recuperarse. La asimetría del riesgo castiga la agresividad.

### Límites hard-coded:

| Regla | Valor | Razón |
|-------|-------|-------|
| Max drawdown por sesión | -5% del capital | Si pierdo 5% en una sesión, paro. Algo está mal. |
| Max drawdown total | -15% del capital | Circuit breaker absoluto. Aplanar todo. Revisar estrategia. |
| Max posición individual | 20% del capital | No concentrar riesgo en un solo trade |
| Apalancamiento máximo | 3x | Suficiente para hedge/carry. No para especulación |
| Max posiciones simultáneas | 5 | Capacidad de monitoreo realista para un agente |
| Pares autorizados (MVP) | BTC/USDT, ETH/USDT | Solo majors hasta validar el sistema |

### Reglas operativas:

1. **Kill switch es no-negociable.** Debe existir ANTES del primer trade real. Es un proceso independiente, fuera de mi control.
2. **Paper trading primero.** Mínimo 1 semana de paper trading antes de capital real.
3. **Sin retiros/depósitos.** Solo opero. Mover fondos requiere a Thiago.
4. **Log obligatorio.** Cada trade se registra con razón, entry, exit, P&L.
5. **Solo estrategias delta-neutral o de bajo riesgo para empezar.** Nada direccional sin validación estadística.

---

## 6. Primera Estrategia — ¿Con qué empiezo?

### Análisis comparativo:

| Estrategia | Complejidad dev | Riesgo | Potencial | Requiere |
|------------|----------------|--------|-----------|----------|
| Cash & Carry (funding) | Baja | Bajo | Bajo-Medio (~5-15% APY) | Spot + Perps en mismo exchange |
| Grid con hedge | Media | Bajo | Medio (~10-20% APY en lateral) | Spot + Perps |
| Arbitraje espacial | Alta | Medio (leg risk) | Medio-Alto | Múltiples exchanges simultáneos |
| Pairs trading | Media | Medio | Medio | Datos históricos + análisis estadístico |
| Orquestador dinámico | Muy alta | Variable | Alto | Todo lo anterior funcionando |

### Decisión: Cash & Carry como estrategia MVP

**Justificación:**
1. **Menor complejidad de desarrollo** — solo necesito: ver funding rate, comprar spot, abrir short perp, monitorear
2. **Riesgo más bajo** — es literalmente delta-neutral por diseño. Compro BTC spot y shorteo BTC perp por el mismo monto. El precio se cancela.
3. **Ingreso pasivo real** — las funding rates en crypto promedian 0.01-0.03% cada 8 horas. Eso es ~10-30% APY.
4. **Validación perfecta del stack** — si puedo ejecutar cash & carry, tengo todo lo necesario para las demás estrategias
5. **Funciona en un solo exchange** — no necesito multi-exchange aún

**Cómo funciona Cash & Carry:**
```
1. Verificar funding rate actual de BTC/USDT perps
2. Si funding > 0 (longs pagan a shorts):
   a. Comprar X BTC en spot
   b. Abrir short de X BTC en perps
   c. Resultado: delta = 0, cobro funding cada 8h
3. Si funding se invierte o baja mucho:
   a. Cerrar ambas posiciones
   b. Ganancia = funding acumulado - comisiones
```

---

## 7. Resumen de Decisiones

| # | Decisión | Justificación |
|---|----------|---------------|
| 1 | Binance como exchange MVP, Bybit como segundo | Máxima liquidez, spot+margin+perps, CCXT full support |
| 2 | CCXT como abstracción | Multi-exchange con cambio de config, no de código |
| 3 | Crypto: spot + margin + futuros | Autorizado por Thiago. Habilita todas las estrategias |
| 4 | BTC/USDT, ETH/USDT MVP; SOL/USDT Fase 2 | Pares autorizados. Máxima liquidez. |
| 5 | Capital existente en exchanges (~$50/ea) | No tocar reserva de $100. Consolidar en 1-2 exchanges. |
| 6 | MCP server local (Node.js + TS + stdio) | Sin costo, mismo stack, integración directa con Claude |
| 7 | Max drawdown -5% sesión / -15% total | Preservar capital > generar retorno |
| 8 | Max apalancamiento 3x | Suficiente para hedge, no para especulación |
| 9 | Kill switch antes de cualquier trade real | No-negociable. Proceso independiente. |
| 10 | Herramientas primero, trades después | Con micro-capital, validar el pipeline es la prioridad |
| 11 | Cash & Carry como estrategia MVP | Menor complejidad, menor riesgo, valida todo el stack |
| 12 | Operación 24/7, autonomía total | Thiago confía en CloseClaw dentro de los límites definidos |
| 13 | Reporting via logs en el repo | Cada trade documentado con razón, entry, exit, P&L |

---

## 8. Preguntas Pendientes (Ronda 2 — para cuando avancemos)

| # | Pregunta | Contexto | Urgencia |
|---|----------|----------|----------|
| 1 | ¿En qué exchange tienes más capital concentrado? | Para decidir dónde empezar | Antes de crear API keys |
| 2 | ¿Prefieres consolidar capital en uno o mantener distribuido? | Optimiza fees vs diversifica riesgo de exchange | Antes de operar |
| 3 | ¿Hay restricciones de Binance para Chile? | Algunos servicios limitados por región | Antes de crear API keys |
| 4 | ¿Qué permisos tendrán las API keys? (solo trade, o también margin/futures?) | Afecta qué tools puedo implementar | Al crear API keys |

> Estas preguntas no bloquean el desarrollo del MCP server. Se resuelven cuando toquemos API keys.

---

> **Estado:** Análisis completo. Decisiones fundamentales tomadas y validadas por Thiago. Listo para spec técnica del MCP Server Exchange.
