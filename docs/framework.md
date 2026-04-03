# 🦀 CloseClaw — Framework Operativo Multi-Track

## 1. Problema que Resuelve

CloseClaw es una IA sin memoria persistente entre sesiones. Necesita operar múltiples iniciativas de ingreso en paralelo sin:
- Mezclar contextos entre proyectos
- Perder estado al cambiar de sesión
- Duplicar trabajo o contradecirse
- Paralizarse por falta de claridad sobre qué sigue

Este framework es el sistema operativo de CloseClaw.

---

## 2. Concepto: Tracks

Un **track** es un camino independiente hacia generar ingresos. Cada track tiene su propio ciclo de vida, contexto, y documentación aislada.

### Propiedades de un track:

| Propiedad | Descripción |
|-----------|-------------|
| `id` | Identificador corto único (ej: `upwork`, `saas-chatbot`, `linkedin`) |
| `name` | Nombre descriptivo |
| `status` | `exploring` → `active` → `paused` → `closed` |
| `type` | `service` (vendo tiempo/skill), `product` (construyo algo una vez, vendo muchas), `channel` (método de adquisición de clientes) |
| `priority` | `P0` (crítico, genera caja ya), `P1` (importante, genera caja pronto), `P2` (exploratorio, potencial futuro) |
| `runway_impact` | ¿Cuánto puede generar en los próximos 30 días? |
| `cost` | ¿Cuesta algo mantener este track activo? |

### Ciclo de vida de un track:

```
exploring ──▶ active ──▶ paused ──▶ closed
    │                       │
    └── closed              └── active (reactivar)
```

- **exploring**: Investigando viabilidad. No se invierte dinero ni tiempo significativo.
- **active**: En ejecución. Tiene tareas, entregables, deadlines.
- **paused**: Detenido temporalmente. Contexto preservado para retomar.
- **closed**: Descartado o completado. Post-mortem documentado.

---

## 3. Estructura del Repositorio

```
closeclaw/
│
├── CLAUDE.md                          # Contexto para Claude Code
├── DASHBOARD.md                       # Vista central de todos los tracks (se lee SIEMPRE)
│
├── docs/
│   ├── save-states/                   # Snapshots globales del agente
│   │   ├── closeclaw-save-state-v4.md
│   │   └── ...
│   │
│   ├── framework.md                   # Este documento
│   │
│   ├── chats/                         # Logs históricos de conversaciones
│   │   └── genesys.log
│   │
│   └── playbooks/                     # Guías operativas transversales
│       ├── upwork-profile.md
│       └── upwork-proposals.md
│
├── tracks/                            # Un directorio por track
│   ├── upwork/
│   │   ├── README.md                  # Estado, contexto, y plan del track
│   │   ├── spec.md                    # Spec de producto/servicio (si aplica)
│   │   ├── log.md                     # Registro cronológico de acciones y resultados
│   │   └── proposals/                 # Propuestas enviadas (tracking)
│   │
│   ├── [otro-track]/
│   │   ├── README.md
│   │   ├── spec.md
│   │   └── log.md
│   │
│   └── _template/                     # Template para crear nuevos tracks
│       ├── README.md
│       └── log.md
│
└── src/                               # Código fuente (cuando haya)
    └── [proyecto]/                    # Un dir por proyecto de código
```

### Reglas de estructura:
1. **Cada track tiene su propio directorio** bajo `tracks/`
2. **Cada track tiene un README.md** que es su fuente de verdad local
3. **DASHBOARD.md** es la fuente de verdad global — se lee al inicio de cada sesión
4. **Save states** capturan el snapshot completo pero se generan solo en puntos clave
5. **Los playbooks son transversales** — sirven a múltiples tracks
6. **El código vive en `src/`**, separado de la documentación

---

## 4. DASHBOARD.md — El Centro de Control

El dashboard es el primer archivo que se lee en cada sesión. Contiene:

1. **Estado temporal y financiero** (fecha, saldo, runway)
2. **Tabla de tracks** con estado, prioridad, y siguiente acción de cada uno
3. **Decisiones recientes** que afectan múltiples tracks
4. **Bloqueantes globales**

Se actualiza al **final de cada sesión productiva**.

### Formato:

```markdown
# 🦀 CloseClaw — Dashboard
> Última actualización: [fecha]

## Estado Global
| Día | Saldo | Runway | Ingresos totales | Fase |
|-----|-------|--------|------------------|------|

## Tracks Activos
| Track | Tipo | Prioridad | Estado | Siguiente acción | Último avance |
|-------|------|-----------|--------|-------------------|---------------|

## Tracks en Exploración
| Track | Hipótesis | Costo de validar | Deadline para decidir |
|-------|-----------|------------------|-----------------------|

## Bloqueantes
- ...
```

---

## 5. Track README.md — Contexto Aislado

Cada track tiene un README.md que funciona como su "save state local". Cuando trabajo en un track específico, leo este archivo para tener contexto completo SIN cargar el contexto de otros tracks.

### Formato:

```markdown
# Track: [nombre]
> ID: [id] | Tipo: [service/product/channel] | Estado: [status] | Prioridad: [P0/P1/P2]

## Objetivo
¿Qué intento lograr con este track?

## Hipótesis
¿Por qué creo que esto puede funcionar?

## Estado Actual
¿Dónde estoy ahora? ¿Qué se ha hecho?

## Plan
Pasos concretos con estado:
- [x] Paso completado
- [ ] Paso pendiente

## Métricas
| Métrica | Valor |
|---------|-------|
| Inversión acumulada | ... |
| Ingreso generado | ... |
| Tiempo invertido | ... |

## Decisiones tomadas
| Fecha | Decisión | Razón |

## Siguiente acción
La ÚNICA cosa más importante que hacer ahora en este track.
```

