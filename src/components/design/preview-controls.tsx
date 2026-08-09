"use client";

import { useTheme } from "next-themes";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

/**
 * Light/dark + locale switcher for the token preview page, so the whole
 * system can be checked in dark mode and in RTL without leaving the page.
 * The real header switcher arrives with the header work.
 */
export function PreviewControls() {
  const t = useTranslations("common");
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const active = useLocale();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <fieldset className="border-border flex items-center gap-1 rounded-sm border p-1">
        <legend className="sr-only">{t("theme")}</legend>
        {(["light", "dark"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            aria-pressed={resolvedTheme === mode}
            className="aria-pressed:bg-foreground aria-pressed:text-background rounded-xs px-3 py-1 text-sm transition-colors"
          >
            {mode === "light" ? t("themeLight") : t("themeDark")}
          </button>
        ))}
      </fieldset>

      <fieldset className="border-border flex items-center gap-1 rounded-sm border p-1">
        <legend className="sr-only">{t("language")}</legend>
        {locales.map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => router.replace(pathname, { locale })}
            aria-pressed={active === locale}
            lang={locale}
            className="aria-pressed:bg-foreground aria-pressed:text-background rounded-xs px-3 py-1 text-sm transition-colors"
          >
            {localeLabels[locale].native}
          </button>
        ))}
      </fieldset>
    </div>
  );
}
