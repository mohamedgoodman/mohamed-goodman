import { listReviewItems } from "@/lib/repositories/review";
import { listVocabularyProgress } from "@/lib/repositories/vocabulary";
import { json, withUser } from "@/lib/api";
import { todayISO } from "@/lib/learning/dates";

export const dynamic = "force-dynamic";

export async function GET() {
  return withUser(async (user) => {
    const [items, vocabulary] = await Promise.all([
      listReviewItems(user.id),
      listVocabularyProgress(user.id),
    ]);
    return json({ items, vocabulary, today: todayISO() });
  });
}
