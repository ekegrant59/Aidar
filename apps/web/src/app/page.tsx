import { WaitlistProvider } from "@/components/waitlist/waitlist-provider";
import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { WhyAidar } from "@/components/sections/why-aidar";
import { HowItWorks } from "@/components/sections/how-it-works";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";

export default function HomePage() {
  return (
    <WaitlistProvider>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <WhyAidar />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </WaitlistProvider>
  );
}
