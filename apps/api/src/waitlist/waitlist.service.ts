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
  // Dev-only fallback so the position UI works without a database.
  private fallbackCounter = 0;
  private static readonly SEED_POSITION = 137;

  constructor(
    @Inject(DB) private readonly db: Database | null,
    private readonly email: EmailService,
  ) {}

  async join(data: WaitlistData): Promise<WaitlistSuccessResponse> {
    if (!this.db) return this.joinWithoutDb(data);

    const { result, isPatient } = await this.persist(this.db, data);

    // New signups get confirmation (if opted in) + admin lead. Duplicates only
    // re-receive their confirmation so they still learn their spot.
    if (!result.alreadyJoined) {
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
          specialty: isPatient ? undefined : data.specialty,
          position: result.position,
        }),
      ]);
    } else if (data.notifyByEmail) {
      await this.email.sendConfirmation({
        to: data.email,
        fullName: data.fullName,
        role: data.role,
        position: result.position,
      });
    }

    return {
      ok: true,
      position: result.position,
      role: data.role,
      alreadyJoined: result.alreadyJoined,
    };
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
        ...(isPatient ? {} : { specialty: data.specialty }),
      })
      .onConflictDoNothing({ target: table.email })
      .returning({ id: table.id });

    // Position is computed entirely in SQL (keyed by email) so it works for both
    // a fresh insert and a duplicate, and avoids JS rounding the row's timestamp.
    const position = await this.positionByEmail(db, table, data.email);
    return { result: { position, alreadyJoined: inserted.length === 0 }, isPatient };
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
        specialty: data.role === "practitioner" ? data.specialty : undefined,
        position,
      }),
    ]);
    return { ok: true, position, role: data.role, alreadyJoined: false };
  }
}
