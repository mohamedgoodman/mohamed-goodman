import { listSessions } from "@/lib/repositories/sessions";
import { getProgress, getStreak } from "@/lib/repositories/progress";
import { json, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return withUser(async (user) => {
    const [progress, streak, sessions] = await Promise.all([
      getProgress(user.id),
      getStreak(user.id),
      listSessions(user.id),
    ]);
    return json({
      progress,
      streak,
      sessions: sessions.slice(0, 60).map((s) => ({
        id: s.id,
        date: s.date,
        score: s.score,
        xpEarned: s.xpEarned,
        minutes: s.totalMinutes,
        status: s.status,
        challengeLevel: s.challengeLevel,
      })),
    });
  });
}
