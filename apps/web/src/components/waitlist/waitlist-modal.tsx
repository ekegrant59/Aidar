"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { WaitlistForm } from "./waitlist-form";
import { Button } from "@/components/ui/button";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
}

export function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const [success, setSuccess] = useState<{
    position: number;
    alreadyJoined: boolean;
  } | null>(null);

  // Lock body scroll + reset success state when the modal opens.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setSuccess(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-fade-up my-auto w-full max-w-[520px] rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2
            id="waitlist-title"
            className="font-sora text-[26px] font-bold leading-tight text-ink"
          >
            {success ? "You're in." : "Be First. Join the Waitlist."}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 rounded-full p-1.5 text-muted transition hover:bg-black/5 hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        {success ? (
          <SuccessView
            position={success.position}
            alreadyJoined={success.alreadyJoined}
            onClose={onClose}
          />
        ) : (
          <WaitlistForm onSuccess={setSuccess} />
        )}
      </div>
    </div>
  );
}

function SuccessView({
  position,
  alreadyJoined,
  onClose,
}: {
  position: number;
  alreadyJoined: boolean;
  onClose: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-spruce-50">
        <CheckCircle2 className="size-9 text-spruce-700" />
      </div>
      <p className="mb-2 text-[17px] text-ink">
        {alreadyJoined
          ? "You’re already on the list. Here’s your spot:"
          : "You’ve joined the Aidar waitlist."}
      </p>
      <p className="mb-4">
        <span className="font-sora text-[40px] font-bold text-coral">
          #{position}
        </span>
      </p>
      <p className="mb-6 text-[15px] text-muted">
        We’ll email you the moment Aidar goes live, with verified clinic, home,
        and virtual care across Nigeria. No spam, ever.
      </p>
      <Button variant="spruce" className="w-full" onClick={onClose}>
        Done
      </Button>
    </div>
  );
}
