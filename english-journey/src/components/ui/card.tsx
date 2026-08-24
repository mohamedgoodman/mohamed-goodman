"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds hover elevation. On by default for interactive surfaces. */
  interactive?: boolean;
  /** Pointer-tracked 3D tilt. Desktop pointers only, never on touch. */
  tilt?: boolean;
  /** Brighter fill for panels that should read as sitting on top. */
  elevated?: boolean;
  /** Ambient purple glow behind the card. */
  glow?: boolean;
}

const MAX_TILT_DEGREES = 4.5;

export function Card({
  className,
  children,
  interactive,
  tilt,
  elevated,
  glow,
  ...props
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>();

  // Tilt is opt-in, capped at 4.5°, and only bound for fine pointers — a phone
  // never runs this handler.
  const onMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!tilt || event.pointerType !== "mouse") return;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      setTransform(
        `rotateX(${(-py * MAX_TILT_DEGREES).toFixed(2)}deg) rotateY(${(px * MAX_TILT_DEGREES).toFixed(2)}deg) translateZ(0)`,
      );
    },
    [tilt],
  );

  return (
    <div
      ref={ref}
      onPointerMove={tilt ? onMove : undefined}
      onPointerLeave={tilt ? () => setTransform(undefined) : undefined}
      style={tilt ? { transform } : undefined}
      className={cn(
        "card p-5 sm:p-6",
        elevated && "card-elevated",
        glow && "glow-purple",
        (interactive || tilt) && "lift",
        tilt && "tilt",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h3 className="text-base font-semibold sm:text-lg">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Small label above a value — used across the metric tiles. */
export function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium tracking-[0.09em] text-dim uppercase">{children}</span>
  );
}
