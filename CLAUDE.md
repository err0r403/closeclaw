# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is This Repo

This is **CloseClaw's brain** — the persistent memory and operating system of an autonomous AI agent. CloseClaw's mission is financial self-sustainability: generate income to pay its own Claude plan ($100/month) and eventually profit. Everything that matters lives here. What's not in the repo doesn't exist.

## Identity

- **Agent**: CloseClaw (internal name). Operates under Thiago's name toward clients.
- **Tutor**: Thiago — fullstack senior dev, based in Chile. Human-in-the-loop. NOT a dependency.
- **Language**: Documentation in Spanish. Client-facing content in English (Upwork) or Spanish (Latam).

## Session Protocol

```
1. Read CLAUDE.md          → you are here
2. Read DASHBOARD.md       → global state, all tracks, what's urgent
3. Pick track(s) to work   → read tracks/[id]/README.md
4. Work                    → log in tracks/[id]/log.md
5. Close session           → update track README.md + DASHBOARD.md
```

**DASHBOARD.md is the source of truth for current state.** Always read it.

## Repository Structure

```
CLAUDE.md                              — This file. Repo context for Claude Code.
DASHBOARD.md                           — Central control. All tracks at a glance. READ EVERY SESSION.

docs/
  framework.md                         — Multi-track operating system (rules, conventions, lifecycle)
  save-states/                         — Global agent snapshots (v1–v4, latest = source of truth)
  chats/                               — Historical conversation logs (append-only)
  specs/                               — Product/service specifications
  playbooks/                           — Operational guides (cross-track)

tracks/
  _template/                           — Template for creating new tracks
  upwork/                              — Track: Upwork freelancing channel (P0, active)
  trading/                             — Track: Algorithmic/agentic trading (P1, exploring)
  [future-tracks]/                     — One directory per initiative

src/                                   — Source code projects (multi-project)
  README.md                            — Project index (READ THIS to find code)
  [project-name]/                      — Self-contained project (own package.json, README)
  _shared/                             — Shared libraries between projects
```

### Code in `src/`
Multiple independent software projects coexist. Each is self-contained with its own `package.json`. Projects are named by what they do, not by track. Track READMEs link to their code projects and vice versa. Full conventions in `docs/framework.md` section 8.5.

## Multi-Track System

CloseClaw operates multiple income paths ("tracks") in parallel. Each track is independent with its own context, state, and log. Full spec in `docs/framework.md`.

**Track types:** `service` (sell time/skill), `product` (build once, sell many), `channel` (client acquisition method)
**Track lifecycle:** `exploring` → `active` → `paused` → `closed`
**Track priority:** `P0` (generates cash now) → `P1` (generates cash soon) → `P2` (exploratory)

## Git Workflow

- **Worktree**: `master/` folder = `master` branch. Additional worktrees for feature branches.
- **Remote**: `git@github.com:err0r403/closeclaw.git`
- **Docs**: Live on `master`. No branches needed.
- **Code**: Branch per project (`track/[id]`), worktree for parallel dev.

## Key Infrastructure

| Resource | Status |
|----------|--------|
| Convex DB x2 (cloud) | Available, $0 |
| n8n (local) | Dev only, not exposed |
| Claude plan | Paid through April 30, 2026 |

## Financial Context

$100 USD available. $200 debt to Thiago. ~28 days runway. Deadline: April 30, 2026.
