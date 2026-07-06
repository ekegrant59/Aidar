/**
 * Shared constants for Aidar. These live once here and are consumed by both the
 * web app (waitlist now) and the API (later phases).
 */

/** The two audiences the waitlist routes into separate tables. */
export const WAITLIST_ROLES = ["patient", "practitioner"] as const;
export type WaitlistRole = (typeof WAITLIST_ROLES)[number];

export const WAITLIST_ROLE_LABELS: Record<WaitlistRole, string> = {
  patient: "Patient: I'm looking for care",
  practitioner: "Practitioner: I provide care",
};

/** Practitioner specialties (subset for the waitlist; full list lands in onboarding). */
export const SPECIALTIES = [
  "General Practitioner",
  "Pediatrician",
  "Gynecologist / Obstetrician",
  "Dentist",
  "Dermatologist",
  "Cardiologist",
  "Optometrist / Ophthalmologist",
  "Physiotherapist",
  "Nurse",
  "Midwife",
  "Mental Health / Therapist",
  "Nutritionist / Dietitian",
  "Pharmacist",
  "Laboratory / Diagnostics",
  "Other",
] as const;
