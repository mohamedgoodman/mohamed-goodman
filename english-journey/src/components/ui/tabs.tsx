"use client";

import { cn } from "@/lib/utils";

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
      className={cn("scrollbar-none flex gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1", className)}
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
              "flex-shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all",
              active ? "bg-surface text-text shadow-sm" : "text-muted hover:text-text",
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span className={cn("ml-1.5 text-xs", active ? "text-brand" : "text-muted")}>
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
