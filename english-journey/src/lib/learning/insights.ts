import type { DailyStat, Insight, SkillId, SkillScores, Streak, UserProgress } from "@/types";
import { lastNDays, todayISO } from "./dates";

/**
 * Meaningful feedback instead of motivational wallpaper.
 *
 * Every line here is derived from the user's own numbers; if there is no
 * evidence for a statement, the statement isn't produced. Lines are returned
 * as ids plus parameters so the interface can render them in Darija or
 * English without the engine knowing which.
 */
export function buildInsights(progress: UserProgress, streak: Streak): Insight[] {
  const out: Insight[] = [];
  const week = lastNDays(7);
  const practisedThisWeek = week.filter((day) => streak.history.includes(day)).length;

  if (progress.sessionsCompleted === 0) {
    return [{ id: "firstSession" }, { id: "firstSessionHint" }];
  }

  if (practisedThisWeek > 0) {
    out.push(
      practisedThisWeek >= progress.weeklyGoalDays
        ? { id: "weekDaysMet", params: { days: practisedThisWeek } }
        : {
            id: "weekDaysLeft",
            params: {
              days: practisedThisWeek,
              left: progress.weeklyGoalDays - practisedThisWeek,
            },
          },
    );
  }

  const accuracyDelta = compareAccuracy(progress.daily);
  if (accuracyDelta !== null) {
    out.push({
      id: accuracyDelta >= 0 ? "accuracyUp" : "accuracyDown",
      params: { percent: Math.abs(accuracyDelta) },
    });
  }

  if (progress.wordsMastered > 0) {
    out.push({ id: "wordsMastered", params: { count: progress.wordsMastered } });
  }

  const weakest = weakestSkill(progress.skills);
  if (weakest) {
    out.push({ id: "weakestSkill", params: { skill: weakest.skill, score: weakest.score } });
  }

  const strongest = strongestSkill(progress.skills);
  if (strongest && strongest.score >= 75) {
    out.push({ id: "strongestSkill", params: { skill: strongest.skill, score: strongest.score } });
  }

  if (streak.current >= 3) {
    out.push({ id: "streakRunning", params: { days: streak.current } });
  } else if (streak.current === 0 && streak.longest >= 3) {
    out.push({ id: "streakRestart", params: { days: streak.longest } });
  }

  if (progress.totalMinutes >= 60) {
    out.push({ id: "hoursLogged", params: { hours: Math.floor(progress.totalMinutes / 60) } });
  }

  return out.slice(0, 5);
}

/** Difference in mean accuracy between the last 7 days and the 7 before. */
function compareAccuracy(daily: DailyStat[]): number | null {
  const recent = lastNDays(7);
  const previous = lastNDays(14).slice(0, 7);
  const mean = (days: string[]) => {
    const rows = daily.filter((d) => days.includes(d.date) && d.sessions > 0);
    if (!rows.length) return null;
    return rows.reduce((sum, r) => sum + r.accuracy, 0) / rows.length;
  };
  const a = mean(recent);
  const b = mean(previous);
  if (a === null || b === null) return null;
  return Math.round(a - b);
}

export function weakestSkill(skills: SkillScores): { skill: SkillId; score: number } | null {
  const entries = Object.entries(skills).filter(([, score]) => score > 0) as [SkillId, number][];
  if (!entries.length) return null;
  const [skill, score] = entries.reduce((min, cur) => (cur[1] < min[1] ? cur : min));
  return { skill, score };
}

export function strongestSkill(skills: SkillScores): { skill: SkillId; score: number } | null {
  const entries = Object.entries(skills).filter(([, score]) => score > 0) as [SkillId, number][];
  if (!entries.length) return null;
  const [skill, score] = entries.reduce((max, cur) => (cur[1] > max[1] ? cur : max));
  return { skill, score };
}

/**
 * What tomorrow will target. The wording escalates with how weak the session
 * actually was — a 96% session is never described as a struggle.
 */
export function tomorrowFocus(
  sessionSkills: Partial<SkillScores>,
  fallback: SkillScores,
): Insight {
  const entries = Object.entries(sessionSkills).filter(([, v]) => typeof v === "number") as [
    SkillId,
    number,
  ][];
  const source = entries.length
    ? entries
    : (Object.entries(fallback).filter(([, v]) => v > 0) as [SkillId, number][]);
  if (!source.length) return { id: "tomorrowSteady" };

  const [skill, score] = source.reduce((min, cur) => (cur[1] < min[1] ? cur : min));
  if (score >= 85) return { id: "tomorrowSteady", params: { skill, score } };
  if (score >= 65) return { id: "tomorrowWeakest", params: { skill, score } };
  return { id: "tomorrowStruggled", params: { skill, score } };
}

export function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function isToday(date: string | null): boolean {
  return date === todayISO();
}
