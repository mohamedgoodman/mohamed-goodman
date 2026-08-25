import { cn } from "@/lib/utils";

type Tone = "brand" | "neutral" | "success" | "warning" | "danger" | "accent" | "cyan";

/** Tinted glass pills: a translucent fill, a matching hairline, no hard blocks. */
const TONES: Record<Tone, string> = {
  brand: "bg-brand-soft text-on-brand ring-1 ring-inset ring-purple/30",
  neutral: "bg-surface-2/80 text-muted ring-1 ring-inset ring-border-strong",
  success: "bg-success-soft text-on-success ring-1 ring-inset ring-success/30",
  warning: "bg-accent-soft text-on-accent ring-1 ring-inset ring-accent/30",
  danger: "bg-danger-soft text-on-danger ring-1 ring-inset ring-danger/30",
  accent: "bg-accent-soft text-on-accent ring-1 ring-inset ring-accent/30",
  cyan: "bg-cyan-soft text-on-cyan ring-1 ring-inset ring-cyan/30",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap backdrop-blur",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
