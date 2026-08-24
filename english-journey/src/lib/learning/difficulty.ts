import type { ChallengeLevel, LevelId, ListeningTier, SkillScores } from "@/types";
import { levelDown, levelUp } from "./levels";

/**
 * Progressive difficulty.
 *
 * The rule the product is built on: never leave the learner parked in easy
 * content. Two strong sessions push the challenge level up; two weak ones pull
 * it back and trigger targeted practice instead of a blanket downgrade.
 */

export interface DifficultyInput {
  challengeLevel: ChallengeLevel;
  level: LevelId;
  /** Most recent session scores, newest first (0–100). */
  recentScores: number[];
  skills: SkillScores;
  sessionsCompleted: number;
}

export interface DifficultyDecision {
  challengeLevel: ChallengeLevel;
  level: LevelId;
  direction: "up" | "down" | "same";
  levelChanged: boolean;
  reason: string;
  /** Skills that need targeted work before difficulty rises again. */
  targetSkills: string[];
}

const UP_THRESHOLD = 85;
const DOWN_THRESHOLD = 55;

export function decideDifficulty(input: DifficultyInput): DifficultyDecision {
  const { challengeLevel, level, recentScores, skills, sessionsCompleted } = input;
  const [latest, previous] = recentScores;
  const weakSkills = Object.entries(skills)
    .filter(([, score]) => score > 0 && score < 65)
    .sort((a, b) => a[1] - b[1])
    .map(([skill]) => skill);

  if (latest === undefined) {
    return {
      challengeLevel,
      level,
      direction: "same",
      levelChanged: false,
      reason: "No sessions scored yet.",
      targetSkills: weakSkills,
    };
  }

  const strongRun = latest >= UP_THRESHOLD && (previous ?? 0) >= UP_THRESHOLD;
  const weakRun = latest < DOWN_THRESHOLD && (previous ?? 100) < DOWN_THRESHOLD;

  if (strongRun && challengeLevel < 5) {
    const nextChallenge = (challengeLevel + 1) as ChallengeLevel;
    // The CEFR-ish level only moves after sustained work at a high challenge.
    const shouldLevelUp = nextChallenge >= 4 && sessionsCompleted >= 12 && averageSkill(skills) >= 80;
    return {
      challengeLevel: nextChallenge,
      level: shouldLevelUp ? levelUp(level) : level,
      direction: "up",
      levelChanged: shouldLevelUp,
      reason: "Two strong sessions in a row — the content is now too easy for you.",
      targetSkills: weakSkills,
    };
  }

  if (weakRun && challengeLevel > 1) {
    const nextChallenge = (challengeLevel - 1) as ChallengeLevel;
    const shouldLevelDown = nextChallenge <= 2 && averageSkill(skills) < 45 && sessionsCompleted >= 8;
    return {
      challengeLevel: nextChallenge,
      level: shouldLevelDown ? levelDown(level) : level,
      direction: "down",
      levelChanged: shouldLevelDown,
      reason: "Two hard sessions — we'll rebuild at a slightly lower speed and target your weak points.",
      targetSkills: weakSkills,
    };
  }

  return {
    challengeLevel,
    level,
    direction: "same",
    levelChanged: false,
    reason:
      latest >= UP_THRESHOLD
        ? "Strong session. One more like that and the difficulty goes up."
        : "Difficulty is about right — keep going.",
    targetSkills: weakSkills,
  };
}

export function averageSkill(skills: SkillScores): number {
  const values = Object.values(skills);
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Map the visible challenge level onto the listening ladder. */
export function tierForChallenge(challengeLevel: ChallengeLevel): ListeningTier {
  switch (challengeLevel) {
    case 1:
      return "easy";
    case 2:
      return "normal";
    case 3:
      return "normal";
    case 4:
      return "challenging";
    default:
      return "native";
  }
}

/** The tier used for the deliberately-harder "Challenge" block. */
export function stretchTier(challengeLevel: ChallengeLevel): ListeningTier {
  const ladder: ListeningTier[] = ["easy", "normal", "challenging", "native"];
  const current = ladder.indexOf(tierForChallenge(challengeLevel));
  return ladder[Math.min(current + 1, ladder.length - 1)] ?? "native";
}

/** Playback-rate multiplier applied on top of each line's own rate. */
export function speedForChallenge(challengeLevel: ChallengeLevel): number {
  return [0.85, 0.95, 1, 1.08, 1.15][challengeLevel - 1] ?? 1;
}
