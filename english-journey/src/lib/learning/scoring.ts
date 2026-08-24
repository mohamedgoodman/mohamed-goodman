import type { DailySession, SessionResult, SkillId, SkillScores } from "@/types";
import { SKILLS } from "@/types";

/** XP is earned for work done, with a small bonus for accuracy and difficulty. */
export function computeXp(session: DailySession, score: number): number {
  const base = session.totalMinutes * 4;
  const accuracyBonus = Math.round((score / 100) * 40);
  const difficultyBonus = session.challengeLevel * 12;
  const completionBonus = session.results.length >= 4 ? 25 : 0;
  return base + accuracyBonus + difficultyBonus + completionBonus;
}

export function scoreSession(results: SessionResult[]): number {
  if (!results.length) return 0;
  const total = results.reduce((sum, r) => sum + r.score, 0);
  return Math.round(total / results.length);
}

/** Per-skill accuracy for one session, only for skills actually practised. */
export function skillScoresFor(results: SessionResult[]): Partial<SkillScores> {
  const acc: Partial<Record<SkillId, { sum: number; n: number }>> = {};
  for (const result of results) {
    const bucket = (acc[result.skill] ??= { sum: 0, n: 0 });
    bucket.sum += result.score;
    bucket.n += 1;
  }
  const out: Partial<SkillScores> = {};
  for (const skill of SKILLS) {
    const bucket = acc[skill];
    if (bucket && bucket.n) out[skill] = Math.round(bucket.sum / bucket.n);
  }
  return out;
}

/**
 * Rolling skill average. New evidence is weighted at 30% so a single bad day
 * doesn't erase a month of work — and a single good day doesn't fake progress.
 */
export function blendSkills(previous: SkillScores, session: Partial<SkillScores>): SkillScores {
  const next = { ...previous };
  for (const skill of SKILLS) {
    const observed = session[skill];
    if (observed === undefined) continue;
    next[skill] = Math.round(previous[skill] === 0 ? observed : previous[skill] * 0.7 + observed * 0.3);
  }
  return next;
}
