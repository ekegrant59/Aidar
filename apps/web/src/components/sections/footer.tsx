import { Logo } from "@/components/brand/logo";

// NOTE: contact details below are the placeholders shown in the design file.
// Swap for Aidar's real email/phone before launch.
const CONTACT = [
  { label: "hello@indicis.com", href: "mailto:hello@indicis.com" },
  { label: "+1 (999) 888-77-66", href: "tel:+19998887766" },
];

const SOCIAL = [
  { label: "Instagram", href: "#" },
  { label: "Tiktok", href: "#" },
  { label: "Linkedin", href: "#" },
  { label: "X", href: "#" },
];

export function Footer() {
  return (
    <footer className="section-x bg-canvas pt-16 pb-12">
      <div className="mx-auto max-w-[1120px]">
        <div className="grid gap-10 border-t border-black/10 pt-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-[340px]">
            <Logo tone="dark" />
            <p className="mt-4 text-[16px] leading-relaxed text-spruce-900/60">
              Aidar is a digital healthcare platform designed to bridge the
              discovery and trust gap between patients and medical providers in
              Lagos, Nigeria.
            </p>
          </div>

          <Footercol title="Contact Us" links={CONTACT} />
          <Footercol title="Follow Us" links={SOCIAL} />
        </div>

        <p className="mt-12 text-center text-[14px] font-medium text-ink">
          © 2026 - Copyright All Rights reserved
        </p>
      </div>
    </footer>
  );
}

function Footercol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-[16px] font-semibold text-ink">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-[14px] font-medium text-spruce-900/90 transition hover:text-coral"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
