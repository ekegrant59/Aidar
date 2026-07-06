/**
 * Nigerian phone helpers. Accepts the common ways users type their number:
 *   0803 123 4567 / 08031234567 / +2348031234567 / 2348031234567
 * and normalises to E.164 (+234...). Mobile network codes start 70/71/80/81/90/91/etc.
 */

/** Strips spaces, dashes and parentheses. */
function clean(input: string): string {
  return input.replace(/[\s()-]/g, "");
}

/** Returns the E.164 form (+234XXXXXXXXXX) or null if not a valid NG mobile number. */
export function normalizeNigerianPhone(input: string): string | null {
  const c = clean(input);
  // National 10-digit subscriber number, mobile prefix [7-9][0-1].
  const subscriber = /^([7-9][01]\d{8})$/;

  let national: string | null = null;
  if (/^0\d{10}$/.test(c)) {
    national = c.slice(1); // drop leading 0 -> 10 digits
  } else if (/^\+?234\d{10}$/.test(c)) {
    national = c.replace(/^\+?234/, "");
  } else if (/^\d{10}$/.test(c)) {
    national = c; // bare 10-digit, no country/trunk prefix
  }

  if (!national || !subscriber.test(national)) return null;
  return `+234${national}`;
}

export function isValidNigerianPhone(input: string): boolean {
  return normalizeNigerianPhone(input) !== null;
}
