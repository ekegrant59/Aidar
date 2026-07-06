"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWaitlist } from "@/components/waitlist/waitlist-provider";

export function Hero() {
  const { open } = useWaitlist();

  return (
    <section className="relative isolate flex min-h-[760px] items-center justify-center overflow-hidden bg-black">
      {/* Background map image (plain img, no optimizer dependency) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-map.png"
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
      {/* The original image is bright, so darken it heavily: a strong base wash,
          a deep edge vignette, an extra dark glow behind the text, and top/bottom
          fades to black. */}
      <div className="absolute inset-0 bg-black/60 max-sm:bg-black/50" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_45%,transparent_15%,rgba(0,0,0,0.92)_100%)] max-sm:bg-[radial-gradient(130%_130%_at_50%_40%,transparent_40%,rgba(0,0,0,0.8)_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_45%,rgba(0,0,0,0.6)_0%,transparent_75%)] max-sm:bg-[radial-gradient(70%_40%_at_50%_45%,rgba(0,0,0,0.45)_0%,transparent_80%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90"
        aria-hidden
      />

      <div className="section-x relative z-10 mx-auto flex max-w-[1440px] flex-col items-center pt-24 pb-28 text-center">
        <h1 className="max-w-[840px] font-sora text-[clamp(2.5rem,6vw,3.75rem)] font-bold leading-[1.08] text-white">
          Find and Book Verified Care in Nigeria
        </h1>
        <p className="mt-6 max-w-[540px] text-[clamp(1rem,2vw,1.125rem)] leading-relaxed text-hero-fg/70">
          Bridge the trust gap. Connect with verified practitioners for clinic
          visits, home visits, or virtual consultations
        </p>
        <div className="mt-9">
          <Button variant="coral" size="lg" onClick={() => open("hero")}>
            Join Waitlist
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          document
            .getElementById("problem")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 text-[10px] md:text-[15px] font-semibold text-hero-fg/90 transition hover:text-white"
      >
        Scroll Down to Learn More
        <ChevronDown className="size-4 animate-bounce" />
      </button>
    </section>
  );
}
