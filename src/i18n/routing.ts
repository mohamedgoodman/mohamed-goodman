import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "ar", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

/** Locales that lay out right-to-left. Drives `dir` on <html>. */
export const rtlLocales: Locale[] = ["ar"];

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

export const localeLabels: Record<Locale, { native: string; short: string }> = {
  fr: { native: "Français", short: "FR" },
  ar: { native: "العربية", short: "AR" },
  en: { native: "English", short: "EN" },
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // French is the default and lives at `/`; `/ar` and `/en` are prefixed.
  localePrefix: "as-needed",
  // Browser Accept-Language was sending anyone with an English phone to /en.
  // The shop is French-first; visitors switch language deliberately.
  localeDetection: false,
});
