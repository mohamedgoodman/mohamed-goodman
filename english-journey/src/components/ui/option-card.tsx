"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Big, tappable choice used through onboarding and settings. Selected state is
 * a gradient-lit panel rather than a coloured box, so it reads as "raised".
 */
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
        "group press relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left",
        "transition-[transform,box-shadow,border-color,background] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-0.5 hover:border-purple/45",
        selected
          ? "border-purple/60 bg-brand-soft shadow-[0_8px_26px_rgba(124,58,237,0.28),inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-border-strong bg-surface/70 shadow-[var(--shadow-sm)] backdrop-blur hover:bg-surface-2/80",
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl text-xl transition-transform duration-300",
            "bg-surface-2/80 shadow-[var(--inner-highlight)] group-hover:scale-105",
            selected && "bg-transparent [background:var(--grad-brand)] shadow-[0_4px_14px_rgba(124,58,237,0.4)]",
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        {description ? <span className="mt-0.5 block text-sm text-muted">{description}</span> : null}
      </span>
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
          selected
            ? "border-transparent [background:var(--grad-brand)] text-white shadow-[0_0_12px_rgba(124,58,237,0.55)]"
            : "border-border-strong",
        )}
        aria-hidden
      >
        {selected ? <Check className="size-3.5" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}
