import { VOCABULARY } from "@/content";
import { listVocabularyProgress } from "@/lib/repositories/vocabulary";
import { json, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return withUser(async (user) => {
    const progress = await listVocabularyProgress(user.id);
    return json({ words: VOCABULARY, progress });
  });
}
