import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import type { WaitlistRole } from "@aidar/shared";

const SPRUCE = "#0b4242";
const CORAL = "#b85a41";
const CANVAS = "#fbf9f4";

function shell(inner: string) {
  return `
  <div style="background:${CANVAS};padding:32px 0;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a2421;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ece7dd;">
      <div style="background:${SPRUCE};padding:24px 32px;">
        <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:0.5px;">Aidar</span>
      </div>
      <div style="padding:32px;line-height:1.6;font-size:15px;">${inner}</div>
      <div style="padding:20px 32px;border-top:1px solid #ece7dd;color:#8a8a8a;font-size:12px;">
        Free to join · No spam · No data selling<br/>
        © ${new Date().getFullYear()} Aidar · Verified care in Nigeria
      </div>
    </div>
  </div>`;
}

export interface ConfirmationArgs {
  to: string;
  fullName: string;
  role: WaitlistRole;
  position: number;
}

export interface AdminLeadArgs {
  fullName: string;
  email: string;
  phone: string;
  role: WaitlistRole;
  location: string;
  specialty?: string;
  /** Real signup rank (not the seeded public number). */
  position: number;
  /** Real total signups so far (not seeded). */
  totalSignups: number;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly adminEmail?: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = process.env.RESEND_FROM_EMAIL ?? "Aidar <onboarding@resend.dev>";
    this.adminEmail = process.env.WAITLIST_ADMIN_EMAIL;
    if (!this.resend) {
      this.logger.warn("RESEND_API_KEY not set; emails will be logged, not sent.");
    }
  }

  async sendConfirmation({ to, fullName, role, position }: ConfirmationArgs) {
    const firstName = fullName.split(" ")[0] || "there";
    const roleLine =
      role === "practitioner"
        ? "As a practitioner, you'll be among the first invited to set up a verified profile and start receiving bookings at launch."
        : "You'll be among the first to book verified clinic, home, or virtual care when we launch.";

    const html = shell(`
      <h1 style="font-size:22px;margin:0 0 16px;color:${SPRUCE};">You're on the list, ${firstName} 🎉</h1>
      <p style="margin:0 0 16px;">Thanks for joining the Aidar waitlist. ${roleLine}</p>
      <p style="margin:0 0 24px;">You're <strong style="color:${CORAL};">#${position}</strong> in line.</p>
      <p style="margin:0 0 8px;color:#666;">We'll email you the moment Aidar goes live. Nothing else, promise.</p>
    `);

    await this.send(to, `You're #${position} on the Aidar waitlist`, html, "confirmation");
  }

  async sendAdminLead(lead: AdminLeadArgs) {
    if (!this.adminEmail) {
      this.logger.log("WAITLIST_ADMIN_EMAIL not set; skipping admin notification.");
      return;
    }
    const rows = [
      ["Name", lead.fullName],
      ["Email", lead.email],
      ["Phone", lead.phone],
      ["Role", lead.role],
      ["Location", lead.location],
      ...(lead.specialty ? [["Specialty", lead.specialty]] : []),
      ["Signup #", `${lead.position} (real)`],
    ]
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 12px;color:#888;">${k}</td><td style="padding:6px 12px;font-weight:600;">${v}</td></tr>`,
      )
      .join("");

    const html = shell(`
      <h1 style="font-size:18px;margin:0 0 6px;color:${SPRUCE};">New ${lead.role} waitlist signup</h1>
      <p style="margin:0 0 16px;font-size:14px;color:${CORAL};font-weight:700;">
        ${lead.totalSignups} ${lead.totalSignups === 1 ? "signup" : "signups"} now (real count)
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
    `);

    await this.send(
      this.adminEmail,
      `New ${lead.role} waitlist signup: ${lead.fullName}`,
      html,
      "admin-lead",
    );
  }

  private async send(to: string, subject: string, html: string, kind: string) {
    if (!this.resend) {
      this.logger.log(`[email:skipped:${kind}] → ${to} | ${subject}`);
      return;
    }
    const { error } = await this.resend.emails.send({ from: this.from, to, subject, html });
    if (error) {
      this.logger.error(`[email:error:${kind}] ${error.message}`);
    }
  }
}
