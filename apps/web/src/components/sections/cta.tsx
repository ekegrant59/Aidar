"use client";

import { Button } from "@/components/ui/button";
import { useWaitlist } from "@/components/waitlist/waitlist-provider";

export function CTA() {
  const { open } = useWaitlist();

  return (
    <section className="section-x section-y relative overflow-hidden bg-canvas">
      <div className="mx-auto grid max-w-[1120px] items-center gap-10 md:grid-cols-2">
        <div className="max-w-[560px]">
          <h2 className="font-sora text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.1] text-ink">
            Ready to Experience the Pulse of Verified Care?
          </h2>
          <p className="mt-5 text-[18px] leading-relaxed text-spruce-900/90">
            Join the Aidar waitlist today to be the first to access trusted care
            via clinic, home, or virtual sessions at launch. Connect with
            verified practitioners across Nigeria and help us bridge the medical
            discovery gap.
          </p>
          <div className="mt-7">
            <Button variant="coral" size="lg" onClick={() => open("cta")}>
              Join Waitlist
            </Button>
          </div>
          <p className="mt-5 text-[16px] text-spruce-900/80">
            Free to join · No spam · No data selling
          </p>
        </div>

        {/* Cyan geometric illustration from the design (also shown on mobile). */}
        <div className="relative flex h-[280px] justify-center overflow-hidden md:h-[560px] md:justify-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/cta-frame.svg"
            alt=""
            aria-hidden
            className="h-full w-auto object-contain md:object-right"
          />
        </div>
      </div>
    </section>
  );
}
