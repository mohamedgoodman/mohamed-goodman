"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success" | "cyan";
type Size = "sm" | "md" | "lg" | "xl" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

/**
 * Primary is the product's one loud element: purple → blue gradient, an outer
 * glow, a top inner highlight for the "moulded" edge, hover elevation and a
 * press depression. Everything else is deliberately quieter.
 */
const VARIANTS: Record<Variant, string> = {
  primary: [
    "text-white [background:var(--grad-brand)] bg-[length:200%_100%] bg-left",
    "shadow-[0_6px_20px_rgba(124,58,237,0.35),inset_0_1px_0_rgba(255,255,255,0.22)]",
    "hover:bg-right hover:shadow-[0_10px_28px_rgba(124,58,237,0.45),inset_0_1px_0_rgba(255,255,255,0.28)]",
    "hover:-translate-y-0.5",
  ].join(" "),
  secondary: [
    "text-text border border-border-strong bg-surface-2/80 backdrop-blur",
    "shadow-[var(--shadow-sm),var(--inner-highlight)]",
    "hover:border-brand/50 hover:bg-surface-3 hover:-translate-y-0.5",
  ].join(" "),
  ghost: "text-muted hover:text-text hover:bg-surface-2/70",
  outline: [
    "text-text border border-border-strong bg-transparent",
    "hover:border-brand/55 hover:bg-brand-soft hover:-translate-y-0.5",
  ].join(" "),
  danger: [
    "text-white [background:linear-gradient(135deg,#f43f5e,#be123c)]",
    "shadow-[0_6px_18px_rgba(244,63,94,0.32),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5",
  ].join(" "),
  success: [
    "text-white [background:linear-gradient(135deg,#10b981,#059669)]",
    "shadow-[0_6px_18px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5",
  ].join(" "),
  cyan: [
    "text-[#04212a] [background:linear-gradient(135deg,#22d3ee,#2563eb)]",
    "shadow-[0_6px_18px_rgba(34,211,238,0.32),inset_0_1px_0_rgba(255,255,255,0.35)] hover:-translate-y-0.5",
  ].join(" "),
};

/** Touch targets stay at 40px+ so every control is comfortable on a phone. */
const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-xl gap-1.5",
  md: "h-11 px-4.5 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-[15px] rounded-2xl gap-2",
  xl: "h-14 px-7 text-base rounded-2xl gap-2.5",
  icon: "size-11 rounded-xl justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center font-medium whitespace-nowrap",
        "transition-[transform,box-shadow,background-position,border-color,background-color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "active:translate-y-0 active:scale-[0.975]",
        "disabled:pointer-events-none disabled:opacity-45",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
});
