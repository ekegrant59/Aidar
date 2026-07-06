import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * Phase 0 waitlist tables. Patients and practitioners are split per the
 * implementation plan so lead lists stay clean and exportable. Email is unique
 * per table to prevent duplicate signups.
 */

export const waitlistPatients = pgTable(
  "waitlist_patients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone"),
    location: text("location").notNull(),
    notifyByEmail: boolean("notify_by_email").notNull().default(true),
    source: text("source").notNull().default("waitlist"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("waitlist_patients_created_at_idx").on(t.createdAt)],
);

export const waitlistPractitioners = pgTable(
  "waitlist_practitioners",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone"),
    location: text("location").notNull(),
    specialty: text("specialty"),
    notifyByEmail: boolean("notify_by_email").notNull().default(true),
    source: text("source").notNull().default("waitlist"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("waitlist_practitioners_created_at_idx").on(t.createdAt)],
);

export type WaitlistPatient = typeof waitlistPatients.$inferSelect;
export type WaitlistPractitioner = typeof waitlistPractitioners.$inferSelect;

export const schema = { waitlistPatients, waitlistPractitioners };
