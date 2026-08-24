import { z } from "zod";
import { completeSession } from "@/lib/services/learning-service";
import { error, json, readJson, withUser } from "@/lib/api";
import { SKILLS } from "@/types";

const resultSchema = z.object({
  exerciseId: z.string(),
  blockKind: z.enum(["warmup", "listening", "context", "speaking", "pronunciation", "challenge"]),
  skill: z.enum(SKILLS),
  correct: z.boolean(),
  score: z.number().min(0).max(100),
  refId: z.string().nullable(),
  answer: z.string().max(4000).optional(),
  feedback: z.string().max(4000).optional(),
  at: z.string(),
});

const schema = z.object({
  sessionId: z.string(),
  results: z.array(resultSchema).min(1, "Complete at least one exercise."),
});

export async function POST(request: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await readJson<unknown>(request));
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid results.", 422);
    const summary = await completeSession(user.id, parsed.data.sessionId, parsed.data.results);
    return json(summary);
  });
}
