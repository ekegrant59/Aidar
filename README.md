# Aidar

Find and book verified care in Nigeria. Monorepo (pnpm + Turborepo) with a
separated Next.js frontend and NestJS backend, per [`IMPLEMENTATION.md`](./IMPLEMENTATION.md).

**Phase 0 (current): Waitlist.** A landing page + waitlist that routes signups
into `waitlist_patients` / `waitlist_practitioners`, sends Resend confirmation +
admin-lead emails, and returns the signup's position in line.

## Layout

```
aidar/
├── apps/
│   ├── web/      # Next.js 15 (App Router), landing page + waitlist modal
│   └── api/      # NestJS, waitlist API, Drizzle/Postgres, Resend email
├── packages/
│   ├── shared/   # Zod schemas, constants (roles, Lagos areas, specialties), phone utils
│   └── config/   # shared tsconfig presets
└── turbo.json
```

## Prerequisites

- Node ≥ 20, pnpm (via `corepack enable pnpm`)
- Postgres (optional locally, without `DATABASE_URL` the API logs leads and
  simulates positions so you can still demo the flow)

## Setup

```bash
pnpm install
pnpm --filter @aidar/shared build      # shared must build first (dual ESM/CJS)

cp apps/api/.env.example apps/api/.env  # set DATABASE_URL, RESEND_API_KEY (optional)
cp apps/web/.env.example apps/web/.env.local
```

### Database (when ready)

```bash
docker compose up -d                    # local Postgres (+ Redis), optional
pnpm --filter @aidar/api db:generate    # generate SQL migration from schema
pnpm --filter @aidar/api db:migrate     # apply migrations (drizzle-kit, local/dev)
# or: pnpm --filter @aidar/api db:push for quick local sync
```

In production the schema is applied by the in-container runtime migrator
(`node apps/api/dist/db/migrate.js`), which uses `drizzle-orm` + the committed
`apps/api/drizzle/*.sql` files, no dev deps required.

## Develop

```bash
pnpm dev                 # runs web (:3000) + api (:4000) + shared (watch) via turbo
```

- Web: http://localhost:3000
- API: http://localhost:4000/api/v1 (health: `/api/health`)

The web form POSTs to `${NEXT_PUBLIC_API_URL}/api/v1/waitlist`.

## Build & checks

```bash
pnpm build       # builds shared → api + web
pnpm typecheck   # tsc across all packages
```

## Environment variables

**API (`apps/api/.env`)**

| Var | Purpose |
|---|---|
| `PORT` | API port (default 4000) |
| `WEB_ORIGIN` | Allowed CORS origin(s), comma-separated |
| `DATABASE_URL` | Postgres connection string (omit to log-only) |
| `RESEND_API_KEY` | Resend key (omit to log emails instead of sending) |
| `RESEND_FROM_EMAIL` | Verified sender, e.g. `Aidar <hello@notifications.getaidar.com>` |
| `WAITLIST_ADMIN_EMAIL` | Where lead notifications go |

**Web (`apps/web/.env.local`)**

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the NestJS API |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (SEO/sitemap) |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | PostHog (optional) |

> `NEXT_PUBLIC_*` vars are inlined at **build time**, set them as build
> variables when deploying.

## Deploy

Self-hosted on Coolify (two Dockerfile apps + managed Postgres). Full
walkthrough: [`COOLIFY-DEPLOYMENT.md`](./COOLIFY-DEPLOYMENT.md).
```
