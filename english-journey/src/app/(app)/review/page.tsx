import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReviewView } from "@/components/features/review-view";
import { getCurrentUser } from "@/lib/auth/session";
import { todayISO } from "@/lib/learning/dates";
import { listReviewItems } from "@/lib/repositories/review";
import { listVocabularyProgress } from "@/lib/repositories/vocabulary";

export const metadata: Metadata = { title: "Review" };
export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const [items, vocabulary] = await Promise.all([
    listReviewItems(user.id),
    listVocabularyProgress(user.id),
  ]);
  return <ReviewView initialData={{ items, vocabulary, today: todayISO() }} />;
}
