/**
 * Language configuration.
 *
 * The app is built for Moroccan learners, so Darija is the default interface
 * language and English is the alternative. The *content* being learned is
 * always English — only the explanations, navigation and coaching switch.
 */
export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar";
export const LOCALE_COOKIE = "ej_locale";

export const LOCALE_META: Record<Locale, { label: string; nativeLabel: string; dir: "rtl" | "ltr"; flag: string }> = {
  ar: { label: "Darija", nativeLabel: "الدارجة المغربية", dir: "rtl", flag: "🇲🇦" },
  en: { label: "English", nativeLabel: "English", dir: "ltr", flag: "🇬🇧" },
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function dirFor(locale: Locale): "rtl" | "ltr" {
  return LOCALE_META[locale].dir;
}
