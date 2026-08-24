import { z } from "zod";
import { patchProfile } from "@/lib/repositories/profiles";
import { error, json, readJson, withUser } from "@/lib/api";
import { DAILY_MINUTES, DESTINATIONS, LEARNING_GOALS, LEVELS } from "@/types";

const schema = z.object({
  goal: z.enum(LEARNING_GOALS).optional(),
  level: z.enum(LEVELS).optional(),
  dailyMinutes: z.union(DAILY_MINUTES.map((m) => z.literal(m)) as [z.ZodLiteral<10>, z.ZodLiteral<20>, z.ZodLiteral<30>, z.ZodLiteral<45>, z.ZodLiteral<60>]).optional(),
  destination: z.enum(DESTINATIONS).nullable().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  reminderEnabled: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await readJson<unknown>(request));
    if (!parsed.success) return error("Invalid settings.", 422);
    const profile = await patchProfile(user.id, parsed.data);
    return json({ profile });
  });
}
