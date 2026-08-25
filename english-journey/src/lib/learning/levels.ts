import type { ChallengeLevel, LevelId, SkillScores } from "@/types";
import { LEVELS, SKILLS } from "@/types";

export const LEVEL_META: Record<LevelId, { label: string; cefr: string; blurb: string }> = {
  beginner: { label: "Beginner", cefr: "A1", blurb: "Single sentences, familiar words, slow speech." },
  elementary: { label: "Elementary", cefr: "A2", blurb: "Everyday situations, short exchanges, clear speech." },
  intermediate: { label: "Intermediate", cefr: "B1", blurb: "Most everyday topics, some idioms, normal speed." },
  "upper-intermediate": { label: "Upper Intermediate", cefr: "B2", blurb: "Abstract topics, fast dialogue, nuance and register." },
  advanced: { label: "Advanced", cefr: "C1", blurb: "Native-speed content, humour, implication, specialised language." },
};

export const CHALLENGE_META: Record<ChallengeLevel, { label: string; blurb: string }> = {
  1: { label: "Beginner", blurb: "Slow, clear speech and short sentences." },
  2: { label: "Comfortable", blurb: "Everyday speed, familiar contexts." },
  3: { label: "Real English", blurb: "Natural speed, contractions, idioms." },
  4: { label: "Fast English", blurb: "Fast dialogue, reduced sounds, less repetition." },
  5: { label: "Native Challenge", blurb: "Unmodified native speed, slang, overlapping speech." },
};

export function levelIndex(level: LevelId): number {
  return LEVELS.indexOf(level);
}

export function levelUp(level: LevelId): LevelId {
  const next = LEVELS[Math.min(levelIndex(level) + 1, LEVELS.length - 1)];
  return next ?? level;
}

export function levelDown(level: LevelId): LevelId {
  const prev = LEVELS[Math.max(levelIndex(level) - 1, 0)];
  return prev ?? level;
}

/** Levels adjacent to the learner's, used to widen content selection. */
export function levelWindow(level: LevelId, spread = 1): LevelId[] {
  const i = levelIndex(level);
  return LEVELS.filter((_, index) => Math.abs(index - i) <= spread);
}

export function emptySkillScores(value = 0): SkillScores {
  return SKILLS.reduce((acc, skill) => {
    acc[skill] = value;
    return acc;
  }, {} as SkillScores);
}

/**
 * Level progression estimate (0–100) inside the current level, from skill
 * averages and accumulated practice. Deliberately conservative: levels should
 * move over weeks, not sessions.
 */
export function estimateLevelProgress(skills: SkillScores, sessionsCompleted: number): number {
  const avg = SKILLS.reduce((sum, s) => sum + skills[s], 0) / SKILLS.length;
  const practiceFactor = Math.min(sessionsCompleted / 40, 1) * 100;
  return Math.round(Math.min(avg * 0.65 + practiceFactor * 0.35, 100));
}

/** XP → user "level number" for the gamification display. */
export function xpLevel(xpTotal: number): { level: number; into: number; needed: number } {
  // Each level costs 15% more than the previous, starting at 200 XP.
  let level = 1;
  let remaining = xpTotal;
  let cost = 200;
  while (remaining >= cost) {
    remaining -= cost;
    level += 1;
    cost = Math.round(cost * 1.15);
  }
  return { level, into: remaining, needed: cost };
}
