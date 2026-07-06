"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { WaitlistModal } from "./waitlist-modal";
import { track, events } from "@/lib/analytics";

interface WaitlistContextValue {
  open: (source?: string) => void;
  close: () => void;
}

const WaitlistContext = createContext<WaitlistContextValue | null>(null);

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((source = "unknown") => {
    track(events.waitlistOpened, { source });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <WaitlistContext.Provider value={{ open, close }}>
      {children}
      <WaitlistModal open={isOpen} onClose={close} />
    </WaitlistContext.Provider>
  );
}

export function useWaitlist() {
  const ctx = useContext(WaitlistContext);
  if (!ctx) throw new Error("useWaitlist must be used within WaitlistProvider");
  return ctx;
}
