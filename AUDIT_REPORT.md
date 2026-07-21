# Stelix Project Audit Report

**Date:** July 21, 2026
**Auditor:** Lead Software Architect
**Status:** Final

---

## Executive Summary

**Overall Completion:** ~70%
**Estimated Production Readiness:** PRE-PRODUCTION (not ready for launch)

Stelix has a well-structured, feature-rich codebase with a clear layered architecture, working authentication, Google integrations, AI capabilities, and a polished UI. However, critical security gaps (committed secrets, no CSP/Helmet, no CSRF protection), missing deployment infrastructure (no Dockerfiles, no CI/CD, no Render/Vercel config), and zero test coverage on core modules make it **unsafe for production deployment**.

The project has strong foundations — the Corsair integration layer, agent-based AI system, and Drizzle ORM schema are particularly well-architected. The Command Center frontend is sophisticated with loading skeletons, error states, keyboard shortcuts, and a command palette.

### Major Strengths
- Clean layered architecture (Routes → Controllers → Services → Repositories → DB)
- Comprehensive authentication system (email/password, Google OAuth, JWT cookies)
- Rich Google integrations (Gmail, Calendar) via Corsair SDK with multi-tenant isolation
- Sophisticated AI agent system with tool calling (Gmail, Calendar, Search)
- Polished frontend with loading/error/empty states on every page
- Full Drizzle ORM schema with migrations
- Good use of React.memo and client-side caching

### Major Weaknesses
- **CRITICAL:** Live production secrets committed to git repository
- **CRITICAL:** No Helmet/CSP security headers, no CSRF protection
- **CRITICAL:** Cookie domain hardcoded to production, breaks local development
- Almost zero test coverage beyond 2 test files
- No Dockerfiles for application containers
- No CI/CD pipeline or deployment configuration
- No refresh token mechanism (single 7-day access token)
- Two parallel Gmail services causing code duplication and confusion
- No server-side caching (dashboard calls LLM on every request)
- No webhook/realtime sync for Google services

---

## Completed Features

### Authentication
- Email/password registration with bcrypt (12 salt rounds)
- Email verification flow (JWT token sent via Resend)
- Login with password verification
- Google OAuth login (ID token verification via google-auth-library)
- JWT access tokens stored in HTTP-only cookies
- Logout (cookie clearing)
- Forgot/reset password with JWT tokens
- Profile update with Cloudinary avatar upload
- Protected routes on both frontend (Next.js middleware) and backend (verifyAccessToken + requireUserId)
- Rate limiting (100 req/min in-memory)

