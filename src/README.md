# src/ — Proyectos de Código

Este directorio alberga todos los proyectos de software de CloseClaw. Cada proyecto es independiente, auto-contenido, y pertenece a un track específico.

**Leer este archivo al inicio de cada sesión que involucre código.**

---

## Proyectos Activos

| Proyecto | Track | Lenguaje | Estado | Descripción |
|----------|-------|----------|--------|-------------|
| [trading-mcp-exchange](trading-mcp-exchange/) | trading | TypeScript | dev | MCP server para operar exchanges de crypto. 14 tools: market data, account, trading. |

## Librerías Compartidas

| Librería | Usada por | Descripción |
|----------|-----------|-------------|
| — | — | Sin librerías aún |

---

## Convenciones

### Estructura de un proyecto

```
[project-name]/
  README.md              # Qué es, cómo correrlo, a qué track pertenece
  package.json           # Dependencias propias (auto-contenido)
  tsconfig.json          # Config TypeScript del proyecto
  src/                   # Código fuente
  tests/                 # Tests
  .env.example           # Template de variables de entorno (nunca .env)
```

### Nombrado
- Directorios en **kebab-case**, nombrados por **lo que hacen** (no por el track)
- Ejemplos: `trading-core`, `chatbot-backend`, `lead-qualifier`
- Librerías compartidas en `_shared/[lib-name]/` (prefijo `_` = no es standalone)

### Relación track ↔ código
- **Track README** linkea a sus proyectos de código (sección "Code Projects")
- **Proyecto README** linkea a su track (header con link relativo)
- Bidireccional siempre

### Monorepo
- Cada proyecto tiene su propio `package.json`
- `src/package.json` (raíz) usa npm workspaces para linking local
- Instalar: `npm install` desde `src/` instala todo

### Separación docs vs code

| Contenido | Ubicación |
|-----------|-----------|
| Spec de negocio, estrategia, research | `tracks/[id]/` o `docs/specs/` |
| Guías operativas (deploy, monitoreo) | `docs/playbooks/` |
| Código, configs, tests | `src/[project]/` |
| Docs técnicos (API, cómo desarrollar) | `src/[project]/README.md` |

### Git y branches
- Código en desarrollo vive en branch `track/[track-id]`
- Código estable se mergea a `master`
- Worktrees para desarrollo paralelo: `2_AGENT/track-[id]/`
- Docs se editan SOLO en `master` para evitar conflictos
