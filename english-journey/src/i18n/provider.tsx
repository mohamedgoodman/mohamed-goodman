"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_META, type Locale } from "./config";
import { en } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";
import type { Dictionary } from "./dictionaries/en";
import type { Insight } from "@/types";
import { formatMinutes } from "@/lib/utils";

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };

interface I18nContextValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  /** The dictionary, accessed directly: `t.dashboard.todayMission`. */
  t: Dictionary;
  /** Fill `{name}` placeholders: `fmt(t.learn.builtFrom, { goal, minutes })`. */
  fmt: (template: string, values: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const setLocale = useCallback((next: Locale) => {
    // A cookie, so the server renders the right language on the very first
    // paint of the next navigation — no flash of the wrong script.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    window.location.reload();
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: LOCALE_META[locale].dir,
      t: DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE],
      fmt: (template, values) =>
        template.replace(/\{(\w+)\}/g, (match, key: string) =>
          key in values ? String(values[key]) : match,
        ),
      setLocale,
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}

/** Shorthand for the common case. */
export function useT(): Dictionary {
  return useI18n().t;
}

/**
 * Durations, counted the way Arabic actually counts: one, two, a few (3–10)
 * and many each take a different form. Same rule as `useDays`.
 */
export function useDuration(): (minutes: number) => string {
  const { t, locale } = useI18n();
  return useCallback(
    (minutes: number) => {
      if (locale !== "ar") return formatMinutes(minutes, t);

      const arabic = (count: number, one: string, two: string, few: string, many: string) => {
        if (count === 1) return one;
        if (count === 2) return two;
        if (count <= 10) return `${count} ${few}`;
        return `${count} ${many}`;
      };

      if (minutes < 60) return arabic(minutes, "دقيقة", "دقيقتين", "دقايق", "دقيقة");
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      const head = arabic(hours, "ساعة", "ساعتين", "سوايع", "ساعة");
      if (!rest) return head;
      return `${head} و${arabic(rest, "دقيقة", "دقيقتين", "دقايق", "دقيقة")}`;
    },
    [t, locale],
  );
}

/**
 * Day counts, correctly. Arabic distinguishes one, two, a few (3–10) and many,
 * and getting it wrong is the first thing a Moroccan reader notices.
 */
export function useDays(): (count: number) => string {
  const { t, locale } = useI18n();
  return useCallback(
    (count: number) => {
      if (locale !== "ar") return `${count} ${count === 1 ? t.common.day : t.common.days}`;
      if (count === 1) return "نهار";
      if (count === 2) return "نهارين";
      if (count <= 10) return `${count} أيام`;
      return `${count} نهار`;
    },
    [t, locale],
  );
}

/**
 * Renders a generated coaching line (an id plus parameters) in the current
 * language. Skill names inside the parameters are translated too, so
 * "listening" becomes "الاستماع" rather than leaking through.
 */
export function useInsightText(): (insight: Insight) => string {
  const { t, fmt } = useI18n();
  return useCallback(
    (insight: Insight) => {
      const template = t.insights[insight.id];
      const params = { ...(insight.params ?? {}) };
      const skill = params.skill;
      if (typeof skill === "string" && skill in t.content.skills) {
        params.skill = t.content.skills[skill as keyof typeof t.content.skills];
      }
      return fmt(template, params);
    },
    [t, fmt],
  );
}