### Dashboard
- Time-based greeting with email/meeting counts
- Quick actions (Summarize Inbox, Today's Meetings, Focus Today, Open Assistant)
- Stats cards (Emails, Meetings, Connected Apps)
- AI-generated summary (3 bullet points)
- Recent emails list
- Upcoming events list
- Loading, error, and empty states

### Command Center
- Command bar with greeting, unread/today counts, palette trigger, refresh
- Quick actions grid (Compose Email, Create Event, Schedule Meeting, Open Inbox, Open Calendar)
- Productivity summary metrics tiles
- Inbox widget with connection status
- Calendar widget showing today's events
- Upcoming meetings list with countdown
- Activity feed (recent sent emails + events)
- AI assistant panel embedded
- Command palette (Cmd+K) with live search
- Keyboard shortcuts (C, M)
- Modals: Compose Email, Create Event, Event Details, Reschedule
- Progressive loading with skeletons
- 60-second client-side cache with background revalidation

### Email / Mail
- Inbox and Sent tabs
- Gmail search
- Email viewer with reply support
- Compose email modal
- Manual refresh
- Loading/error/empty states

### Calendar
- Month, Week, Day, and Agenda views
- Event creation, editing, deletion
- Event search
- Upcoming events sidebar
- Event details drawer
- Reschedule modal
- Loading/error/empty states

### Settings
- Profile information display
- Gmail and Google Calendar integration management (connect/disconnect)
- OAuth redirect flow
- Logout button

### Google Integrations
- Google OAuth consent flow via Corsair
- Gmail: inbox, sent, search, send, read email
- Google Calendar: list, search, create, update, delete, reschedule events
- Connection status API per provider
- Multi-tenant isolation via `corsair.withTenant(userId)`
- Integration guard (requires connected provider)
- Token lifecycle managed by Corsair SDK (automatic refresh)

### AI Features
- Agent system with multi-step tool calling (up to 5 iterations)
- 10 tools: send_email, search_emails, get_inbox, get_email, create_calendar_event, update_calendar_event, delete_calendar_event, list_calendar_events, search_calendar_events, search_all
- Intent classification (focus, summarize, calendar, email, unknown)
- Dashboard AI summary
- Inbox summary
- Daily focus briefing
- Calendar summary
- Chat history persistence (ai_chats table)

### Backend Infrastructure
- Express 5 with ESM modules
- Drizzle ORM with PostgreSQL schema (7 tables)
- Full migration file
- Zod validation on all routes
- Custom error class hierarchy (AppError, NotFoundError, UnauthorizedError, etc.)
- Winston logger with structured logging
- Request ID tracking middleware
- Corsair SDK bootstrap with Google OAuth credentials
- Environment variable validation via Zod

### Frontend Infrastructure
- Next.js 16 App Router with React 19
- Tailwind CSS v4 with shadcn/ui components
- Radix UI primitives
- react-hook-form with zod resolvers
- Custom API client with cookie-based auth
- Next.js middleware for route protection
- GoogleOAuthProvider

---

## Partially Completed Features

### Authentication
| Feature | Status | What's Missing |
|---------|--------|----------------|
| Refresh Token | 🟡 Partial | No refresh token endpoint or token rotation. Single 7-day access token with no way to revoke. |
| Session Management | 🟡 Partial | Stateless JWT — no server-side session store. Logout only clears cookie, no token blacklisting. |
| CSRF Protection | 🟡 Partial | Cookie configured with `sameSite: "none"` which disables browser CSRF protection. No CSRF tokens. |

### Google Integrations
| Feature | Status | What's Missing |
|---------|--------|----------------|
| Email Sync | 🟡 Partial | Request-driven only. No background sync, no push notifications, no polling. |
| Calendar Sync | 🟡 Partial | Request-driven only. No background sync or push notifications. |
| Realtime Updates | 🟡 Partial | No webhooks, no PubSub subscriptions, no WebSocket/SSE. |
| Webhook Support | 🟡 Missing | No webhook endpoints for Gmail or Calendar push notifications. |

### Deployment
| Feature | Status | What's Missing |
|---------|--------|----------------|
| Docker | 🟡 Partial | Docker Compose for PostgreSQL only. No Dockerfile for Express or Next.js. |
| Vercel | 🟡 Partial | Speed Insights integrated. No vercel.json, no Next.js output config. |
| Render | 🟡 Missing | No render.yaml or Render-specific config. |
| CI/CD | 🟡 Missing | No GitHub Actions, no deploy scripts. |

### Performance
| Feature | Status | What's Missing |
|---------|--------|----------------|
| Code Splitting | 🟡 Partial | No `dynamic()` imports or `React.lazy()`. All components statically imported. |
| Server Caching | 🟡 Partial | No Redis or in-memory API cache. Dashboard calls Groq LLM on every request. |
| Response Compression | 🟡 Missing | No `compression` middleware. |
| Image Optimization | 🟡 Partial | No `next/image` usage. |

### AI Features
| Feature | Status | What's Missing |
|---------|--------|----------------|
| AI Summary Persistence | 🟡 Partial | Recalculated on every dashboard load via Groq API, not stored/cached. |
| Web Search | 🟡 Partial | `TAVILY_API_KEY` defined in env but never used in code. |
| Multi-model Support | 🟡 Partial | Only Groq's llama-3.3-70b-versatile. No OpenAI/Anthropic fallback. |

---

## Missing Features

### Pages / Routes
- **Profile Page** — Referenced in app header dropdown (`router.push("/profile")`) but no file exists at `app/profile/`
- **Notifications Page** — No route or component exists
- **Workspace Page** — No route or component exists
- **Tasks Page** — No route or component exists
- **Activity Page** — Dedicated page doesn't exist (only widget in command center)

### Security
- **Helmet Middleware** — Not installed. No security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Content Security Policy** — Not configured anywhere
- **CSRF Protection** — No CSRF tokens or double-submit pattern
- **.env.example Files** — Not created despite `.gitignore` having negate rule
- **Proxy Trust** — `app.set('trust proxy')` not configured (rate limiter IP detection broken behind proxy)

### Infrastructure
- **Dockerfile** — No container build config for Express or Next.js
- **vercel.json** — No deployment configuration
- **render.yaml** — No deployment configuration
- **CI/CD Pipeline** — No GitHub Actions or other CI
- **Sentry/Error Tracking** — Not configured
- **Monitoring** — Winston logger only outputs to console, no remote transport

### Testing
- Unit tests for AuthService, GmailService, CalendarService, AgentService, all controllers, all middleware, all validations
- No test coverage thresholds configured

### Features
- **Realtime Sync** — No WebSocket, SSE, or polling for Gmail/Calendar updates
- **Webhooks** — No push notification endpoints
- **Refresh Tokens** — No token rotation/refresh mechanism
- **Notifications** — No user notification system
- **Tasks** — No task management feature
- **Workspace** — No workspace/collaboration feature
- **Provider Expansion** — Only Gmail and Google Calendar; no Outlook, Slack, Zoom, etc.

---

## Production Readiness

### Authentication: 🟡 70%
- ✅ Working auth flow with JWT + Google OAuth
- ✅ bcrypt password hashing
- ✅ Email verification and password reset
- ❌ No refresh tokens
- ❌ No CSRF protection
- ❌ Cookie domain hardcoded to production
- ❌ sameSite: "none" with no CSRF defense
- ❌ Auth endpoint leaks "User already exists"
- ❌ No password complexity enforcement

### Backend: 🟡 65%
- ✅ Clean layered architecture
- ✅ Drizzle ORM with proper schema
- ✅ Zod validation on most routes
- ✅ Custom error handling
- ✅ Winston structured logging
- ❌ Two parallel Gmail services (code duplication)
- ❌ Name collision: EmailService (Resend) vs EmailService (Gmail)
- ❌ No server-side caching
- ❌ No response compression
- ❌ N+1 Gmail API calls
- ❌ Calendar/Email services no ownership checks (mitigated by Google API enforcement)

### Frontend: 🟢 85%
- ✅ Well-organized component structure
- ✅ Loading/error/empty states on all pages
- ✅ React.memo optimizations
- ✅ Client-side caching with TTL
- ✅ Keyboard shortcuts and command palette
- ✅ Responsive layout
- ❌ No route-level loading.tsx/error.tsx
- ❌ No code splitting / dynamic imports
- ❌ No next/image usage
- ❌ Profile page referenced but missing (404 on click)
- ❌ No React.memo on dashboard page

### Security: 🔴 30%
- ❌ **CRITICAL:** Live secrets committed to git
- ❌ No Helmet/CSP/HSTS headers
- ❌ No CSRF protection
- ❌ JWT algorithm not explicitly set
- ❌ 7-day access token (too long)
- ❌ No refresh token mechanism
- ❌ No proxy trust config
- ❌ Rate limiter not shared across instances
- ❌ Auth endpoint leaks user existence
- ❌ Password complexity not enforced
- ✅ Drizzle parameterized queries (SQL injection safe)
- ✅ HTTP-only cookies
- ✅ Rate limiting active (though imperfect)

### Deployment: 🔴 20%
- ❌ No Dockerfile for app containers
- ❌ No vercel.json
- ❌ No render.yaml
- ❌ No CI/CD pipeline
- ❌ No .env.example files
- ✅ Docker Compose for PostgreSQL
- ✅ @vercel/speed-insights integrated
- ✅ Start/build npm scripts exist

### Performance: 🟡 55%
- ✅ React.memo on 6 components
- ✅ Client-side caching (60s TTL)
- ✅ Performance logging on dashboard
- ❌ No code splitting
- ❌ No lazy loading
- ❌ No dynamic imports
- ❌ No server-side caching
- ❌ No response compression
- ❌ Dashboard calls LLM synchronously on every load
- ❌ Agent can make up to 5 sequential LLM calls

### AI: 🟢 75%
- ✅ Fully functional agent system with tool calling
- ✅ Intent classification
- ✅ AI summaries (dashboard, inbox, focus)
- ✅ Chat history persistence
- ✅ Robust error recovery in agent loop
- ❌ AI summary not persisted (recalculated each time)
- ❌ Only one AI model (Groq), no fallback
- ❌ Web search (Tavily) configured but unused

### Integrations: 🟢 80%
- ✅ Corsair SDK fully configured with Gmail + Calendar
- ✅ Working OAuth flow with Google
- ✅ Multi-tenant isolation
- ✅ Connection status API
- ❌ No webhook/realtime support
- ❌ No provider expansion beyond Google
- ❌ No email/calendar background sync

### Documentation: 🔴 25%
- ❌ No JSDoc on any service/controller/route files
- ❌ No API documentation
- ❌ No deployment guide
- ❌ No testing instructions
- ✅ README with project overview, setup, lessons learned

### Testing: 🔴 15%
- ❌ Only 2 test files (OAuth service + integration isolation)
- ✅ OAuth service tests are comprehensive (5 tests)
- ✅ Integration isolation tests (8 tests)
- ❌ No tests for Auth, Gmail, Calendar, Agent, Dashboard, controllers, middleware, validations

---

## Remaining High Priority Work

### Critical (Immediate)
1. **Rotate ALL committed secrets** — Server `.env` and client `.env.local` contain live credentials (Neon DB, Cloudinary, Resend, Google OAuth, Groq, Tavily, Corsair, JWT secrets). Use `git filter-branch` / `bfg` to remove from git history.
2. **Add Helmet middleware** — Implement CSP, HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection headers.
3. **Add CSRF protection** — Implement double-submit cookie pattern or CSRF tokens.
4. **Fix cookie configuration** — Make domain dynamic based on environment. Remove hardcoded `.stelix.akhtarraza.in`. Add `secure` flag conditional on HTTPS.
5. **Remove secrets from .env files** — Move to environment variables in deployment platform. Create `.env.example` files with placeholder values.

### High
1. **Implement refresh token mechanism** — Short-lived access tokens (15-60 min) with refresh tokens for rotation.
2. **Add `trust proxy` setting** — Fix rate limiter IP detection behind reverse proxies.
3. **Add per-endpoint rate limiting** — Stricter limits on `/auth/login`, `/auth/register` (5 req/min) to prevent brute force.
4. **Add `compression` middleware** — Reduce bandwidth for API responses.
5. **Create Dockerfile** — For Express backend (multi-stage build) and optionally for Next.js.
6. **Add server-side caching** — Cache dashboard data, LLM summaries. Consider Redis.
7. **Persist AI summaries** — Cache/store dashboard AI summary to avoid LLM call on every page load.
8. **Profile page 404 bug** — Create `app/profile/page.tsx` or remove the dropdown link.
9. **Unify Gmail services** — Remove duplicate `EmailService` (services/email.service.ts), consolidate into `GmailService`.
10. **Rename `EmailService` conflict** — Rename `config/email.ts` `EmailService` to `TransactionalEmailService`.

### Medium
1. **Add test coverage** — Start with AuthService, GmailService, CalendarService, AgentService.
2. **Add code splitting** — Dynamic imports for modals (ComposeEmailModal, CreateEventModal, RescheduleModal) and CommandPalette.
3. **Remove unused code** — `@corsair-dev/cli`, `UpdateIntegrationInput`, `connectIntegrationSchema`, unused API modules.
4. **Add route-level `loading.tsx` files** — Leverage Next.js built-in Suspense boundaries.
5. **Configure Next.js image optimization** — Use `next/image` for Cloudinary avatars and landing page images.
6. **Add error boundary on frontend** — Wrap pages in Next.js `error.tsx` for graceful crash recovery.
7. **Fix validation gap** — Add `validate()` middleware to `GET /api/emails/` route.
8. **Add JSDoc to public methods** — At minimum on all service classes.

### Low
1. **Add .env.example files** — Document all required environment variables.
2. **Create vercel.json** — Deployment config for Vercel.
3. **Create render.yaml** — Deployment config for Render.
4. **Set up CI/CD** — GitHub Actions for lint, test, build.
5. **Add Sentry** — Error tracking for production.
6. **Replace console.log with logger** — In `index.ts` and `auth.service.ts`.
7. **Add indexes on Corsair tables** — Foreign key columns: `tenant_id`, `integration_id`, `account_id`.
8. **Fix password validation** — Add complexity requirements (uppercase, lowercase, number, special char).
9. **Fix auth endpoint user enumeration** — Return generic message on registration conflict.
10. **Fix typos** — "Stellix" vs "Stelix" inconsistency in email templates.

---

## Technical Debt

### Architecture
| Issue | File(s) | Impact | Priority |
|-------|---------|--------|----------|
| Two parallel Gmail services | `services/email.service.ts` vs `services/gmail.service.ts` | Duplicate code, confusing API surface (both `/api/emails` and `/api/gmail`) | High |
| Name collision: `EmailService` | `config/email.ts` and `services/email.service.ts` | Same class name serves Resend transactional emails AND Gmail API | High |
| Duplicate AI summary generation | `dashboard.service.ts`, `assistant.service.ts` | 3 similar Groq prompt patterns for email summarization | Low |
| Calendar type overlap | `calendar.service.ts` (`MappedCalendarEvent` vs `EventSummary`/`EventDetail`) | Two representations of same data, older one likely unused | Medium |
| Repetitive controller pattern | All 8 controllers | Same logger.info → await → res.status().json() pattern repeated | Low |

### Dead Code
| Item | File | Reason |
|------|------|--------|
| `connectIntegrationSchema` | `validations/integration.validation.ts` | Defined and exported but never imported |
| `UpdateIntegrationInput` | `types/integration.types.ts` | Defined but `update()` method never called |
| `IntegrationRepository.update()` | `repositories/integration.repository.ts` | Complete method, no caller exists |
| `getEmails()` | `client/lib/api/email.ts` | Exported but never imported by any client file |
| `getDashboard()` | `client/lib/api/dashboard.ts` | Exported but never imported |
| `sendMessage()` | `client/lib/api/assistant.ts` | Exported but never imported |
| `Email` type | `client/types/email.ts` | Never imported; client uses `gmail.ts` types instead |
| `@corsair-dev/cli` | `server/package.json` | Not used in any source file |
| `shadcn` | `client/package.json` | CLI tool in runtime dependencies |
| `@types/cors` | `server/package.json` | Redundant — `cors` includes its own types |
| `tsx` | `server/package.json` devDeps | Not used in any npm script |
| `tsc-watch` | `server/package.json` | In dependencies instead of devDependencies |

### Code Quality
| Issue | File | Detail |
|-------|------|--------|
| `as any` type casts | `config/jwt.ts:21,34,65` | `expiresIn` parameter cast as `any` instead of proper type |
| `console.log` not logger | `index.ts:10,15,18` | Server startup uses raw console.log instead of Winston |
| `console.error` not logger | `auth.service.ts:289` | Error handling bypasses logging framework |
| No JSDoc on services | All service files | Zero documentation on public methods |
| No JSDoc on controllers | All controller files | Zero documentation on handlers |
| Missing try-catch in services | `gmail.service.ts`, `calendar.service.ts`, others | External API errors not handled at service level |
| Missing validation on route | `routes/email.routes.ts:17-20` | `GET /api/emails/` has no `validate()` middleware |

---

## Security Issues

### Critical
| # | Issue | Severity | File | Detail |
|---|-------|----------|------|--------|
| S1 | Live production secrets committed | CRITICAL | `server/.env`, `client/.env.local` | Neon DB URL, Cloudinary keys, Resend API key, Google OAuth secrets, Groq API key, Tavily key, Corsair keys, JWT secrets all in git |
| S2 | No Helmet middleware | CRITICAL | `server/src/config/server.ts` | No CSP, HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection headers |
| S3 | No CSRF protection | CRITICAL | `server/src/services/auth.service.ts:37` | `sameSite: "none"` disables browser CSRF defense with no compensating CSRF tokens |
| S4 | Cookie domain hardcoded to production | CRITICAL | `server/src/services/auth.service.ts:37` | `domain: ".stelix.akhtarraza.in"` set even in local dev, breaks cookie on localhost |

### High
| # | Issue | Severity | File | Detail |
|---|-------|----------|------|--------|
| S5 | JWT algorithm not explicitly set | HIGH | `server/src/config/jwt.ts` | Relies on `jsonwebtoken` default (HS256 symmetric). If secret leaks, all tokens can be forged. |
| S6 | 7-day access token | HIGH | `server/.env` | Extremely long-lived. No refresh token mechanism for safe rotation. |
| S7 | No refresh token mechanism | HIGH | `server/src/services/auth.service.ts` | Single token with no revocation capability. Logout only clears cookie. |
| S8 | No proxy trust (`trust proxy`) | HIGH | `server/src/config/server.ts` | Rate limiter uses `req.ip` but behind proxy all requests appear as `127.0.0.1` |
| S9 | Rate limiter in-memory only | HIGH | `server/src/middleware/rate-limit.middleware.ts` | Not shared across instances, each instance has independent counter |
| S10 | No per-endpoint rate limiting | HIGH | `server/src/config/server.ts:39` | Auth endpoints not rate-limited differently from other routes |

### Medium
| # | Issue | Severity | File | Detail |
|---|-------|----------|------|--------|
| S11 | Auth endpoint leaks user existence | MEDIUM | `server/src/services/auth.service.ts:113-114` | "User already exists" reveals registration status |
| S12 | Password complexity not enforced | MEDIUM | `server/src/types/auth.type.ts:6` | Only `z.string().min(8)` — no uppercase, lowercase, number, or special char requirements |
| S13 | No owner verification on calendar/email operations | MEDIUM | `server/src/controllers/calendar.controller.ts` | Delegated to Google API (which enforces access), but no application-level check |
| S14 | CORS allows HTTP localhost in production | MEDIUM | `server/src/config/server.ts:24-27` | `http://localhost:3000` permitted alongside production origin |
| S15 | Unused `TAVILY_API_KEY` in env | MEDIUM | `server/.env` | Surface area risk — unused API key that should be removed or used |
| S16 | Cloudinary upload no size/type validation | MEDIUM | `server/src/config/avatar.ts` | Users could upload arbitrarily large or malicious files |
| S17 | Email HTML body not sanitized | MEDIUM | `server/src/services/gmail.service.ts` | LLM-generated content and email HTML not sanitized (React escaping provides partial protection) |

---

## Performance Issues

| # | Issue | Impact | File | Detail |
|---|-------|--------|------|--------|
| P1 | AI summary on every dashboard load | Latency: 1-3s | `server/src/services/dashboard.service.ts:54-61` | Every dashboard GET triggers a Groq LLM call (1-3s). No caching. |
| P2 | No code splitting on modals | Bundle size | `client/app/command-center/page.tsx:18-37` | 15+ components imported eagerly including rarely-used modals |
| P3 | N+1 Gmail API calls | Latency | `server/src/services/email.service.ts:54-62` | Lists message IDs, then fetches each individually |
| P4 | No response compression | Bandwidth | `server/src/config/server.ts` | All API responses uncompressed |
| P5 | No server-side caching | Latency | All services | Every request hits DB/external APIs |
| P6 | No dynamic imports | Bundle size | All page files | All components statically imported |
| P7 | No `next/image` optimization | Image perf | `client/components/landing/*.tsx` | Images not optimized via Next.js |
| P8 | Agent up to 5 sequential LLM calls | Latency: 5-15s | `server/src/agents/agent.service.ts` | `MAX_ITERATIONS = 5` with synchronous round-trips |
| P9 | `@react-oauth/google` in root layout | Bundle size | `client/app/providers.tsx` | Google OAuth SDK included in all pages (including landing) |
| P10 | No indexes on Corsair FK columns | DB perf | `server/src/models/corsair.ts` | `corsair_accounts.tenant_id`, `corsair_entities.account_id` without indexes |

---

## Refactoring Opportunities

### High Priority
| # | Recommendation | Rationale | Target |
|---|---------------|-----------|--------|
| R1 | Unify `EmailService` and `GmailService` | Eliminate duplicate code, consolidate Gmail operations | `server/src/services/email.service.ts` + `gmail.service.ts` |
| R2 | Rename `EmailService` in `config/email.ts` | Eliminate name collision with services/email.service.ts | `server/src/config/email.ts` |
| R3 | Remove dead route `/api/emails` or deprecate | Client only uses `/api/gmail` endpoints | `server/src/routes/email.routes.ts` |
| R4 | Extract shared AI summary utility | Reduce duplication across dashboard and assistant services | `server/src/services/dashboard.service.ts`, `assistant.service.ts` |
| R5 | Move `tsc-watch` to devDependencies | Production dependency not needed in prod | `server/package.json` |

### Medium Priority
| # | Recommendation | Rationale | Target |
|---|---------------|-----------|--------|
| R6 | Remove unused packages | `@corsair-dev/cli` unused, `shadcn` CLI in runtime deps, `@types/cors` redundant | Both package.json files |
| R7 | Remove dead code | `connectIntegrationSchema`, `UpdateIntegrationInput`, `IntegrationRepository.update()`, unused client API modules | Various |
| R8 | Extract controller logging pattern | 8 controllers repeat same pattern | All controller files |
| R9 | Fix `as any` type casts | Type safety in JWT config | `server/src/config/jwt.ts` |
| R10 | Calendar type consolidation | Remove `MappedCalendarEvent` if unused, standardize on `EventSummary`/`EventDetail` | `server/src/services/calendar.service.ts` |

### Low Priority
| # | Recommendation | Rationale | Target |
|---|---------------|-----------|--------|
| R11 | Replace `console.log` with `logger` | Use Winston consistently | `server/src/index.ts`, `auth.service.ts` |
| R12 | Add JSDoc to public methods | Improve maintainability | All service/controller files |
| R13 | Add `try-catch` to service methods | Graceful error handling for external API calls | `gmail.service.ts`, `calendar.service.ts`, others |
| R14 | Fix "Stellix" vs "Stelix" typos | Consistency in branding | Email templates |

---

## Bugs

### Confirmed
| # | Bug | Severity | File | Detail |
|---|-----|----------|------|--------|
| B1 | Profile page 404 | HIGH | `client/components/layout/app-header.tsx` | Dropdown links to `/profile` but no page exists at `app/profile/` |
| B2 | Missing validation on GET `/api/emails/` | MEDIUM | `server/src/routes/email.routes.ts:17-20` | Route defined without `validate()` middleware despite schema being imported |
| B3 | Cookie rejected on localhost | HIGH | `server/src/services/auth.service.ts:37` | `secure: true` + `domain: ".stelix.akhtarraza.in"` causes browser to reject cookie on HTTP localhost |
| B4 | Rate limiter IP detection broken behind proxy | MEDIUM | `server/src/middleware/rate-limit.middleware.ts` | No `trust proxy` set, all proxy-forwarded requests appear as 127.0.0.1 |
| B5 | Navigation menu includes "Inbox" and "Mail" as separate items | LOW | `client/components/layout/app-sidebar.tsx` | Users may be confused by two separate email-related navigation items |

---

## Final Roadmap

### Phase 1 — Immediate Security Fixes (Days 1-3)
1. Rotate ALL secrets (Neon DB, Cloudinary, Resend, Google OAuth, Groq, Tavily, Corsair, JWT)
2. Remove .env files from git history (git filter-branch / bfg)
3. Add .env.example files with placeholder values
4. Add Helmet middleware with secure defaults
5. Fix cookie configuration (dynamic domain, conditional secure flag)
6. Add CSRF protection (double-submit cookie pattern)
7. Add `trust proxy` setting
8. Fix missing validation on GET `/api/emails/`

### Phase 2 — Production Hardening (Days 4-8)
1. Add `compression` middleware
2. Create Dockerfile for Express backend (multi-stage build)
3. Create vercel.json or render.yaml deployment config
4. Set up CI/CD pipeline (GitHub Actions: lint → test → build)
5. Add server-side caching (Redis or in-memory with TTL)
6. Add per-endpoint rate limiting
7. Fix Profile page 404 (create page or remove link)
8. Add Sentry error tracking

### Phase 3 — Feature Completion & Refactoring (Days 9-14)
1. Unify Gmail services (EmailService → GmailService)
2. Rename EmailService conflict → TransactionalEmailService
3. Remove dead code and unused packages
4. Add refresh token mechanism
5. Persist AI summaries (DB or cache)
6. Add code splitting / dynamic imports for modals
7. Add route-level loading.tsx and error.tsx files
8. Remove unused @corsair-dev/cli, shadcn, @types/cors
9. Start test suite (AuthService, GmailService, CalendarService)

### Phase 4 — AI Improvements (Days 15-18)
1. Add AI summary caching (persist to DB, invalidate on new email)
2. Implement Tavily web search tool
3. Add Groq model fallback configuration
4. Add streaming responses for agent chat
5. Improve prompt templates (extract to config files)
6. Add rate limiting / cost control for LLM calls

### Phase 5 — Launch Preparation (Days 19-22)
1. Complete test suite (AgentService, middleware, controllers, validations)
2. Add API documentation (OpenAPI/Swagger)
3. Load testing and performance tuning
4. Security audit (penetration testing)
5. Add monitoring (uptime, error rates, LLM costs)
6. Create deployment runbook
7. DNS and SSL certificate verification
8. Production environment provisioning (Vercel/Render/Neon)

---

*This report was generated from a comprehensive codebase audit on July 21, 2026. All findings are verified from actual source code.*
