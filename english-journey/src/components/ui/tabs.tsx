"use client";

import { cn } from "@/lib/utils";

/** Segmented control on a recessed track; the active pill floats above it. */
export function TabBar<T extends string | number>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "scrollbar-none flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface-2/60 p-1.5 backdrop-blur",
        "shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "press flex-shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium whitespace-nowrap",
              "transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
              active
                ? "bg-surface text-text shadow-[0_2px_10px_rgba(2,4,12,0.5),inset_0_1px_0_rgba(255,255,255,0.07)] ring-1 ring-purple/25"
                : "text-muted hover:bg-surface/50 hover:text-text",
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "ms-1.5 text-xs tabular-nums",
                  active ? "text-on-brand" : "text-dim",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
