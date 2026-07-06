import { z } from "zod";
import { WAITLIST_ROLES, SPECIALTIES } from "../constants";

const fullName = z
  .string({ required_error: "Please enter your full name" })
  .trim()
  .min(2, "Please enter your full name")
  .max(120, "That name is too long");

const email = z
  .string({ required_error: "Please enter your email" })
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(254, "That email is too long");

const location = z
  .string({ required_error: "Please enter your location" })
  .trim()
  .min(2, "Please enter your location")
  .max(160, "That location is too long");

/**
 * Waitlist signup. One form, an `I am a…` role that routes the row into either
 * waitlist_patients or waitlist_practitioners. `specialty` applies only to
 * practitioners, where it is required.
 */
export const waitlistSchema = z
  .object({
    fullName,
    email,
    role: z.enum(WAITLIST_ROLES, {
      required_error: "Please tell us who you are",
      invalid_type_error: "Please tell us who you are",
    }),
    location,
    specialty: z.enum(SPECIALTIES).optional(),
    specialtyOther: z.string().trim().max(80, "That is too long").optional(),
    notifyByEmail: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "practitioner") return;
    if (!data.specialty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["specialty"],
        message: "Please select your specialty",
      });
    } else if (data.specialty === "Other" && !data.specialtyOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["specialtyOther"],
        message: "Please specify your specialty",
      });
    }
  });

export type WaitlistInput = z.input<typeof waitlistSchema>;
export type WaitlistData = z.output<typeof waitlistSchema>;

export interface WaitlistSuccessResponse {
  ok: true;
  position: number;
  role: (typeof WAITLIST_ROLES)[number];
  alreadyJoined: boolean;
}

export interface WaitlistErrorResponse {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
}

export type WaitlistResponse = WaitlistSuccessResponse | WaitlistErrorResponse;
