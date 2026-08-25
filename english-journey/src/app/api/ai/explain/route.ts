import { z } from "zod";
import { getAIProvider } from "@/lib/ai";
import { getProfile } from "@/lib/repositories/profiles";
import { error, json, readJson, withUser } from "@/lib/api";

const schema = z.object({ question: z.string().min(3).max(500) });

/** Ask the coach a grammar/usage question. Server-side only — the key never ships. */
export async function POST(request: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await readJson<unknown>(request));
    if (!parsed.success) return error("Ask a slightly longer question.", 422);

    const profile = await getProfile(user.id);
    const provider = getAIProvider();
    const answer = await provider.explainGrammar({
      question: parsed.data.question,
      level: profile.level,
      goal: profile.goal,
    });
    return json({ answer, provider: provider.name, live: provider.live });
  });
}
