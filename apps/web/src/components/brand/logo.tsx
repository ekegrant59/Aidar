import { cn } from "@/lib/utils";

const W = 101;
const H = 22;

/**
 * Aidar wordmark from designs/AIDAR.svg (a white wordmark). On the dark nav we
 * render it directly; on the light footer we recolour it to spruce via CSS mask.
 */
export function Logo({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  if (tone === "light") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/aidar-logo.svg"
        alt="Aidar"
        width={W}
        height={H}
        className={cn("inline-block", className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label="Aidar"
      className={cn("inline-block", className)}
      style={{
        width: W,
        height: H,
        backgroundColor: "var(--color-spruce-900)",
        WebkitMaskImage: "url(/aidar-logo.svg)",
        maskImage: "url(/aidar-logo.svg)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "left center",
        maskPosition: "left center",
      }}
    />
  );
}
