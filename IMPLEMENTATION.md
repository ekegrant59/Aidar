# Aidar — Implementation Plan

_Last updated: 17 June 2026_

This document captures the agreed architecture and build sequence for Aidar, migrating off the Lovable.dev managed setup to a self-hosted stack on Coolify, with a separated frontend and backend.

---

## 1. Locked decisions

| Area | Decision |
|---|---|
| Backend | Custom **NestJS** API (fully owned, portable — no Supabase lock-in) |
| Sensitive doc storage | **Split**: Cloudinary for public images; private **Cloudflare R2 / S3** (signed URLs) for IDs, selfies, MDCN certs, bank docs |
| Frontend | **Next.js 15** (App Router) — server-rendered for discovery/SEO |
| Hosting | **Self-hosted Coolify** (Postgres, Redis, both apps) |
| Public images | **Cloudinary** |
| Email | **Resend** (`notifications.getaidar.com`) |

---

## 2. Tech stack

### Frontend — `apps/web`
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (ported from existing Lovable components)
- TanStack Query (client/dashboard data)
- React Hook Form + Zod (schemas shared via `packages/shared`)
- Google Maps JS API (referrer-restricted key)
- lucide-react icons; Sora (headings) + Manrope (body)

### Backend — `apps/api`
- NestJS (TypeScript)
- PostgreSQL + **PostGIS** (geo / "Near Me")
- Drizzle ORM (migration-driven)
- Auth: JWT (access + refresh), argon2/bcrypt hashing; authorization via Nest guards/policies (replaces Supabase RLS)
- Realtime chat: Socket.io
- Background jobs: BullMQ + Redis (replaces `pg_cron` for auto-complete-bookings, reminders)
- Validation: Zod (shared)
- Payments: Paystack (webhooks, refunds, splits roadmap)
- Email: Resend

### Supporting services
| Need | Service |
|---|---|
| Public images | Cloudinary |
| Sensitive docs | Cloudflare R2 / S3 (private, signed URLs) |
| Cache / queue | Redis |
| SMS | Termii or Africa's Talking |
| WhatsApp (later) | WhatsApp Business API |
| Error monitoring | Sentry (web + api) |
| Uptime / logs | Uptime Kuma + Coolify logs |
| Product analytics | PostHog |
| Search (later) | Meilisearch / Typesense |
| Backups | Scheduled Postgres dumps → R2 |
| CI/CD | GitHub Actions → Coolify deploy hooks |

---

## 3. Repository layout (monorepo)

pnpm + Turborepo. Shared types and Zod schemas (specialty list, Lagos areas, validation rules) live once in `packages/shared` and are consumed by both apps.

```
aidar/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── shared/       # shared TS types, Zod schemas, constants
│   └── config/       # eslint, tsconfig, tailwind preset
├── docker-compose.yml
└── turbo.json
```

Each app deploys as an independent Coolify service.

---

## 4. Build phases

### Phase 0 — Waitlist (ship first, host first)
Decoupled from the main backend so it can ship immediately and prove out the Coolify + DNS + SSL + email pipeline.

- Next.js landing page (hero, problem/solution, how-it-works, For Patients / For Practitioners, footer) reusing Section 7 content.
- Two waitlist forms → `waitlist_patients` and `waitlist_practitioners` tables.
- Validation per PRD Section 4.4 (Nigerian phone format, email format, duplicate prevention).
- Resend confirmation email + admin lead notification.
- PostHog tracking + position counter ("you're #N").
- Branding: Sora/Manrope, teal-and-coral palette, "pin + pulse" mark.
- Infra: Coolify Postgres + Next.js app, Cloudinary + Resend configured, DNS → Coolify, SSL via Let's Encrypt.

**Deploy inputs needed:** Cloudinary creds, Resend API key + verified domain, Coolify Postgres instance, registrar access for `getaidar.com` DNS.

### Phase 1 — Foundation
Monorepo scaffold, `packages/shared`, NestJS skeleton, full DB schema + migrations (all Section 24 tables + PostGIS), JWT auth, CI/CD to Coolify, Sentry, automated backups.

### Phase 2 — Identity & onboarding
Signup/login (4 user types), practitioner 5-step + facility 5-step onboarding, uploads (Cloudinary public / R2 sensitive), Paystack account resolution, admin verification queues.

### Phase 3 — Discovery
Homepage, search (practitioners + facilities, filters/sort), map view + "Near Me" (PostGIS), server-rendered public profiles (SEO).

### Phase 4 — Booking core
Availability manager, 30-min slot system, three booking flows (clinic/home/virtual), Paystack payment + webhooks + metadata, home-visit ID gate, DB-level double-booking constraint, lifecycle + auto-complete job (BullMQ).

### Phase 5 — Engagement
Booking-scoped chat (Socket.io), reviews, dashboards (patient/practitioner/facility), earnings & payouts, notifications (email + **SMS**).

### Phase 6 — Admin, trust, ops
Admin dashboard, disputes, audit logging, refunds, safety centre, rate limiting, monitoring hardening.

