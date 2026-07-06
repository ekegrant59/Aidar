"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useWaitlist } from "@/components/waitlist/waitlist-provider";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { open } = useWaitlist();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled ? "bg-black/70 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <nav className="nav-x mx-auto flex h-[72px] max-w-[1440px] items-center justify-between">
        <Logo tone="light" />
        <Button variant="coral" onClick={() => open("navbar")} className="h-10 px-7">
          Join Waitlist
        </Button>
      </nav>
    </header>
  );
}
