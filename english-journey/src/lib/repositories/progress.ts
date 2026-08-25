import { COLLECTIONS, getStore } from "@/lib/db";
import { emptySkillScores } from "@/lib/learning/levels";
import type { DailyStat, Streak, UserProgress } from "@/types";

type ProgressRow = UserProgress & { id: string };
type StreakRow = Streak & { id: string };

export function defaultProgress(userId: string): UserProgress {
  return {
    userId,
    xpTotal: 0,
    xpByWeek: {},
    level: "elementary",
    levelProgress: 0,
    challengeLevel: 1,
    skills: emptySkillScores(),
    totalMinutes: 0,
    daysPracticed: 0,
    sessionsCompleted: 0,
    wordsMastered: 0,
    wordsLearning: 0,
    listeningMinutes: 0,
    speakingSessions: 0,
    pronunciationScore: 0,
    daily: [],
    weeklyGoalDays: 5,
  };
}

export function defaultStreak(userId: string): Streak {
  return { userId, current: 0, longest: 0, lastPracticeDate: null, history: [] };
}

export async function getProgress(userId: string): Promise<UserProgress> {
  const row = await getStore().get<ProgressRow>(COLLECTIONS.progress, userId);
  if (row) {
    const { id: _id, ...progress } = row;
    return progress;
  }
  const created = defaultProgress(userId);
  await saveProgress(created);
  return created;
}

export async function saveProgress(progress: UserProgress): Promise<UserProgress> {
  await getStore().upsert<ProgressRow>(COLLECTIONS.progress, { ...progress, id: progress.userId });
  return progress;
}

export async function getStreak(userId: string): Promise<Streak> {
  const row = await getStore().get<StreakRow>(COLLECTIONS.streaks, userId);
  if (row) {
    const { id: _id, ...streak } = row;
    return streak;
  }
  const created = defaultStreak(userId);
  await saveStreak(created);
  return created;
}

export async function saveStreak(streak: Streak): Promise<Streak> {
  await getStore().upsert<StreakRow>(COLLECTIONS.streaks, { ...streak, id: streak.userId });
  return streak;
}

export function upsertDailyStat(daily: DailyStat[], stat: DailyStat): DailyStat[] {
  const index = daily.findIndex((d) => d.date === stat.date);
  if (index === -1) return [...daily, stat].sort((a, b) => a.date.localeCompare(b.date));
  const existing = daily[index]!;
  const merged: DailyStat = {
    date: stat.date,
    minutes: existing.minutes + stat.minutes,
    xp: existing.xp + stat.xp,
    sessions: existing.sessions + stat.sessions,
    wordsLearned: existing.wordsLearned + stat.wordsLearned,
    listeningMinutes: existing.listeningMinutes + stat.listeningMinutes,
    speakingSessions: existing.speakingSessions + stat.speakingSessions,
    // Accuracy is a mean across the day's sessions, not a sum.
    accuracy: Math.round(
      (existing.accuracy * existing.sessions + stat.accuracy * stat.sessions) /
        Math.max(existing.sessions + stat.sessions, 1),
    ),
  };
  const next = [...daily];
  next[index] = merged;
  return next;
}