### Phase 7 — Post-launch
Paystack splits (automated payouts), Meilisearch, WhatsApp notifications, HMO filters, referral program, per-slot calendar granularity.

---

## 5. Data protection & compliance (NDPA/NDPR)

Compliance splits into two workstreams: what we **build into the platform now** and what we **file with the regulator** as we grow. We need both. Governing law is the **Nigeria Data Protection Act 2023 (NDPA)**, enforced by the **Nigeria Data Protection Commission (NDPC)**, building on NDPR 2019. Aidar processes sensitive data (health info, IDs, biometric selfies, bank details), which pulls us into scope earlier than a typical app.

### Build now (in-platform, not blocking launch)
- **Consent capture** at each sensitive collection point (ID, selfie, health info): record who consented, to what, and when.
- **Privacy policy + terms** that match actual system behaviour (lawful basis, data collected, purpose, sharing, retention).
- **Retention & deletion** rules + user data-access / deletion request path.
- **Security controls:** private encrypted store for sensitive docs (R2/S3), signed URLs, internal access logging, restricted visibility of IDs/bank details.
- **Breach response plan** (NDPA requires notifying the NDPC within a set window).
- **Minimise the surface:** drop BVN collection entirely (high-risk, regulated, unnecessary).

### File later (regulatory, tied to growth milestones)
- **Register with the NDPC** as a Data Controller of Major Importance (triggered by scale / sensitive-data processing).
- **Annual data protection audit**, prepared and filed through a **licensed DPCO** (we don't self-file).
- **Appoint a DPO** (can be outsourced, commonly through the same DPCO).

### Action
- **Engage a DPCO early** for scoping: they confirm exact registration/audit thresholds and fees (these change — verify, don't assume), draft/review privacy policy + terms, and can act as outsourced DPO. Budget ≈ low-hundreds-of-thousands of naira, not a major legal bill.
- Treat **registration + annual audit as a growth milestone**, not a launch blocker, but have the DPCO confirm the trigger so we don't drift past it unknowingly.

---

## 6. PRD review — gaps, risks & recommended edits

> Combined founder-facing summary. A standalone, sendable version is in `FOUNDER-REVIEW.md`.

### Strengths
- Clear wedge: discovery + trust + booking across clinic/home/virtual, defensible via MDCN + patient-ID verification.
- Booking lifecycle (statuses, double-booking, cancellation/refund windows, disputes, auto-complete) is unusually thorough.
- Booking-scoped chat keeps the transaction on-platform instead of leaking to WhatsApp.
- Permissions specified on both UI and API layers.
- Concrete revenue model (₦1,000 booking fee + 15% commission).

### Gaps & risks (priority order)
1. **Data protection / regulatory** — no NDPA 2023 / NDPR coverage (lawful basis, consent records, retention/deletion, DPO, breach plan) despite handling IDs, selfies, BVN, health data, bank details. **Drop BVN entirely** — high liability, not needed when National ID/Passport/Licence suffice. Also: MDCN telemedicine code; CBN/Paystack implications of holding and releasing patient funds (escrow).
2. **Sensitive document storage** — IDs/selfies/certs must NOT live in Cloudinary's general media pipeline. Use a private encrypted store (R2/S3) with signed URLs. (Resolved in this plan via split storage.)
3. **Notification channel mismatch** — relying only on email; in Lagos, SMS and WhatsApp are the channels that land. Add Termii/Africa's Talking SMS, then WhatsApp Business API.
4. **Search & geo** — discovery is the core feature but has no infrastructure. Add PostGIS now; Meilisearch/Typesense later.
5. **Booking concurrency** — double-booking prevention must be a DB-level unique constraint/transaction on (practitioner, date, slot, active-status), not just app-level checks.
6. **Operational gaps** — no audit logging of admin actions, rate limiting, backups/DR, or observability. Critical once off Lovable's managed environment.
7. **Refund mechanics** — cancellation policy defines *when* but not *how* (Paystack refund API, partial refunds, dispute payouts).
8. **Float / cash-flow risk** — manual payouts + "pay released after visit" means floating practitioner money and reconciling by hand. Prioritize Paystack splits earlier.

### Product improvements
- HMO / insurance "accepts" filter (extend the facility NHIS concept).
- Book for a dependent / family member.
- Referral program (cheapest growth lever).
- Practitioner response-time / acceptance-rate trust signals.
- Review moderation/takedown flow (legal exposure).
- WhatsApp-first practitioner onboarding nudges.

### Top edits to the PRD
1. Add a Data Protection & Compliance section (NDPA/NDPR, retention, consent, DPO, breach plan).
2. Drop BVN; split storage public vs. private by sensitivity.
3. Add SMS + WhatsApp as primary notification channels.
4. Specify DB-level concurrency control and the Paystack refund flow.
5. Add audit logging, rate limiting, backups/DR, observability.
6. Add search/geo infrastructure (PostGIS now, Meilisearch later).
7. Update the technical architecture section to the new self-hosted, separated stack.
