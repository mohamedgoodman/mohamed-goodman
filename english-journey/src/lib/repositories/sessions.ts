import { COLLECTIONS, getStore } from "@/lib/db";
import type { DailySession } from "@/types";

export async function getSessionById(id: string): Promise<DailySession | null> {
  return getStore().get<DailySession>(COLLECTIONS.sessions, id);
}

export async function getSessionForDate(userId: string, date: string): Promise<DailySession | null> {
  return getStore().findOne<DailySession>(
    COLLECTIONS.sessions,
    (s) => s.userId === userId && s.date === date,
  );
}

export async function listSessions(userId: string): Promise<DailySession[]> {
  const rows = await getStore().find<DailySession>(COLLECTIONS.sessions, (s) => s.userId === userId);
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveSession(session: DailySession): Promise<DailySession> {
  return getStore().upsert<DailySession>(COLLECTIONS.sessions, session);
}

/** Content ids used in the last `days` sessions, so the planner avoids repeats. */
export async function recentRefIds(userId: string, days = 5): Promise<string[]> {
  const sessions = (await listSessions(userId)).slice(0, days);
  const ids = new Set<string>();
  for (const session of sessions) {
    for (const block of session.blocks) {
      for (const exercise of block.exercises) {
        if (exercise.refId) ids.add(exercise.refId);
      }
    }
  }
  return [...ids];
}
