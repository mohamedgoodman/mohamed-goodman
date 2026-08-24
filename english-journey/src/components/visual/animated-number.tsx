"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Counts from the previous value to the new one when a metric changes.
 *
 * It only animates on *change* — the first render prints the number directly,
 * so a page load never shows a slot-machine. Reduced-motion users get the
 * final value immediately.
 */
export function AnimatedNumber({
  value,
  duration = 850,
  className,
  format = (n: number) => n.toLocaleString(),
}: {
  value: number;
  duration?: number;
  className?: string;
  format?: (value: number) => string;
}) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);
  const frame = useRef<number>(undefined);

  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (from === value) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion: land on the value on the next frame rather than
    // synchronously inside the effect.
    if (reduced) {
      frame.current = requestAnimationFrame(() => setDisplay(value));
      return () => {
        if (frame.current) cancelAnimationFrame(frame.current);
      };
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo — fast then settles, which reads as "landing" on a number.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  return (
    <span className={cn("tabular-nums", className)}>{format(display)}</span>
  );
}
