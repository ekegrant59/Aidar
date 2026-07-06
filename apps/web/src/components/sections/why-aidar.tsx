import { SectionHeading } from "@/components/ui/section-heading";

const FEATURES = [
  {
    title: "Verified Professionals Only",
    body: "Aidar eliminates the guesswork by manually verifying every professional's credentials and medical licenses, ensuring you book with absolute confidence.",
  },
  {
    title: "Your Care, Your Way",
    body: "Aidar is the only platform seamlessly unifying clinic visits, virtual consultations, and secure home care under one booking system.",
  },
  {
    title: "Unmatched Safety for Home Visits",
    body: "As Nigeria's first dual-verified home care platform, we mandate government ID checks for patients to ensure a secure, accountable environment for both practitioners and households.",
  },
  {
    title: "Seamless, Secured Payments",
    body: "Secure upfront payments via Aidar's integrated Paystack system, featuring transparent pricing, clear cancellation rules, and built-in dispute protection.",
  },
  {
    title: "Precision Discovery with Live Maps",
    body: "Discover verified local practitioners and facilities with real-time Google Maps directions, live ETAs, and photo galleries.",
  },
];

export function WhyAidar() {
  return (
    <section className="section-x section-y bg-canvas">
      <div className="mx-auto max-w-[1120px]">
        <SectionHeading
          eyebrow="Why Aidar"
          title={
            <>
              Redefining <span className="text-spruce-900">Trust</span> in
              Nigerian Healthcare
            </>
          }
          subtitle="Aidar bridges the gap with a dedicated “trust and safety layer” missing from existing solutions."
        />

        <div className="mt-12 flex flex-col gap-10">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="grid gap-2 md:grid-cols-2 md:gap-12"
            >
              <h3 className="font-manrope text-[22px] font-semibold capitalize text-ink">
                {f.title}
              </h3>
              <p className="text-[18px] leading-relaxed text-spruce-900/90">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
