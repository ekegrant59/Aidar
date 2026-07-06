import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-[640px]", className)}>
      <p className="mb-3 text-[15px] font-semibold text-ink/80">{eyebrow}</p>
      <h2 className="font-sora text-[clamp(1.75rem,4vw,2.25rem)] font-semibold leading-tight tracking-[0.01em] text-ink">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-[18px] leading-relaxed text-spruce-900/90">
          {subtitle}
        </p>
      )}
    </div>
  );
}
