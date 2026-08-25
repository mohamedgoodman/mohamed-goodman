"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "./theme-provider";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";

const OPTIONS: { id: Theme; icon: typeof Sun }[] = [
  { id: "light", icon: Sun },
  { id: "dark", icon: Moon },
  { id: "system", icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const t = useT();
  const labels: Record<Theme, string> = {
    light: t.settings.themeLight,
    dark: t.settings.themeDark,
    system: t.settings.themeSystem,
  };
  return (
    <div
      role="radiogroup"
      aria-label={t.settings.appearance}
      className={cn(
        "inline-flex rounded-xl border border-border bg-surface-2/70 p-1 backdrop-blur",
        "shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      {OPTIONS.map(({ id, icon: Icon }) => (
        <button
          key={id}
          role="radio"
          aria-checked={theme === id}
          aria-label={labels[id]}
          title={labels[id]}
          onClick={() => setTheme(id)}
          className={cn(
            "flex size-9 items-center justify-center rounded-lg transition-all duration-200",
            theme === id
              ? "bg-surface text-text shadow-[0_2px_8px_rgba(2,4,12,0.5)] ring-1 ring-purple/30"
              : "text-dim hover:text-text",
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}
