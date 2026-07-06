CREATE TABLE "waitlist_patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"location" text NOT NULL,
	"notify_by_email" boolean DEFAULT true NOT NULL,
	"source" text DEFAULT 'waitlist' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_patients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "waitlist_practitioners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"location" text NOT NULL,
	"specialty" text,
	"notify_by_email" boolean DEFAULT true NOT NULL,
	"source" text DEFAULT 'waitlist' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_practitioners_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "waitlist_patients_created_at_idx" ON "waitlist_patients" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "waitlist_practitioners_created_at_idx" ON "waitlist_practitioners" USING btree ("created_at");