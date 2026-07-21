# Stelix — Project Guide

Stelix is an AI command center that manages a user's Gmail and Google Calendar through an agentic tool-calling loop.

## Stack

- **Backend** (`server/`): Express 5 + TypeScript (ESM, `"type": "module"` — local imports use `.js` extensions), Drizzle ORM + PostgreSQL (`pg`), Groq SDK agent (`llama-3.3-70b-versatile`), Winston logging, JWT auth, Zod validation, Corsair for Gmail/Calendar. Tests: Vitest. Layered: routes → controllers → services → repositories.
- **Frontend** (`client/`): Next.js 16 App Router, React 19, Tailwind CSS 4, shadcn/ui, react-hook-form + Zod.
- **Infra**: Docker Compose (Postgres), deploys to Render (API) / Vercel (client).

## Expert Skills — auto-invoke

This project ships specialized skills in `.claude/skills/`. **On every coding task, automatically load and apply the relevant skill(s) below without waiting to be asked.** Match by the kind of work, not just keywords.

| Skill | Invoke when the task touches… |
|---|---|
| `architecture-guardian` | Structure, module boundaries, SOLID, dependency direction, refactoring, preventing breakage |
| `ui-ux-pro-max` | Any UI/UX — components, layout, design system, motion, states, accessibility |
| `security-reviewer` | Auth, tokens, cookies, CSRF/XSS/CSP, secrets, authz, rate limiting, any security-sensitive change |
| `production-readiness-engineer` | Docker, CI/CD, GitHub Actions, Render/Vercel, health checks, logging, env, rollback, deploys |
| `performance-optimizer` | React rendering, bundle size, lazy loading, DB/API perf, caching, memoization, Lighthouse |
| `nextjs-app-router-expert` | Anything under `client/app` — Server/Client Components, route handlers, server actions, metadata, streaming |
| `express-backend-expert` | Anything under `server/src` — handlers, controllers, services, repositories, middleware, validation |
| `postgresql-drizzle-expert` | Schema, relations, indexes, transactions, migrations, query optimization |
| `ai-agent-engineer` | The Groq agent loop, tools, prompts, context/history, MCP/Corsair integrations, agent safety |
| `code-reviewer` | After writing/modifying code and before committing or opening a PR |
| `test-engineer` | Adding features or fixing bugs — write and run tests alongside the change |

Multiple skills often apply at once (e.g. a new API endpoint → `express-backend-expert` + `postgresql-drizzle-expert` + `security-reviewer` + `test-engineer` + `code-reviewer`). Apply all that fit.

## Standing rules

- Verify with the build and tests before declaring done: `cd server && npm run build && npm test`; `cd client && npm run build`.
- Never commit secrets, tokens, or PII — in code, logs, or test fixtures.
- Preserve existing functionality and conventions; match the surrounding code.
