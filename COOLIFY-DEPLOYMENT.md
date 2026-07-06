# Deploying Aidar to Coolify (self-hosted)

This guide deploys the Aidar monorepo, **Next.js web** + **NestJS API** + **Postgres** -
to a self-hosted [Coolify](https://coolify.io) instance on a VPS. It mirrors the
Okira/shoppa deployment workflow, adapted for Aidar's stack: **pnpm** (not npm),
**NestJS** (not Express), **Postgres** (not MongoDB), and **Resend** for email.

> TL;DR: two Docker apps built from `apps/api/Dockerfile` and `apps/web/Dockerfile`
> (build context = repo root), one managed Postgres, DNS for `getaidar.com` +
> `api.getaidar.com`, and migrations run once per deploy via a tiny in-container
> migrator.

---

## 0. Architecture

```
┌──────────────────────────── YOUR VPS (Coolify) ────────────────────────────┐
│                                                                             │
│   Cloudflare DNS                Caddy (built into Coolify)                   │
│   getaidar.com      ─────►      reverse proxy + auto Let's Encrypt SSL       │
│   api.getaidar.com  ─────►                                                   │
│                                         │                                    │
│              ┌──────────────────────────┼───────────────────────┐           │
│              │                          │                        │           │
│      ┌───────▼────────┐        ┌────────▼────────┐      ┌────────▼────────┐  │
│      │   aidar-web     │        │   aidar-api     │      │   aidar-postgres│  │
│      │   Next.js :3000 │ ─────► │   NestJS :4000  │ ───► │   Postgres :5432│  │
│      │   (standalone)  │  HTTPS │   /api/v1/...   │      │   (internal)    │  │
│      └─────────────────┘        └─────────────────┘      └─────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

- The browser calls **`api.getaidar.com`** directly (CORS-allowed). The API's
  `WEB_ORIGIN` must list the web domain.
- Postgres is **internal only**, apps reach it by container hostname over
  Coolify's Docker network.

---

## 1. Prerequisites

- A VPS: **2 vCPU / 4 GB RAM / 40 GB SSD**, Ubuntu 22.04/24.04. (Hetzner,
  DigitalOcean, Contabo, etc.)
- A domain you control (`getaidar.com`) with DNS you can edit.
- The repo pushed to GitHub/GitLab.
- Accounts: **Resend** (verified sending domain), optionally **PostHog**.

---

## 2. Install Coolify

SSH in and run the installer (installs Docker + Coolify):

```bash
ssh root@YOUR_VPS_IP
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Then open `http://YOUR_VPS_IP:8000`, create the admin account, and you're in the
dashboard.

---

## 3. DNS (Cloudflare or any provider)

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `getaidar.com` | `YOUR_VPS_IP` | ✅ Proxied |
| A | `api.getaidar.com` | `YOUR_VPS_IP` | ✅ Proxied |
| A | `coolify.getaidar.com` | `YOUR_VPS_IP` | ✅ Proxied (optional, for the dashboard) |

Cloudflare → SSL/TLS → **Full (strict)**. In Coolify → Settings, set the
instance URL to `https://coolify.getaidar.com` if you made that record.

> Email DNS (Resend) is separate: add the SPF/DKIM records Resend gives you for
> `notifications.getaidar.com`. See §9.

---

## 4. Provision Postgres

1. Coolify → **New Resource → Database → PostgreSQL**.
2. Configure:
   - **Name**: `aidar-postgres`
   - **Version**: `16`
   - **Public Port**: leave empty (internal only)
   - **Database**: `aidar_waitlist`
   - **Username** / **Password**: generate and save them.
3. **Deploy.**

The internal connection string (used by the API) looks like:

```
postgres://USER:PASSWORD@aidar-postgres:5432/aidar_waitlist
```

The hostname `aidar-postgres` is the container name, reachable from other
Coolify services on the same server via Docker's internal network.

> Redis is **not needed for Phase 0** (waitlist). Add it the same way
> (`New Resource → Database → Redis`) when Phase 1+ introduces BullMQ jobs.

---

## 5. The Dockerfiles (already in the repo)

Both are multi-stage and expect the **build context to be the repo root** so all
workspaces are reachable.

- [`apps/api/Dockerfile`](apps/api/Dockerfile), `turbo prune @aidar/api --docker`
  → `pnpm install` → `turbo build` → `pnpm prune --prod` → slim Node 22 Alpine
  runner. Runs `node apps/api/dist/main.js`. Ships the `drizzle/` migrations.
- [`apps/web/Dockerfile`](apps/web/Dockerfile), installs the workspace, builds
  the Next.js **standalone** output, and runs `node apps/web/server.js`.

Nothing to create, just make sure they're committed and pushed.

> Why pnpm + `node-linker=hoisted`? The repo's `.npmrc` sets a hoisted (npm-like)
> `node_modules` so the multi-stage Docker copies are predictable. See the main
> README / "pnpm notes" for the trade-off.

---

## 6. Deploy the API (`aidar-api`)

1. Coolify → **New Resource → Application → Docker (from GitHub)**, connect the repo.
2. Configure:
   - **Name**: `aidar-api`
   - **Branch**: `main`
   - **Build Pack**: **Dockerfile**
   - **Dockerfile Location**: `apps/api/Dockerfile`
   - **Base Directory / Build Context**: `/` (repo root, critical for the monorepo)
   - **Domain**: `https://api.getaidar.com`
   - **Port**: `4000`
   - **Health Check Path**: `/api/health`
3. **Environment Variables** (Runtime):

   ```env
   NODE_ENV=production
   PORT=4000
   WEB_ORIGIN=https://getaidar.com
   DATABASE_URL=postgres://USER:PASSWORD@aidar-postgres:5432/aidar_waitlist
   RESEND_API_KEY=re_xxxxxxxx
   RESEND_FROM_EMAIL=Aidar <hello@notifications.getaidar.com>
   WAITLIST_ADMIN_EMAIL=team@getaidar.com
   ```

4. **Deploy.**

### Run migrations (once per schema change)

The runtime image includes a migrator that uses `drizzle-orm` (a prod dep) and
the committed `apps/api/drizzle/*.sql` files. Two ways to run it:

- **Recommended, Coolify "Pre-deployment Command"** (Application → Settings):

  ```
  node apps/api/dist/db/migrate.js
  ```

  Coolify runs this in a one-off container of the freshly built image before
  swapping traffic, so the schema is always migrated before the new code serves.

- **Manual one-off**, open a terminal on the running container and run the same
  command, or run it locally against the prod `DATABASE_URL`:

  ```bash
  pnpm --filter @aidar/api db:migrate   # uses drizzle-kit (dev) locally
  ```

Verify:

```bash
curl https://api.getaidar.com/api/health
# {"status":"ok","service":"aidar-api","time":"..."}
```

---

## 7. Deploy the Web (`aidar-web`)

1. Coolify → **New Resource → Application → Docker (from GitHub)**.
2. Configure:
   - **Name**: `aidar-web`
   - **Branch**: `main`
   - **Build Pack**: **Dockerfile**
   - **Dockerfile Location**: `apps/web/Dockerfile`
   - **Base Directory / Build Context**: `/`
   - **Domain**: `https://getaidar.com`
   - **Port**: `3000`
3. **Environment Variables**, ⚠️ `NEXT_PUBLIC_*` are inlined at **build time**.
   In Coolify, add them and toggle **"Build Variable"** (a.k.a. "Available at
   build time") **ON**, or the browser will hit the wrong API URL:

   ```env
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.getaidar.com      # Build Variable = ON
   NEXT_PUBLIC_SITE_URL=https://getaidar.com         # Build Variable = ON
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxx                    # Build Variable = ON (optional)
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com  # Build Variable = ON (optional)
   ```

   The Dockerfile declares matching `ARG`s, so Coolify's build variables flow
   into `next build`.

4. **Deploy**, then visit `https://getaidar.com`.

> If you change any `NEXT_PUBLIC_*` value, you must **redeploy/rebuild** the web
> app, a restart alone won't pick it up.

---

## 8. Auto-deploy on push

For each app: Coolify → app → **Settings → Webhooks**, copy the URL, and add it
in GitHub → repo **Settings → Webhooks** (content type `application/json`, "Just
the push event"). Now `git push` to `main` rebuilds and redeploys.

---

## 9. Resend email setup

1. In Resend, add and verify the domain `notifications.getaidar.com` (add the
   SPF + DKIM DNS records they provide).
2. Set `RESEND_FROM_EMAIL=Aidar <hello@notifications.getaidar.com>` on the API.
3. Set `WAITLIST_ADMIN_EMAIL` to where lead notifications should land.

Without `RESEND_API_KEY`, the API still accepts signups and **logs** the emails
instead of sending, handy for a first smoke test.

---

## 10. Verify end-to-end

| Check | How | Expected |
|---|---|---|
| API health | `curl https://api.getaidar.com/api/health` | `{"status":"ok",...}` |
| Postgres connected | Coolify logs for `aidar-api` | `Connected to Postgres` |
| Waitlist write | Submit the form on `getaidar.com` | success modal with `#N` |
| Row persisted | `SELECT * FROM waitlist_patients;` on the DB | your row |
| CORS | Submit from the live site | no CORS error in console |
| SSL | Visit both domains | green padlock |

Quick API smoke test:

```bash
curl -X POST https://api.getaidar.com/api/v1/waitlist \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Test User","email":"test@example.com","phone":"08031234567","role":"patient","location":"Ikeja, Lagos","notifyByEmail":true}'
# {"ok":true,"position":1,"role":"patient","alreadyJoined":false}
```

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails: `turbo: command not found` / workspace not found | Build context isn't the repo root | Set Base Directory / Build Context to `/` |
| Web build OK but browser calls `localhost:4000` | `NEXT_PUBLIC_API_URL` not a **Build Variable** | Toggle it on, redeploy |
| CORS error in browser | `WEB_ORIGIN` on the API doesn't match the web domain | Set `WEB_ORIGIN=https://getaidar.com`, redeploy API |
| API 500 on signup | `DATABASE_URL` wrong or migrations not run | Check the env var; run the migrator (§6) |
| `relation "waitlist_patients" does not exist` | Migrations never ran | Run `node apps/api/dist/db/migrate.js` (pre-deploy command) |
| Emails not arriving | `RESEND_API_KEY` missing / domain unverified | Add key, verify domain in Resend |
| Health check failing in Coolify | Wrong path/port | Path `/api/health`, port `4000` |

---

## 12. Local equivalent (sanity-check before deploying)

```bash
docker compose up -d                       # Postgres (+ Redis) locally
pnpm install
pnpm --filter @aidar/shared build
pnpm --filter @aidar/api db:migrate        # apply schema
pnpm dev                                    # web :3000, api :4000
```

To rehearse the production images locally once your Docker daemon/disk allow it:

```bash
docker build -f apps/api/Dockerfile -t aidar-api .
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.getaidar.com \
  -t aidar-web .
```
