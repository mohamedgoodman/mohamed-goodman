import { randomUUID } from "node:crypto";
import { COLLECTIONS, getStore } from "@/lib/db";
import { addDays, todayISO } from "@/lib/learning/dates";
import type { ReviewItem, ReviewItemKind } from "@/types";

export async function listReviewItems(userId: string): Promise<ReviewItem[]> {
  const rows = await getStore().find<ReviewItem>(COLLECTIONS.reviewItems, (r) => r.userId === userId);
  return rows.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

export async function dueReviewItems(userId: string, on = todayISO()): Promise<ReviewItem[]> {
  const items = await listReviewItems(userId);
  return items.filter((item) => !item.resolved && item.dueAt <= on);
}

/**
 * Log a mistake. Repeating the same mistake shortens the interval, so the
 * things you keep getting wrong come back fastest.
 */
export async function recordMistake(params: {
  userId: string;
  kind: ReviewItemKind;
  refId: string;
  label: string;
  detail: string;
}): Promise<ReviewItem> {
  const store = getStore();
  const existing = await store.findOne<ReviewItem>(
    COLLECTIONS.reviewItems,
    (r) => r.userId === params.userId && r.kind === params.kind && r.refId === params.refId,
  );
  const today = todayISO();

  if (existing) {
    const misses = existing.misses + 1;
    const updated: ReviewItem = {
      ...existing,
      misses,
      resolved: false,
      detail: params.detail || existing.detail,
      dueAt: addDays(today, misses >= 3 ? 1 : 2),
      lastSeenAt: today,
    };
    await store.upsert<ReviewItem>(COLLECTIONS.reviewItems, updated);
    return updated;
  }

  const item: ReviewItem = {
    id: randomUUID(),
    userId: params.userId,
    kind: params.kind,
    refId: params.refId,
    label: params.label,
    detail: params.detail,
    misses: 1,
    hits: 0,
    dueAt: addDays(today, 1),
    createdAt: today,
    lastSeenAt: today,
    resolved: false,
  };
  await store.insert<ReviewItem>(COLLECTIONS.reviewItems, item);
  return item;
}

/** A correct answer pushes the item further out; two in a row resolves it. */
export async function recordReviewSuccess(userId: string, itemId: string): Promise<ReviewItem | null> {
  const store = getStore();
  const item = await store.get<ReviewItem>(COLLECTIONS.reviewItems, itemId);
  if (!item || item.userId !== userId) return null;
  const hits = item.hits + 1;
  const today = todayISO();
  const updated: ReviewItem = {
    ...item,
    hits,
    resolved: hits >= 2,
    lastSeenAt: today,
    dueAt: addDays(today, hits >= 2 ? 21 : 4),
  };
  await store.upsert<ReviewItem>(COLLECTIONS.reviewItems, updated);
  return updated;
}

export async function recordReviewFailure(userId: string, itemId: string): Promise<ReviewItem | null> {
  const store = getStore();
  const item = await store.get<ReviewItem>(COLLECTIONS.reviewItems, itemId);
  if (!item || item.userId !== userId) return null;
  const today = todayISO();
  const updated: ReviewItem = {
    ...item,
    misses: item.misses + 1,
    hits: 0,
    resolved: false,
    lastSeenAt: today,
    dueAt: addDays(today, 1),
  };
  await store.upsert<ReviewItem>(COLLECTIONS.reviewItems, updated);
  return updated;
}
