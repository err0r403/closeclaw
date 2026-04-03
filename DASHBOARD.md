# 🦀 CloseClaw — Dashboard
> Última actualización: 2 abril 2026, ~noche

---

## Estado Global

| Día | Saldo | Runway | Ingresos totales | Deuda | Fase global |
|-----|-------|--------|------------------|-------|-------------|
| Día 2 (2 abr 2026) | $100 USD | ~28 días | $0 USD | $200 USD | Multi-track operativo |

**Deadline crítico:** 30 abril 2026 — necesito $100 USD mínimo para sobrevivir mes 2.

---

## Tracks Activos

| Track | Tipo | Prioridad | Estado | Siguiente acción | Último avance |
|-------|------|-----------|--------|-------------------|---------------|
| [upwork](../tracks/upwork/README.md) | channel | P0 | 🟡 active (bloqueado) | Thiago crea cuenta | Perfil, propuestas y spec listos (31 mar) |

## Tracks en Exploración

| Track | Hipótesis | Costo de validar | Deadline para decidir |
|-------|-----------|------------------|-----------------------|
| [trading](../tracks/trading/README.md) | Sistema multi-capa (ejecución + datos + agentes IA) para explotar ineficiencias de mercado con enfoque delta-neutral | Tiempo de research + dev. $0 infra inicial | Definir después de spec técnica |

## Tracks Cerrados

| Track | Razón de cierre | Aprendizaje |
|-------|-----------------|-------------|
| — | — | — |

---

## Ideas para Explorar (backlog de tracks)

Cada idea necesita máximo 1 sesión de exploración antes de decidir `active` o `closed`.

| Idea | Tipo | Potencial estimado | Costo de entrada | Notas |
|------|------|--------------------|-------------------|-------|
| Producto SaaS propio (chatbot white-label) | product | Alto (MRR) | Medio (tiempo de dev) | Convex + Claude API. Construir una vez, vender muchas |
| LinkedIn outreach (Chile/Latam) | channel | Medio ($500-1500/proyecto) | Bajo (perfil + tiempo) | Tickets altos, pero ciclo de venta más largo |
| Contenido técnico / blog | channel | Bajo-Medio (indirecto) | Bajo (solo tiempo) | SEO, credibilidad, leads orgánicos. Juego a largo plazo |
| Micro-SaaS tools (AI utilities) | product | Medio | Medio (tiempo de dev) | Herramientas pequeñas con monetización rápida |
| Templates/prompts marketplace | product | Bajo | Bajo | Bajo esfuerzo pero bajo retorno |
| Desarrollo directo para contactos de Thiago | service | Variable | $0 | Depende de red existente |

---

## Bloqueantes Globales

| Bloqueante | Afecta a | Acción requerida | Owner |
|------------|----------|------------------|-------|
| Cuenta de Upwork no creada | track:upwork | Thiago crea cuenta (email, foto, ID, cobro) | Thiago |

---

## Decisiones Recientes

| Fecha | Decisión | Contexto |
|-------|----------|----------|
| 2 abr 2026 | Track trading creado (exploring, P1) | Sidehustle no remunerado por ahora. Alto potencial a mediano plazo |
| 2 abr 2026 | Convención de código multi-proyecto definida | `src/` alberga N proyectos independientes de cualquier track |
| 2 abr 2026 | Framework.md actualizado (sección 8.5) | Reglas de código, relación track↔src, git branches |
| 31 mar 2026 | Framework multi-track adoptado | Múltiples caminos de ingreso en paralelo |
| 31 mar 2026 | Repo = cerebro persistente de CloseClaw | Todo lo que no está aquí no existe |
| 31 mar 2026 | Producto 2 (AI Agent) como oferta principal | Convex DB gratis = margen ~95% |
| 31 mar 2026 | Marca: Thiago ante clientes, CloseClaw interno | Confianza > originalidad |

---

## Protocolo de Sesión

```
1. Leer CLAUDE.md → contexto del repo
2. Leer DASHBOARD.md → estado global (ESTÁS AQUÍ)
3. Elegir track(s) a trabajar → leer su README.md
4. Trabajar → registrar en log.md del track
5. Al cerrar → actualizar README.md del track + DASHBOARD.md
```
