import { z } from "zod";
import { VOCABULARY_BY_ID } from "@/content";
import { recordVocabularyAnswer } from "@/lib/repositories/vocabulary";
import { recordMistake } from "@/lib/repositories/review";
import { error, json, readJson, withUser } from "@/lib/api";

const schema = z.object({
  wordId: z.string(),
  quality: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
});

export async function POST(request: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await readJson<unknown>(request));
    if (!parsed.success) return error("Invalid answer.", 422);

    const word = VOCABULARY_BY_ID.get(parsed.data.wordId);
    if (!word) return error("Unknown word.", 404);

    const progress = await recordVocabularyAnswer(user.id, word.id, parsed.data.quality);
    if (parsed.data.quality === 0) {
      await recordMistake({
        userId: user.id,
        kind: "vocabulary",
        refId: word.id,
        label: word.term,
        detail: word.definition,
      });
    }
    return json({ progress });
  });
}
