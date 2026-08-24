import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  tone = "brand",
  label,
  showValue,
}: {
  value: number;
  className?: string;
  tone?: "brand" | "success" | "accent" | "danger";
  label?: string;
  showValue?: boolean;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const bg = {
    brand: "bg-brand",
    success: "bg-success",
    accent: "bg-accent",
    danger: "bg-danger",
  }[tone];

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
          {label ? <span className="text-muted">{label}</span> : <span />}
          {showValue ? <span className="font-medium tabular-nums">{Math.round(clamped)}%</span> : null}
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", bg)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function RingProgress({
  value,
  size = 84,
  stroke = 8,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-surface-2"
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
          className="stroke-brand transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
