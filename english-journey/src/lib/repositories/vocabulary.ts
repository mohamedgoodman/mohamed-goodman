import { COLLECTIONS, getStore } from "@/lib/db";
import { newProgress, review } from "@/lib/learning/srs";
import type { VocabularyProgress } from "@/types";

type Row = VocabularyProgress & { id: string };

const rowId = (userId: string, wordId: string) => `${userId}:${wordId}`;

export async function listVocabularyProgress(userId: string): Promise<VocabularyProgress[]> {
  const rows = await getStore().find<Row>(COLLECTIONS.vocabularyProgress, (r) => r.userId === userId);
  return rows.map(({ id: _id, ...rest }) => rest);
}

export async function getWordProgress(
  userId: string,
  wordId: string,
): Promise<VocabularyProgress | null> {
  const row = await getStore().get<Row>(COLLECTIONS.vocabularyProgress, rowId(userId, wordId));
  if (!row) return null;
  const { id: _id, ...rest } = row;
  return rest;
}

export async function saveWordProgress(progress: VocabularyProgress): Promise<VocabularyProgress> {
  await getStore().upsert<Row>(COLLECTIONS.vocabularyProgress, {
    ...progress,
    id: rowId(progress.userId, progress.wordId),
  });
  return progress;
}

/** Record one answer against a word and advance its spaced-repetition state. */
export async function recordVocabularyAnswer(
  userId: string,
  wordId: string,
  quality: 0 | 1 | 2 | 3,
): Promise<VocabularyProgress> {
  const current = (await getWordProgress(userId, wordId)) ?? newProgress(userId, wordId);
  return saveWordProgress(review(current, quality));
}
