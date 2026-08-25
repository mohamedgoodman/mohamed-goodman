import { z } from "zod";
import { patchProfile } from "@/lib/repositories/profiles";
import { saveProgress, getProgress } from "@/lib/repositories/progress";
import { error, json, readJson, withUser } from "@/lib/api";
import { DAILY_MINUTES, DESTINATIONS, LEARNING_GOALS, LEVELS } from "@/types";
import type { ChallengeLevel, LevelId } from "@/types";

const schema = z.object({
  goal: z.enum(LEARNING_GOALS),
  selfReportedLevel: z.enum([...LEVELS, "unknown"]),
  dailyMinutes: z.union(DAILY_MINUTES.map((m) => z.literal(m)) as [z.ZodLiteral<10>, z.ZodLiteral<20>, z.ZodLiteral<30>, z.ZodLiteral<45>, z.ZodLiteral<60>]),
  destination: z.enum(DESTINATIONS).nullable().optional(),
  /** Optional placement quiz result (0–100) when the level is unknown. */
  placementScore: z.number().min(0).max(100).nullable().optional(),
});

/** Map the onboarding answers onto a starting level and challenge level. */
function startingLevel(selfReported: string, placementScore: number | null): LevelId {
  if (selfReported !== "unknown") return selfReported as LevelId;
  if (placementScore === null) return "elementary";
  if (placementScore >= 85) return "advanced";
  if (placementScore >= 70) return "upper-intermediate";
  if (placementScore >= 50) return "intermediate";
  if (placementScore >= 30) return "elementary";
  return "beginner";
}

function startingChallenge(level: LevelId): ChallengeLevel {
  const map: Record<LevelId, ChallengeLevel> = {
    beginner: 1,
    elementary: 1,
    intermediate: 2,
    "upper-intermediate": 3,
    advanced: 4,
  };
  return map[level];
}

export async function POST(request: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await readJson<unknown>(request));
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid answers.", 422);

    const placementScore = parsed.data.placementScore ?? null;
    const level = startingLevel(parsed.data.selfReportedLevel, placementScore);
    const challengeLevel = startingChallenge(level);

    const profile = await patchProfile(user.id, {
      goal: parsed.data.goal,
      selfReportedLevel: parsed.data.selfReportedLevel,
      level,
      challengeLevel,
      dailyMinutes: parsed.data.dailyMinutes,
      destination: parsed.data.destination ?? null,
      placementScore,
      onboardedAt: new Date().toISOString(),
    });

    const progress = await getProgress(user.id);
    await saveProgress({ ...progress, level, challengeLevel });

    return json({ profile });
  });
}
