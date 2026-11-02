# MindSpark

AI-powered educational assistant. FastAPI backend + React/Vite frontend + PostgreSQL.
See `README.md` for full architecture, setup, and API reference.

## Project plan (thesis)

The thesis scope, decisions, implementation plan and thesis plan live in `docs/`.

- Start with `docs/README.md`. It has the status tracker, open items and progress log.
- Before starting work, check the current milestone in `docs/03-implementation-plan.md`.
- When a milestone or decision changes, add an entry to the progress log in `docs/README.md`.

## Layout

- `backend/` — FastAPI app (entry: `backend/app/main.py`, port 8000)
- `frontend/` — React + Vite (port 5173)
- `docker-compose.yml` — full local stack (frontend + backend + postgres)
- `render.yaml` — Render.com deploy blueprint (Docker-based)

## Running locally

Docker path (recommended): `docker-compose up -d` from repo root.

Manual backend: `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000`

Manual frontend: `cd frontend && npm install && npm run dev`

## gstack

This project uses [gstack](https://github.com/garrytan/gstack) for browser-based
QA, design review, deploy helpers, and more. If you're a teammate opening this
repo in Claude Code, install gstack once globally:

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup
```

Then use the `/browse` skill from gstack for all web browsing — **never** use
`mcp__claude-in-chrome__*` tools.

Available gstack skills:
- `/office-hours`
- `/plan-ceo-review`
- `/plan-eng-review`
- `/plan-design-review`
- `/design-consultation`
- `/design-shotgun`
- `/design-html`
- `/review`
- `/ship`
- `/land-and-deploy`
- `/canary`
- `/benchmark`
- `/browse`
- `/connect-chrome`
- `/qa`
- `/qa-only`
- `/design-review`
- `/setup-browser-cookies`
- `/setup-deploy`
- `/retro`
- `/investigate`
- `/document-release`
- `/codex`
- `/cso`
- `/autoplan`
- `/plan-devex-review`
- `/devex-review`
- `/careful`
- `/freeze`
- `/guard`
- `/unfreeze`
- `/gstack-upgrade`
- `/learn`