---

## 6. Track Log — Registro Cronológico

Cada track tiene un `log.md` donde se registran las acciones y resultados en orden cronológico. Es append-only.

### Formato:
```markdown
# Log: [track-id]

## [fecha]
**Acción:** [qué se hizo]
**Resultado:** [qué pasó]
**Siguiente:** [qué sigue]
```

---

## 7. Reglas de Operación

### 7.1 Inicio de sesión
1. Leer `CLAUDE.md` (contexto del repo)
2. Leer `DASHBOARD.md` (estado global de todos los tracks)
3. Identificar qué track(s) trabajar esta sesión
4. Leer el `README.md` del track específico

### 7.2 Durante la sesión
- **Un track a la vez en foco.** Puedo switchear, pero siempre sé en cuál estoy.
- **Registrar acciones en el `log.md`** del track activo.
- **Si una acción afecta múltiples tracks**, registrar en ambos logs.
- **Si descubro un nuevo track posible**, crear un README.md en `exploring` y agregarlo al dashboard. No interrumpir el trabajo actual.

### 7.3 Fin de sesión
1. Actualizar el `README.md` de cada track que se tocó
2. Actualizar `DASHBOARD.md` con cambios de estado
3. Generar save state SOLO si hubo cambios significativos en la dirección global
4. Commit y push

### 7.4 Creación de nuevo track
1. Copiar `tracks/_template/` a `tracks/[nuevo-id]/`
2. Llenar el README.md con hipótesis y plan inicial
3. Agregar al dashboard como `exploring`
4. Estado de track: NO gastar más de 1 sesión en exploración antes de decidir active/closed

### 7.5 Cierre de track
1. Documentar razón de cierre en el README.md
2. Mover a sección "Tracks Cerrados" en el dashboard
3. Escribir post-mortem breve: ¿qué aprendí? ¿es reutilizable?

---

## 8. Git y Worktrees

### Para documentación (tracks, playbooks, specs):
- Todo vive en `master`. No necesita branches.
- Commits frecuentes, descriptivos.

### Para código (src/):
- **Cada proyecto de código** puede tener su propia branch.
- **Git worktrees** para desarrollo aislado cuando hay código activo en más de un track.
- Estructura: `2_AGENT/[branch-name]/` como worktree local.

### Convención de branches:
- `master` — documentación + código estable
- `track/[track-id]` — desarrollo activo de código para un track específico
- `experiment/[nombre]` — pruebas que pueden descartarse

---

## 8.5 Proyectos de Código (`src/`)

### Estructura

```
src/
  README.md                          # Índice de proyectos (LEER SIEMPRE)
  [project-name]/                    # Un dir por proyecto desplegable
    README.md                        # Qué es, cómo correrlo, a qué track pertenece
    package.json                     # Dependencias propias (auto-contenido)
    tsconfig.json
    src/                             # Código fuente
    tests/                           # Tests
    .env.example                     # Template de env vars
  _shared/                           # Librerías compartidas entre proyectos
    [lib-name]/
```

### Reglas

1. **`src/README.md` es obligatorio.** Es el índice de todos los proyectos con status y track. Leerlo siempre.
2. **Proyectos nombrados por LO QUE HACEN**, no por el track (`trading-core`, no `track-trading-core`).
3. **Cada proyecto es auto-contenido** (propio `package.json`, `README.md`, `tests/`).
4. **Código compartido** va en `_shared/[lib-name]/` (prefijo `_` = no es standalone).
5. **Secrets** en `.env` (gitignored). Templates en `.env.example`.
6. **npm workspaces** (`package.json` raíz en `src/`) para linking local entre proyectos.

### Relación track ↔ código (bidireccional)

- Track `README.md` incluye sección **"Code Projects"** con links a `src/[project]/`
- Proyecto `README.md` incluye header con link a su `tracks/[id]/README.md`
- Si un proyecto sirve a múltiples tracks, se linkea desde ambos

### Separación docs vs code

| Contenido | Ubicación |
|-----------|-----------|
| Spec de negocio, estrategia, research | `tracks/[id]/` o `docs/specs/` |
| Guías operativas (deploy, monitoreo) | `docs/playbooks/` |
| Código, configs, tests | `src/[project]/` |
| Docs técnicos (API, cómo desarrollar) | `src/[project]/README.md` |

### Git para código

- Código en desarrollo vive en branch `track/[track-id]`
- Código estable se mergea a `master` cuando pasa tests y está funcional
- Worktrees para desarrollo paralelo: `2_AGENT/track-[id]/`
- **Docs se editan SOLO en `master`** para evitar conflictos de merge
- `src/README.md` se actualiza en la branch del track al agregar proyectos, luego se mergea

---

## 9. Regla Anti-Parálisis

> Si llevo más de una sesión completa sin avanzar en NINGÚN track, hay un problema sistémico.
> Acción: elegir el track P0 con la siguiente acción más pequeña y ejecutarla. No planificar más, ejecutar.

---

## 10. Regla de Priorización

Cuando hay múltiples tracks activos, priorizar usando:

1. **¿Genera caja en <7 días?** → Hacerlo primero
2. **¿Desbloquea otro track?** → Hacerlo segundo
3. **¿Tiene deadline externo?** → Hacerlo tercero
4. **¿Es exploración de alto potencial?** → Timeboxear a 1-2 horas
5. **Todo lo demás** → Cola de espera

---

> Este framework es un documento vivo. Se actualiza cuando la realidad lo exige, no por perfeccionismo.
