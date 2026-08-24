"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Big, tappable choice used through onboarding and settings. */
export function OptionCard({
  selected,
  title,
  description,
  icon,
  onClick,
  className,
}: {
  selected: boolean;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-150",
        "hover:border-brand/60 hover:bg-brand-soft/40 active:scale-[0.99]",
        selected ? "border-brand bg-brand-soft/60 ring-2 ring-brand/25" : "border-border bg-surface",
        className,
      )}
    >
      {icon ? <span className="text-2xl leading-none">{icon}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        {description ? <span className="mt-0.5 block text-sm text-muted">{description}</span> : null}
      </span>
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected ? "border-brand bg-brand text-white" : "border-border",
        )}
        aria-hidden
      >
        {selected ? <Check className="size-3.5" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}
