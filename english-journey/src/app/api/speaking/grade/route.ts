import { z } from "zod";
import { SPEAKING_BY_ID } from "@/content";
import { getAIProvider } from "@/lib/ai";
import { getProfile } from "@/lib/repositories/profiles";
import { error, json, readJson, withUser } from "@/lib/api";

const schema = z.object({
  scenarioId: z.string(),
  answer: z.string().min(1).max(4000),
});

export async function POST(request: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await readJson<unknown>(request));
    if (!parsed.success) return error("Say something first.", 422);

    const scenario = SPEAKING_BY_ID.get(parsed.data.scenarioId);
    if (!scenario) return error("Unknown scenario.", 404);

    const profile = await getProfile(user.id);
    const feedback = await getAIProvider().gradeSpeaking({
      answer: parsed.data.answer,
      scenario,
      level: profile.level,
    });
    return json({ feedback });
  });
}
