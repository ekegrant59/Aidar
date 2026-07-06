import { Logo } from "@/components/brand/logo";

const CONTACT = [
  { label: "getaidaar@gmail.com", href: "mailto:getaidaar@gmail.com" },
];

const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/getaidar" },
  { label: "Tiktok", href: "https://www.tiktok.com/@getaidar" },
  { label: "X", href: "https://x.com/getaidar" },
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
              Nigeria.
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
              {...(l.href.startsWith("http")
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
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
