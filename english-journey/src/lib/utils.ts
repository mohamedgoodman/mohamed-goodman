import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function pct(value: number): string {
  return `${Math.round(Math.min(Math.max(value, 0), 100))}%`;
}

/**
 * Durations read differently in Darija and English, so the unit words come
 * from the dictionary. Callers without one fall back to English abbreviations.
 */
export function formatMinutes(
  minutes: number,
  t?: { common: { minutes: string; hour: string; hours: string } },
): string {
  const minuteWord = t?.common.minutes ?? "min";
  if (minutes < 60) return `${minutes} ${minuteWord}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourWord = t ? (hours === 1 ? t.common.hour : t.common.hours) : "h";
  const head = t ? `${hours} ${hourWord}` : `${hours}h`;
  if (!rest) return head;
  return t ? `${head} ${rest} ${minuteWord}` : `${head} ${rest}m`;
}
