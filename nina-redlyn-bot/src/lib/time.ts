/**
 * Scheduling in a fixed channel timezone, without pulling in a date library.
 *
 * Everything the admin types is interpreted in `TIMEZONE`; everything stored
 * and compared is UTC.
 */

/** Milliseconds a zone is ahead of UTC at the given instant. */
function zoneOffset(instant: Date, timeZone: string): number {
  // en-CA gives an ISO-ish "2026-08-15, 18:30:00" that is trivial to re-parse.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return asUtc - instant.getTime();
}

/** Turns wall-clock fields in `timeZone` into the matching UTC instant. */
export function zonedToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  // One correction pass resolves the offset; a second settles DST boundaries.
  let instant = new Date(guess - zoneOffset(new Date(guess), timeZone));
  instant = new Date(guess - zoneOffset(instant, timeZone));
  return instant;
}

/** Current wall-clock date in `timeZone`. */
function todayIn(timeZone: string): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = parts.split("-").map(Number);
  return { y: y!, m: m!, d: d! };
}

export function formatInZone(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(instant);
}

export type ParseResult =
  { ok: true; at: Date } | { ok: false; reason: string };

/**
 * Accepts, all case-insensitive:
 *   in 30m · in 2h · in 90 min
 *   18:30 · today 18:30 · tomorrow 9:00
 *   20/08 18:30 · 20/08/2026 18:30 · 2026-08-20 18:30
 */
export function parseWhen(input: string, timeZone: string): ParseResult {
  const text = input.trim().toLowerCase().replace(/\s+/g, " ");
  if (!text) return { ok: false, reason: "empty" };

  const relative = text.match(
    /^in (\d+) ?(m|min|mins|minutes|h|hr|hrs|hours|d|days?)$/,
  );
  if (relative) {
    const amount = Number(relative[1]);
    const unit = relative[2]!;
    const ms = unit.startsWith("m")
      ? amount * 60_000
      : unit.startsWith("h")
        ? amount * 3_600_000
        : amount * 86_400_000;
    if (ms <= 0) return { ok: false, reason: "that is not in the future" };
    return { ok: true, at: new Date(Date.now() + ms) };
  }

  const time = text.match(/(\d{1,2})[:h](\d{2})$/);
  if (!time) return { ok: false, reason: "no time found" };
  const hour = Number(time[1]);
  const minute = Number(time[2]);
  if (hour > 23 || minute > 59) return { ok: false, reason: "invalid time" };

  const datePart = text.slice(0, time.index).trim();
  const today = todayIn(timeZone);
  let y = today.y;
  let m = today.m;
  let d = today.d;

  const iso = datePart.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const slash = datePart.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/);

  if (iso) {
    y = Number(iso[1]);
    m = Number(iso[2]);
    d = Number(iso[3]);
  } else if (slash) {
    d = Number(slash[1]);
    m = Number(slash[2]);
    if (slash[3]) y = Number(slash[3]);
  } else if (datePart === "tomorrow") {
    const t = new Date(
      zonedToUtc(y, m, d, 12, 0, timeZone).getTime() + 86_400_000,
    );
    const next = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(t)
      .split("-")
      .map(Number);
    y = next[0]!;
    m = next[1]!;
    d = next[2]!;
  } else if (datePart !== "" && datePart !== "today") {
    return { ok: false, reason: `could not read the date "${datePart}"` };
  }

  let at = zonedToUtc(y, m, d, hour, minute, timeZone);

  // A bare time that has already passed means the same time tomorrow.
  if ((datePart === "" || datePart === "today") && at.getTime() <= Date.now()) {
    at = new Date(at.getTime() + 86_400_000);
  }

  if (at.getTime() <= Date.now()) {
    return { ok: false, reason: "that moment has already passed" };
  }
  return { ok: true, at };
}
