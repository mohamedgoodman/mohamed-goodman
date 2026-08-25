import { cn } from "@/lib/utils";

/**
 * Progress uses the product's progression gradient (purple → blue → cyan) with
 * a soft glow and a moving sheen, so advancing a step reads as motion rather
 * than a jump.
 */
export function ProgressBar({
  value,
  className,
  tone = "brand",
  label,
  showValue,
  size = "md",
}: {
  value: number;
  className?: string;
  tone?: "brand" | "success" | "accent" | "danger" | "cyan";
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md";
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const fill: Record<string, string> = {
    brand: "var(--grad-progress)",
    success: "linear-gradient(90deg,#10b981,#22d3ee)",
    accent: "linear-gradient(90deg,#f59e0b,#f97316)",
    danger: "linear-gradient(90deg,#f43f5e,#be123c)",
    cyan: "linear-gradient(90deg,#22d3ee,#2563eb)",
  };
  const glow: Record<string, string> = {
    brand: "0 0 12px rgba(124,58,237,0.5)",
    success: "0 0 12px rgba(16,185,129,0.45)",
    accent: "0 0 12px rgba(245,158,11,0.45)",
    danger: "0 0 12px rgba(244,63,94,0.45)",
    cyan: "0 0 12px rgba(34,211,238,0.45)",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
          {label ? <span className="text-muted">{label}</span> : <span />}
          {showValue ? <span className="font-semibold tabular-nums">{Math.round(clamped)}%</span> : null}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-surface-3/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]",
          size === "sm" ? "h-1.5" : "h-2.5",
        )}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="relative h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${clamped}%`, background: fill[tone], boxShadow: glow[tone] }}
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full opacity-60"
            style={{
              background:
                "linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0) 55%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/** Circular progress with a gradient stroke — used for scores and rings. */
export function RingProgress({
  value,
  size = 84,
  stroke = 8,
  tone = "brand",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: "brand" | "success" | "cyan" | "amber";
  children?: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;
  const id = `ring-${tone}-${size}-${stroke}`;
  const stops: Record<string, [string, string, string]> = {
    brand: ["#a855f7", "#2563eb", "#22d3ee"],
    success: ["#10b981", "#22d3ee", "#22d3ee"],
    cyan: ["#22d3ee", "#2563eb", "#7c3aed"],
    amber: ["#f59e0b", "#f97316", "#f43f5e"],
  };
  const [from, mid, to] = stops[tone] ?? stops.brand!;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="55%" stopColor={mid} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke="var(--surface-3)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={`url(#${id})`}
          filter={`url(#${id}-glow)`}
          className="transition-[stroke-dashoffset] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
