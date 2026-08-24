import { z } from "zod";
import { recordReviewFailure, recordReviewSuccess } from "@/lib/repositories/review";
import { recordVocabularyAnswer } from "@/lib/repositories/vocabulary";
import { VOCABULARY_BY_ID } from "@/content";
import { error, json, readJson, withUser } from "@/lib/api";

const schema = z.object({ itemId: z.string(), correct: z.boolean(), refId: z.string().optional() });

export async function POST(request: Request) {
  return withUser(async (user) => {
    const parsed = schema.safeParse(await readJson<unknown>(request));
    if (!parsed.success) return error("Invalid review answer.", 422);

    const item = parsed.data.correct
      ? await recordReviewSuccess(user.id, parsed.data.itemId)
      : await recordReviewFailure(user.id, parsed.data.itemId);
    if (!item) return error("Review item not found.", 404);

    // Keep the vocabulary schedule in sync when the item is a word.
    if (item.kind === "vocabulary" && VOCABULARY_BY_ID.has(item.refId)) {
      await recordVocabularyAnswer(user.id, item.refId, parsed.data.correct ? 2 : 0);
    }
    return json({ item });
  });
}
