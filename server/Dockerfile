# syntax=docker/dockerfile:1

# ==========================================================================
# Stelix backend — multi-stage production image
# --------------------------------------------------------------------------
# Stage 1 (builder): install ALL deps and compile TypeScript -> dist/.
# Stage 2 (runner):  copy dist/ + production-only node_modules into a slim,
#                    non-root image. The toolchain and dev deps never ship.
# ==========================================================================

# --- Stage 1: build -------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy manifests first so `npm ci` is cached until dependencies actually
# change — source edits alone won't bust this layer.
COPY package.json package-lock.json ./
RUN npm ci

# Now copy source and compile.
COPY tsconfig.json ./
COPY drizzle ./drizzle
COPY src ./src
RUN npm run build

# Prune to production dependencies only, reused as-is in the runner stage.
RUN npm prune --omit=dev

# --- Stage 2: runtime -----------------------------------------------------
FROM node:22-alpine AS runner

# dumb-init gives us correct PID 1 signal handling so SIGTERM reaches Node
# and our graceful-shutdown handler actually fires.
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
WORKDIR /app

# Run as the built-in unprivileged `node` user, never root.
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/drizzle ./drizzle
COPY --chown=node:node package.json ./

USER node

EXPOSE 8000

# Container-level liveness probe. Platforms that read Docker HEALTHCHECK
# (Compose, some orchestrators) get health for free; Render uses its own
# HTTP check against /api/health (see render.yaml).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# dumb-init as entrypoint -> clean signal forwarding for graceful shutdown.
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
