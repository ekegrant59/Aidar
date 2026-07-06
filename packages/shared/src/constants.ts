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

/**
 * Lagos areas / LGAs used for the location field. Kept deliberately Lagos-first
 * for launch; expand as Aidar grows beyond Lagos.
 */
export const LAGOS_AREAS = [
  "Agege",
  "Ajeromi-Ifelodun",
  "Alimosho",
  "Amuwo-Odofin",
  "Apapa",
  "Badagry",
  "Epe",
  "Eti-Osa",
  "Ibeju-Lekki",
  "Ifako-Ijaiye",
  "Ikeja",
  "Ikorodu",
  "Kosofe",
  "Lagos Island",
  "Lagos Mainland",
  "Mushin",
  "Ojo",
  "Oshodi-Isolo",
  "Shomolu",
  "Surulere",
  "Lekki",
  "Victoria Island",
  "Ikoyi",
  "Yaba",
  "Gbagada",
  "Maryland",
  "Magodo",
] as const;

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
