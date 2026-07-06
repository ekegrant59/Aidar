"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Live social proof: how many people have joined the waitlist so far.
 * Renders nothing until a positive count loads, so it never flashes "0".
 */
export function WaitlistCount({ className }: { className?: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    let active = true;
    fetch(`${apiUrl}/api/v1/waitlist/count`)
      .then((r) => r.json())
      .then((d: { count?: number }) => {
        if (active && typeof d?.count === "number") setCount(d.count);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (count === null || count <= 0) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 text-[14px] font-medium",
        className,
      )}
    >
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
      </span>
      <span>
        <strong className="font-semibold">{count.toLocaleString()}</strong>{" "}
        {count === 1 ? "person has" : "people have"} joined the waitlist
      </span>
    </div>
  );
}
