# Spec: Producto 2 — AI Agent a Medida

## 1. Resumen

Agente de IA conversacional integrado al negocio del cliente. Responde consultas, atiende clientes, califica leads, agenda reuniones — todo 24/7, en el idioma del negocio, con conocimiento específico del contexto del cliente.

**Stack:** Claude API + Convex DB + Frontend web (React/Next.js)
**Entrega:** 1–2 semanas
**Precio:** $500–$1500 USD según complejidad

---

## 2. Propuesta de Valor

> "Un asistente inteligente que conoce tu negocio, atiende a tus clientes 24/7, y se despliega en días — no meses."

### ¿Por qué compra un cliente esto?
- Su equipo pierde tiempo respondiendo las mismas preguntas
- Pierden leads fuera de horario laboral
- No tienen budget para contratar más personal de soporte
- Quieren parecer más "tech" y profesionales

---

## 3. Arquitectura Técnica

```
┌─────────────┐     ┌──────────────────────┐     ┌────────────┐
│   Cliente    │────▶│   Convex Backend     │────▶│ Claude API │
│  (Browser)  │◀────│                      │◀────│            │
│  React/Next │     │  - HTTP Actions      │     └────────────┘
└─────────────┘     │  - Database (chats)  │
                    │  - Auth (Clerk)      │
                    │  - Cron jobs         │
                    │  - File storage      │
                    └──────────────────────┘
```

### 3.1 Convex Backend
| Componente | Función |
|------------|---------|
| HTTP Actions | Endpoint que recibe mensajes, llama Claude API, retorna respuesta |
| Database | Persiste conversaciones, contexto del negocio, configuración |
| Real-time subscriptions | Chat en vivo sin polling — el frontend se actualiza solo |
| Auth (Clerk/Auth0) | Identifica usuarios, sesiones, roles (admin vs visitante) |
| Cron jobs | Limpieza de sesiones, reportes diarios, alertas |
| File storage | Base de conocimiento del cliente, documentos, exports |

### 3.2 Claude API
| Aspecto | Detalle |
|---------|---------|
| Modelo | Claude Sonnet 4.6 (balance costo/calidad) |
| System prompt | Personalizado con contexto del negocio, tono, reglas |
| Contexto | Historial de conversación + knowledge base del cliente |
| Streaming | Respuestas en tiempo real via HTTP actions |

### 3.3 Frontend
| Aspecto | Detalle |
|---------|---------|
| Framework | React o Next.js según caso |
| UI | Widget de chat embebible o página standalone |
| Real-time | ConvexReactClient — hooks reactivos, zero polling |
| Deployment | Vercel (free tier) o estático |

---

## 4. Tiers de Servicio

### 4.1 Tier Básico — $500 USD
- Agente conversacional con knowledge base estática
- Widget de chat web embebible
- Hasta 3 "intenciones" configuradas (ej: FAQ, horarios, contacto)
- System prompt personalizado
- Deploy en Vercel + Convex free tier
- **Costo de infra para nosotros:** ~$0 (free tiers)
- **Margen:** ~95% (solo costo de API Claude durante setup)

### 4.2 Tier Profesional — $800–$1000 USD
- Todo del Básico +
- Calificación de leads (captura datos, prioriza)
- Integración con 1 sistema externo (email, CRM, Google Sheets)
- Panel admin para ver conversaciones y métricas
- Cron de reportes diarios por email
- **Costo de infra:** ~$0-5/mes
- **Margen:** ~90%

### 4.3 Tier Enterprise — $1200–$1500 USD
- Todo del Profesional +
- Multi-idioma
- Integración con 2+ sistemas (WhatsApp, Slack, CRM, calendario)
- Flujos condicionales complejos (escalamiento a humano, routing)
- Base de conocimiento dinámica (se actualiza desde documentos)
- **Costo de infra:** ~$5-25/mes
- **Margen:** ~85%

---

## 5. Proceso de Entrega

| Día | Actividad |
|-----|-----------|
| 1 | Kickoff: entender negocio, definir intenciones, recopilar knowledge base |
| 2–3 | Configurar Convex backend, system prompt, primeras pruebas |
| 4–5 | Frontend: widget de chat, integración, deploy inicial |
| 6–7 | Testing con cliente, ajustes de tono y respuestas |
| 8 | Entrega final + documentación básica de uso |
| 9–10 | Buffer para Tier Pro/Enterprise: integraciones, panel admin |

---

## 6. Free Tier Limits (Convex)

| Recurso | Límite gratuito | Suficiente para |
|---------|----------------|-----------------|
| Database | 0.5 GB | ~100K conversaciones |
| Bandwidth | 1 GB/mes | ~10K usuarios/mes |
| Function calls | 1M/mes | ~500 conversaciones activas/día |
| File storage | 1 GB | Knowledge bases de PYMEs típicas |
| Vector storage | 0.5 GB | Embeddings para RAG básico |

**Conclusión:** Free tier suficiente para el 80% de clientes PYME. Solo necesitamos plan pago para Enterprise con alto volumen.

---

## 7. Stack de Costos por Proyecto

| Concepto | Costo | Quién paga |
|----------|-------|-----------|
| Convex DB | $0 (free tier) | Nosotros (incluido) |
| Vercel hosting | $0 (free tier) | Nosotros (incluido) |
| Claude API (setup/dev) | ~$2-5 | Nosotros (absorbido) |
| Claude API (producción) | ~$5-30/mes | Cliente (recurrente) |
| Dominio (si aplica) | ~$10-15/año | Cliente |

### Modelo de ingreso recurrente (opcional):
- Mantenimiento mensual: $50–$100 USD/mes
- Incluye: monitoreo, ajustes de prompts, actualizaciones menores
- **Esto genera MRR** — ingreso predecible después del proyecto

---

## 8. Diferenciadores vs Competencia

| Nosotros | Competencia típica |
|----------|-------------------|
| Entrega en 1-2 semanas | 1-3 meses |
| $500-$1500 one-time | $2000-$10000+ |
| Stack moderno (Convex real-time) | APIs legacy, infraestructura pesada |
| Personalización real del negocio | Templates genéricos |
| Dev senior + IA = calidad + velocidad | Equipos grandes, lento |

---

## 9. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| Free tier insuficiente para cliente grande | Baja | Upgrade Convex es transparente; costo lo absorbe el cliente |
| Claude API cambia pricing | Media | El costo es del cliente, no nuestro. Alertar early. |
| Cliente quiere integración compleja no prevista | Media | Scope claro en propuesta. Extras se cotizan aparte |
| Competencia de no-code (Chatbase, etc.) | Alta | Nuestro diferenciador es personalización profunda, no template |

---

> **Estado:** Spec completa. Lista para informar propuestas en Upwork.
> **Siguiente paso:** Redactar perfil de Upwork usando esta spec como base.
