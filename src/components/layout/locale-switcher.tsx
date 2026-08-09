"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Compact FR · ع · EN switcher. It re-renders the current path in the chosen
 * locale, so a customer reading a product page stays on that product page —
 * switching language should never cost you your place.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("common");
  const active = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        pending && "opacity-60",
        className,
      )}
      role="group"
      aria-label={t("language")}
    >
      {locales.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1">
          {i > 0 ? (
            <span
              aria-hidden="true"
              className="text-muted-foreground/50 text-2xs"
            >
              ·
            </span>
          ) : null}
          <button
            type="button"
            lang={locale}
            aria-current={locale === active ? "true" : undefined}
            title={localeLabels[locale].native}
            onClick={() =>
              startTransition(() => router.replace(pathname, { locale }))
            }
            className={cn(
              "text-2xs rounded-xs px-1 py-0.5 tracking-wide uppercase transition-colors",
              locale === active
                ? "text-current underline underline-offset-4"
                : "text-current/60 hover:text-current",
            )}
          >
            {localeLabels[locale].short}
            <span className="sr-only"> — {localeLabels[locale].native}</span>
          </button>
        </span>
      ))}
    </div>
  );
}
