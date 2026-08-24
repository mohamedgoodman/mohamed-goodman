import type { DailyStat, SkillId, SkillScores, Streak, UserProgress } from "@/types";
import { lastNDays, todayISO } from "./dates";

const SKILL_LABEL: Record<SkillId, string> = {
  listening: "listening",
  vocabulary: "vocabulary",
  speaking: "speaking",
  pronunciation: "pronunciation",
  grammar: "grammar",
};

/**
 * Meaningful feedback instead of motivational wallpaper.
 *
 * Every line here is derived from the user's own numbers; if there is no
 * evidence for a statement, the statement isn't shown.
 */
export function buildInsights(progress: UserProgress, streak: Streak): string[] {
  const out: string[] = [];
  const week = lastNDays(7);
  const practisedThisWeek = week.filter((day) => streak.history.includes(day)).length;

  if (progress.sessionsCompleted === 0) {
    return [
      "Nothing measured yet. Your first session sets the baseline everything else is compared against.",
      "Ten minutes today is worth more than an hour next Sunday.",
    ];
  }

  if (practisedThisWeek > 0) {
    out.push(
      `You practised ${practisedThisWeek} day${practisedThisWeek === 1 ? "" : "s"} this week` +
        (practisedThisWeek >= progress.weeklyGoalDays
          ? ` — that's your weekly goal met.`
          : ` — ${progress.weeklyGoalDays - practisedThisWeek} more to hit your weekly goal.`),
    );
  }

  const accuracyDelta = compareAccuracy(progress.daily);
  if (accuracyDelta !== null) {
    const direction = accuracyDelta >= 0 ? "improved" : "dropped";
    out.push(
      `Your accuracy ${direction} by ${Math.abs(accuracyDelta)}% compared with the previous week.`,
    );
  }

  if (progress.wordsMastered > 0) {
    out.push(`You've mastered ${progress.wordsMastered} expression${progress.wordsMastered === 1 ? "" : "s"} so far.`);
  }

  const weakest = weakestSkill(progress.skills);
  if (weakest) {
    out.push(
      `${capitalise(SKILL_LABEL[weakest.skill])} is your weakest area right now (${weakest.score}%). Tomorrow's session will spend more time there.`,
    );
  }

  const strongest = strongestSkill(progress.skills);
  if (strongest && strongest.score >= 75) {
    out.push(`${capitalise(SKILL_LABEL[strongest.skill])} is holding at ${strongest.score}% — that's a genuine strength now.`);
  }

  if (streak.current >= 3) {
    out.push(`${streak.current} days in a row. Consistency at this length is what actually moves your level.`);
  } else if (streak.current === 0 && streak.longest >= 3) {
    out.push(`Your longest streak was ${streak.longest} days. One session today restarts the clock.`);
  }

  if (progress.totalMinutes >= 60) {
    const hours = Math.floor(progress.totalMinutes / 60);
    out.push(`${hours} hour${hours === 1 ? "" : "s"} of deliberate practice logged.`);
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

/** One concrete sentence about what tomorrow will target. */
export function tomorrowFocus(sessionSkills: Partial<SkillScores>, fallback: SkillScores): string {
  const entries = Object.entries(sessionSkills).filter(([, v]) => typeof v === "number") as [SkillId, number][];
  const source = entries.length
    ? entries
    : (Object.entries(fallback).filter(([, v]) => v > 0) as [SkillId, number][]);
  if (!source.length) return "Tomorrow: a balanced session across all five skills.";
  const [skill, score] = source.reduce((min, cur) => (cur[1] < min[1] ? cur : min));
  const advice: Record<SkillId, string> = {
    listening: "more listening at your current speed, with replay on the hard lines",
    vocabulary: "vocabulary in context, weighted towards the words you missed",
    speaking: "a longer speaking scenario with feedback on naturalness",
    pronunciation: "targeted pronunciation drills on the sounds that cost you clarity",
    grammar: "grammar in use — the patterns you actually needed today",
  };
  // Only call it a struggle when it actually was one — overstating a 96%
  // session is exactly the kind of fake feedback this app avoids.
  if (score >= 85) {
    return `Everything held up today. ${capitalise(SKILL_LABEL[skill])} was your lowest at ${score}%, so tomorrow steps the difficulty up rather than repeating this.`;
  }
  if (score >= 65) {
    return `${capitalise(SKILL_LABEL[skill])} was your weakest area today (${score}%). Tomorrow's session leans into ${advice[skill]}.`;
  }
  return `You struggled with ${SKILL_LABEL[skill]} today (${score}%). Tomorrow's session will start with ${advice[skill]}.`;
}

export function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function isToday(date: string | null): boolean {
  return date === todayISO();
}
