import posthog from "posthog-js";

/** Safe capture wrapper; no-ops when PostHog isn't configured/initialised. */
export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, props);
  } catch {
    // analytics must never break UX
  }
}

export const events = {
  waitlistOpened: "waitlist_modal_opened",
  waitlistSubmitted: "waitlist_submitted",
  waitlistSucceeded: "waitlist_succeeded",
  waitlistFailed: "waitlist_failed",
} as const;
