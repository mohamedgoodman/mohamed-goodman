import type { MasteryStage, VocabularyProgress } from "@/types";
import { addDays, todayISO } from "./dates";

/**
 * Spaced repetition, SM-2 with the sharp edges filed off.
 *
 * Words answered wrong come back tomorrow and lose ease, so they surface far
 * more often. Words answered well stretch out geometrically until they're
 * effectively out of rotation.
 */

export const INITIAL_EASE = 2.5;
const MIN_EASE = 1.3;

export function newProgress(userId: string, wordId: string): VocabularyProgress {
  return {
    userId,
    wordId,
    stage: "new",
    ease: INITIAL_EASE,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    dueAt: todayISO(),
    lastReviewedAt: null,
    correct: 0,
    incorrect: 0,
  };
}

/** quality: 0 = forgotten, 1 = hard, 2 = good, 3 = easy. */
export function review(progress: VocabularyProgress, quality: 0 | 1 | 2 | 3): VocabularyProgress {
  const today = todayISO();
  const next: VocabularyProgress = { ...progress, lastReviewedAt: today };

  if (quality === 0) {
    next.repetitions = 0;
    next.lapses += 1;
    next.incorrect += 1;
    next.ease = Math.max(MIN_EASE, next.ease - 0.25);
    next.intervalDays = 1;
    next.stage = next.lapses >= 2 ? "forgotten" : "learning";
  } else {
    next.correct += 1;
    next.repetitions += 1;
    next.ease = clamp(next.ease + (quality === 3 ? 0.1 : quality === 2 ? 0 : -0.12), MIN_EASE, 3.2);
    next.intervalDays =
      next.repetitions === 1 ? 1 : next.repetitions === 2 ? 3 : Math.round(next.intervalDays * next.ease);
    next.stage = stageFor(next);
  }

  next.intervalDays = Math.min(next.intervalDays, 180);
  next.dueAt = addDays(today, Math.max(next.intervalDays, 1));
  return next;
}

function stageFor(p: VocabularyProgress): MasteryStage {
  if (p.repetitions >= 5 && p.intervalDays >= 21 && p.ease >= 2.3) return "mastered";
  if (p.repetitions >= 2) return "familiar";
  return "learning";
}

export function isDue(progress: VocabularyProgress, on: string = todayISO()): boolean {
  return progress.dueAt <= on;
}

/**
 * Order a due queue so the weakest items come first: forgotten before
 * learning, low ease before high, oldest due date before newest.
 */
export function sortByUrgency(items: VocabularyProgress[]): VocabularyProgress[] {
  const stageWeight: Record<MasteryStage, number> = {
    forgotten: 0,
    learning: 1,
    new: 2,
    familiar: 3,
    mastered: 4,
  };
  return [...items].sort(
    (a, b) =>
      stageWeight[a.stage] - stageWeight[b.stage] ||
      a.ease - b.ease ||
      a.dueAt.localeCompare(b.dueAt),
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
