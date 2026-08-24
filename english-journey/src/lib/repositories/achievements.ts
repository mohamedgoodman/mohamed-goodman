import { ACHIEVEMENTS } from "@/content";
import { COLLECTIONS, getStore } from "@/lib/db";
import type { Achievement, Streak, UnlockedAchievement, UserProgress } from "@/types";

type Row = UnlockedAchievement & { id: string };

const rowId = (userId: string, achievementId: string) => `${userId}:${achievementId}`;

export async function listUnlocked(userId: string): Promise<UnlockedAchievement[]> {
  const rows = await getStore().find<Row>(COLLECTIONS.unlockedAchievements, (r) => r.userId === userId);
  return rows.map(({ id: _id, ...rest }) => rest);
}

function metricValue(
  achievement: Achievement,
  progress: UserProgress,
  streak: Streak,
): number {
  switch (achievement.metric) {
    case "streak":
      return streak.current;
    case "sessions":
      return progress.sessionsCompleted;
    case "words":
      return progress.wordsMastered;
    case "minutes":
      return progress.totalMinutes;
    case "xp":
      return progress.xpTotal;
    case "listeningMinutes":
      return progress.listeningMinutes;
    case "speakingSessions":
      return progress.speakingSessions;
    case "challengeLevel":
      return progress.challengeLevel;
  }
}

/** Evaluate every achievement and persist any newly unlocked ones. */
export async function evaluateAchievements(
  userId: string,
  progress: UserProgress,
  streak: Streak,
): Promise<Achievement[]> {
  const unlocked = new Set((await listUnlocked(userId)).map((u) => u.achievementId));
  const newly: Achievement[] = [];
  const store = getStore();

  for (const achievement of ACHIEVEMENTS) {
    if (unlocked.has(achievement.id)) continue;
    if (metricValue(achievement, progress, streak) >= achievement.threshold) {
      await store.upsert<Row>(COLLECTIONS.unlockedAchievements, {
        id: rowId(userId, achievement.id),
        userId,
        achievementId: achievement.id,
        unlockedAt: new Date().toISOString(),
      });
      newly.push(achievement);
    }
  }
  return newly;
}
