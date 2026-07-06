import { SectionHeading } from "@/components/ui/section-heading";

const STEPS = [
  {
    illustration: "/illustrations/search-discover.svg",
    title: "Search and Discover with Precision",
    body: "Use our intelligent discovery engine to find and filter verified specialists or medical facilities by your specific neighborhood. The integrated Google Maps interface allows you to toggle between list and map views, providing exact directions and live ETAs for driving or walking.",
  },
  {
    illustration: "/illustrations/review-profiles.svg",
    title: "Review Verified Professional Profiles",
    body: "Click any profile to view a transparent, trust-building overview featuring verified badges, qualifications, reviews, and upfront consultation fees with no hidden costs. You can also browse facility photo galleries and star ratings to make informed care decisions.",
  },
  {
    illustration: "/illustrations/book-coordinate.svg",
    title: "Book and Coordinate Your Care",
    body: "After choosing your preferred mode of care (clinic, virtual, or a secured home visit), you can easily book a 30-minute slot via our real-time calendar and pay securely using Paystack. Once confirmed, the in-app messaging system allows you to chat directly with your doctor to coordinate details and share health concerns before you meet.",
  },
];

export function HowItWorks() {
  return (
    <section className="section-x section-y bg-canvas">
      <div className="mx-auto max-w-[1120px]">
        <SectionHeading
          eyebrow="How It Works"
          title={
            <>
              Healthcare Simplified: How{" "}
              <span className="text-spruce-900">Aidar</span> Works
            </>
          }
          subtitle="Aidar bridges the gap with a dedicated “trust and safety layer” missing from existing solutions"
        />

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.title}
              className="flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-center bg-white py-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.illustration} alt="" className="h-[180px] w-auto" />
              </div>
              <div className="flex flex-col gap-2 p-6">
                <h3 className="font-manrope text-[22px] font-semibold capitalize text-ink">
                  {s.title}
                </h3>
                <p className="text-[17px] leading-relaxed text-muted">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
