# Thoughts on the Aidar PRD

I read through the full PRD. Overall it's in good shape — more complete than most docs at this stage, and the core idea is sound. Below are my notes: what's working, the things I think we need to fix, and a few product ideas. I've grouped the must-fix items by how much they'd cost us if we ignored them.

## What's working

- The wedge is clear and defensible. Discovery + trust + booking across clinic, home, and virtual is a real gap — Helium Health is B2B, Kangpe/Wellvis are teleconsult only, and Google Maps has no verification or booking. The MDCN credential check plus patient-ID verification for home visits is the part competitors can't easily copy.
- The booking lifecycle is the strongest section. Statuses, double-booking prevention, cancellation and refund windows, disputes, and the auto-complete job are all thought through. This is usually where docs fall apart.
- Keeping chat booking-scoped is the right call — it stops the transaction leaking to WhatsApp, which is how most Nigerian marketplaces quietly lose their cut.
- Permissions are defined on both the UI and the API, and the revenue model is concrete.

## What I think we need to fix

**Data protection and the regulatory side — this is the biggest gap.** We're collecting government IDs, selfies, BVN, health concerns, and bank details, but the PRD says nothing about NDPA/NDPR compliance: lawful basis, consent records, how long we keep data, a data protection officer, or what we do if there's a breach. For a health platform holding this kind of data in Nigeria, that's not optional. Two specific points:
- I'd drop BVN collection entirely. It's high-risk and tightly regulated, and we don't need it — National ID, passport, or driver's licence is enough to verify someone. Collecting BVN multiplies our liability for almost no benefit.
- Holding patient payments and releasing them after the visit means we're effectively doing escrow. That has CBN and Paystack implications we should get ahead of, rather than treating Paystack splits as a "later" item.

**Where we store sensitive documents.** IDs, selfies, and MDCN certificates should not sit in the same media pipeline as profile photos. Those belong in a private, encrypted store with short-lived access links. We've already agreed to split this — public images in Cloudinary, sensitive documents in a private bucket — but it's worth calling out as a deliberate decision.

**We're only notifying people by email.** In Lagos, email open rates are weak and a lot of it doesn't even land. SMS and WhatsApp are how people actually get told things. Booking confirmations, "the practitioner is on the way," meeting links, ID-verification results — these need SMS at launch and WhatsApp soon after. I'd treat this as core, not a nice-to-have.

**Discovery is our main feature but has no search infrastructure.** "Near Me," area filters, and specialty search will need proper geo support (PostGIS) from the start, and a real search engine once the listings grow. Cheap to design in now, expensive to retrofit.

**A few things that will bite us under load or scrutiny:**
- Double-booking has to be enforced at the database level, not just in the app code — otherwise the race condition the PRD describes will slip through when two people book at once.
- There's no audit log of admin actions (who verified or rejected whom, and when), no rate limiting, no backups/DR plan, and no error monitoring. These matter a lot more once we're off Lovable's managed setup.
- The cancellation policy says when refunds happen but not how — we need a concrete Paystack refund flow, including partial refunds and dispute payouts.
- Manual payouts plus "pay released after the visit" means we're floating practitioners' money and reconciling by hand. Fine at low volume, risky as we grow — I'd bring automated Paystack splits forward.

## Product ideas worth considering

- An "accepts HMO/insurance" filter. It's huge here, and we already have the NHIS toggle for facilities to build on.
- Let patients book for a dependent (a parent or child) without creating a second account.
- A referral program — probably the cheapest way to grow a Lagos marketplace.
- Trust signals beyond star rating, like practitioner response time and acceptance rate.
- A way for admins to take down abusive or defamatory reviews — that's a legal exposure otherwise.

## Edits I'd make to the PRD

1. Add a data protection and compliance section (NDPA/NDPR, retention, consent, DPO, breach plan).
2. Drop BVN, and split storage public vs. private by sensitivity.
3. Add SMS and WhatsApp as primary notification channels alongside email.
4. Specify database-level booking concurrency control and the Paystack refund flow.
5. Add audit logging, rate limiting, backups/DR, and monitoring.
6. Add search and geo infrastructure (PostGIS now, a search engine later).
7. Update the technical architecture section to reflect the new self-hosted, separated stack.

None of this changes the core product — it's mostly about staying on the right side of the regulators and making sure the parts that handle money and sensitive data hold up. Happy to talk through any of it.
