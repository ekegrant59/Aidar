import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "coral" | "spruce" | "ghost" | "outline";
type Size = "default" | "lg";

const variants: Record<Variant, string> = {
  coral:
    "bg-coral text-white hover:bg-coral-dark focus-visible:ring-coral/40 shadow-sm",
  spruce:
    "bg-spruce-900 text-white hover:bg-spruce-700 focus-visible:ring-spruce-900/40",
  ghost: "bg-transparent text-ink hover:bg-black/5 focus-visible:ring-black/10",
  outline:
    "border border-spruce-900/20 bg-transparent text-spruce-900 hover:bg-spruce-900/5",
};

const sizes: Record<Size, string> = {
  default: "h-11 px-7 text-[16px]",
  lg: "h-12 px-8 text-[16px]",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "coral", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-manrope font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
