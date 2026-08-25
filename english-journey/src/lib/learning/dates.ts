/** Calendar helpers. All dates in the app are local YYYY-MM-DD strings. */

export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + days);
  return todayISO(dt);
}

export function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`).getTime();
  const b = new Date(`${to}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** ISO week key, e.g. "2026-W13" — used to bucket weekly XP. */
export function weekKey(date: string): string {
  const dt = new Date(`${date}T00:00:00`);
  const target = new Date(dt.valueOf());
  const dayNumber = (dt.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.valueOf() - firstThursday.valueOf();
  const week = 1 + Math.round(diff / 604_800_000);
  return `${target.getFullYear()}-W${`${week}`.padStart(2, "0")}`;
}

/** The last `count` days, oldest first, ending today. */
export function lastNDays(count: number, end: string = todayISO()): string[] {
  return Array.from({ length: count }, (_, i) => addDays(end, i - count + 1));
}

export function formatDayLabel(date: string, locale?: string): string {
  const dt = new Date(`${date}T00:00:00`);
  return dt.toLocaleDateString(locale === "ar" ? "ar-MA" : locale || undefined, {
    weekday: "short",
  });
}
