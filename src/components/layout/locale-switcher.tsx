"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDownIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Language picker as a small dropdown.
 *
 * Three codes side by side ate header width and read as navigation. A single
 * trigger showing the current language is quieter and leaves room for the
 * things people actually came to tap.
 *
 * Switching re-renders the current path in the chosen locale, so you keep your
 * place — language should never cost you the page you were on.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("common");
  const active = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={cn("relative", pending && "opacity-60", className)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("language")}
        className="flex items-center gap-1 px-1.5 py-1 text-xs tracking-wide uppercase transition-opacity hover:opacity-70"
      >
        {localeLabels[active].short}
        <ChevronDownIcon className="size-3" aria-hidden="true" />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={t("language")}
          className="bg-background border-border absolute end-0 top-full z-50 mt-1 min-w-32 border py-1 shadow-md"
        >
          {locales.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                lang={locale}
                role="option"
                aria-selected={locale === active}
                onClick={() => {
                  setOpen(false);
                  startTransition(() => router.replace(pathname, { locale }));
                }}
                className={cn(
                  "hover:bg-surface w-full px-3 py-2 text-start text-sm transition-colors",
                  locale === active && "font-medium",
                )}
              >
                {localeLabels[locale].native}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
