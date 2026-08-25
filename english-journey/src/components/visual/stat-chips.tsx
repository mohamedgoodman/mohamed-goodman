"use client";

import { useEffect, useRef, useState } from "react";
import { Flame, Zap } from "lucide-react";
import { AnimatedNumber } from "./animated-number";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";

/**
 * XP chip. When the number goes up it pulses and throws a few sparks — small
 * enough to feel like a reward, short enough never to be in the way.
 */
export function XpChip({
  xp,
  className,
  compact,
}: {
  xp: number;
  className?: string;
  compact?: boolean;
}) {
  const t = useT();
  const [sparks, setSparks] = useState(0);
  const previous = useRef(xp);

  useEffect(() => {
    if (xp > previous.current) setSparks((n) => n + 1);
    previous.current = xp;
  }, [xp]);

  return (
    <span
      key={sparks}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        "bg-accent-soft text-on-accent ring-1 ring-inset ring-accent/30 backdrop-blur",
        sparks > 0 && "animate-pop",
        className,
      )}
      title={`${xp.toLocaleString()} ${t.progress.totalXp}`}
    >
      <Zap className="size-3.5" />
      <AnimatedNumber value={xp} />
      {compact ? null : <span className="text-[11px] font-medium opacity-80">{t.progress.totalXp}</span>}
      {sparks > 0 ? (
        <span aria-hidden className="pointer-events-none absolute inset-0">
          {[
            { dx: "-14px", dy: "-18px" },
            { dx: "10px", dy: "-22px" },
            { dx: "18px", dy: "-10px" },
          ].map((spark, index) => (
            <span
              key={index}
              className="absolute top-1/2 left-1/2 size-1 rounded-full bg-accent"
              style={
                {
                  "--dx": spark.dx,
                  "--dy": spark.dy,
                  animation: `spark 720ms ease-out ${index * 60}ms both`,
                } as React.CSSProperties
              }
            />
          ))}
        </span>
      ) : null}
    </span>
  );
}

/** Streak chip — the flame breathes once the streak is alive. */
export function StreakChip({
  days,
  className,
  compact,
}: {
  days: number;
  className?: string;
  compact?: boolean;
}) {
  const t = useT();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        "bg-[rgba(249,115,22,0.14)] text-on-accent ring-1 ring-inset ring-accent/30 backdrop-blur",
        className,
      )}
      title={`${days} ${days === 1 ? t.common.day : t.common.days}`}
    >
      <Flame className={cn("size-3.5", days > 0 && "animate-flame")} />
      <AnimatedNumber value={days} />
      {compact ? null : (
        <span className="text-[11px] font-medium opacity-80">
          {days === 1 ? t.common.day : t.common.days}
        </span>
      )}
    </span>
  );
}
