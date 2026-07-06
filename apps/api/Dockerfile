# syntax=docker/dockerfile:1
# Build context MUST be the monorepo root:
#   docker build -f apps/api/Dockerfile -t aidar-api .

FROM node:22-alpine AS base
WORKDIR /app
# pnpm via corepack (version pinned by the root package.json "packageManager").
RUN corepack enable
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"

# ---- Stage 1: Prune the monorepo to just @aidar/api + its workspace deps ----
# `turbo prune` emits a minimal subset:
#   out/json: manifests + pnpm-lock.yaml for a cacheable install layer
#   out/full: source for @aidar/api and the packages it depends on (@aidar/shared, @aidar/config)
FROM base AS pruner
RUN npm install -g turbo@2.10.0
COPY . .
RUN turbo prune @aidar/api --docker

# ---- Stage 2: Install deps, build, then drop dev deps ----
FROM base AS builder
# Install against the pruned lockfile first for better layer caching.
# --prod=false forces devDependencies (turbo, @nestjs/cli, tsup) even when the
# platform injects NODE_ENV=production at build time (e.g. Coolify).
COPY --from=pruner /app/out/json/ ./
RUN pnpm install --frozen-lockfile --prod=false
# Bring in the pruned source and build (@aidar/shared via tsup → @aidar/api via nest).
COPY --from=pruner /app/out/full/ ./
RUN pnpm exec turbo build --filter=@aidar/api

# ---- Stage 3: Slim runtime ----
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nodeapp

# Production node_modules (hoisted single tree) + the per-package node_modules
# that holds the workspace symlinks (apps/api/node_modules/@aidar/shared →
# ../../../../packages/shared), plus the built shared package itself.
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/packages/shared ./packages/shared
COPY --from=builder --chown=nodeapp:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nodeapp:nodejs /app/apps/api/drizzle ./apps/api/drizzle
COPY --from=builder --chown=nodeapp:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=nodeapp:nodejs /app/package.json ./package.json

USER nodeapp
EXPOSE 4000
ENV PORT=4000
# Health: GET /api/health
CMD ["node", "apps/api/dist/main.js"]
