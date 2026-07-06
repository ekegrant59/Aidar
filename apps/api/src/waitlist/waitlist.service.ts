import { Inject, Injectable, Logger } from "@nestjs/common";
import { sql } from "drizzle-orm";
import type { WaitlistData, WaitlistSuccessResponse } from "@aidar/shared";
import { DB, type Database } from "../db/db.module";
import { waitlistPatients, waitlistPractitioners } from "../db/schema";
import { EmailService } from "./email.service";

type WaitlistTable = typeof waitlistPatients | typeof waitlistPractitioners;

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);
  // Head-start so the waitlist opens at #584 and the counter reads 583+. Real
  // signups are added on top of this seed (positions and total both include it).
  private static readonly SEED_POSITION = 583;
  private fallbackCounter = 0;

  constructor(
    @Inject(DB) private readonly db: Database | null,
    private readonly email: EmailService,
  ) {}

  async join(data: WaitlistData): Promise<WaitlistSuccessResponse> {
    if (!this.db) return this.joinWithoutDb(data);

    const { result, isPatient, rank } = await this.persist(this.db, data);

    // Only a genuinely new signup triggers emails (confirmation if opted in, plus
    // the admin lead). A duplicate email is a no-op: no row inserted, no email
    // sent. The response still carries alreadyJoined + the existing position so
    // the UI can show "you're already on the list".
    if (!result.alreadyJoined) {
      // Admin sees the REAL numbers (rank + total signups), not the seeded ones.
      const totalSignups = await this.rawTotal(this.db);
      await Promise.allSettled([
        data.notifyByEmail
          ? this.email.sendConfirmation({
              to: data.email,
              fullName: data.fullName,
              role: data.role,
              position: result.position,
            })
          : Promise.resolve(),
        this.email.sendAdminLead({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          role: data.role,
          location: data.location,
          specialty: this.specialtyOf(data),
          position: rank,
          totalSignups,
        }),
      ]);
    }

    return {
      ok: true,
      position: result.position,
      role: data.role,
      alreadyJoined: result.alreadyJoined,
    };
  }

  /** Effective specialty for a practitioner: the typed value when "Other". */
  private specialtyOf(data: WaitlistData): string | undefined {
    if (data.role !== "practitioner") return undefined;
    return data.specialty === "Other"
      ? data.specialtyOther?.trim() || "Other"
      : data.specialty;
  }

  private async persist(db: Database, data: WaitlistData) {
    const isPatient = data.role === "patient";
    const table: WaitlistTable = isPatient ? waitlistPatients : waitlistPractitioners;

    const inserted = await db
      .insert(table)
      .values({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        notifyByEmail: data.notifyByEmail,
        ...(isPatient ? {} : { specialty: this.specialtyOf(data) }),
      })
      .onConflictDoNothing({ target: table.email })
      .returning({ id: table.id });

    // Position is computed entirely in SQL (keyed by email) so it works for both
    // a fresh insert and a duplicate, and avoids JS rounding the row's timestamp.
    // Offset by the seed so real signups continue from the head-start number.
    const rank = await this.positionByEmail(db, table, data.email);
    const position = WaitlistService.SEED_POSITION + rank;
    return { result: { position, alreadyJoined: inserted.length === 0 }, isPatient, rank };
  }

  /** Real total signups (no seed) — for admin-facing numbers. */
  private async rawTotal(db: Database): Promise<number> {
    const rows = (await db.execute(sql`
      select
        (select count(*) from ${waitlistPatients}) +
        (select count(*) from ${waitlistPractitioners}) as total
    `)) as Array<{ total: number }>;
    return Number(rows[0]?.total ?? 0);
  }

  /** 1-based rank of the row with this email, ordered by signup time. */
  private async positionByEmail(db: Database, table: WaitlistTable, email: string) {
    const rows = (await db.execute(sql`
      select count(*)::int as count
      from ${table}
      where created_at <= (select created_at from ${table} where email = ${email})
    `)) as Array<{ count: number }>;
    return Number(rows[0]?.count ?? 1);
  }

  /** Public-facing total: seed head-start + real signups. */
  async count(): Promise<number> {
    if (!this.db) return WaitlistService.SEED_POSITION + this.fallbackCounter;
    return WaitlistService.SEED_POSITION + (await this.rawTotal(this.db));
  }

  private async joinWithoutDb(data: WaitlistData): Promise<WaitlistSuccessResponse> {
    this.fallbackCounter += 1;
    const position = WaitlistService.SEED_POSITION + this.fallbackCounter;
    this.logger.log(
      `[no-db] waitlist lead: ${data.role} ${data.email} (${data.location}) → #${position}`,
    );
    await Promise.allSettled([
      data.notifyByEmail
        ? this.email.sendConfirmation({
            to: data.email,
            fullName: data.fullName,
            role: data.role,
            position,
          })
        : Promise.resolve(),
      this.email.sendAdminLead({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        location: data.location,
        specialty: this.specialtyOf(data),
        position: this.fallbackCounter,
        totalSignups: this.fallbackCounter,
      }),
    ]);
    return { ok: true, position, role: data.role, alreadyJoined: false };
  }
}
