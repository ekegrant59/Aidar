# syntax=docker/dockerfile:1
# Build context MUST be the monorepo root (so all workspaces are reachable):
#   docker build -f apps/web/Dockerfile -t aidar-web .
#
# NOTE: NEXT_PUBLIC_* vars are inlined at BUILD time. Pass NEXT_PUBLIC_API_URL
# as a build arg (Coolify: "Build Variable") or the browser will call the wrong
# API. Runtime-only env is not enough for NEXT_PUBLIC_* values.

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

# ---- Stage 1: Install dependencies ----
# Copy the root manifest, lockfile, workspace config, and EVERY workspace
# manifest so pnpm can reproduce the full workspace graph from the lockfile.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/
# --prod=false forces devDependencies (next, tailwind, tsup, typescript) even when
# the platform injects NODE_ENV=production at build time (e.g. Coolify).
RUN pnpm install --frozen-lockfile --prod=false

# ---- Stage 2: Build ----
FROM base AS builder
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY
ENV NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_TELEMETRY_DISABLED=1
# Carry the whole installed tree (root node_modules AND per-package node_modules
# that hold the workspace symlinks, e.g. packages/shared/node_modules/@aidar/config).
COPY --from=deps /app ./
COPY . .
# Builds @aidar/shared (tsup) then @aidar/web (next build → standalone output).
RUN pnpm exec turbo build --filter=@aidar/web

# ---- Stage 3: Production runner ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Next.js standalone output (output:"standalone" + outputFileTracingRoot=repo root)
# is self-contained: server + minimal node_modules, preserving the monorepo
# path layout. We do NOT copy node_modules separately.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
# The standalone server defaults to localhost; bind all interfaces in-container.
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
