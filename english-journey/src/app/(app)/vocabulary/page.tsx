import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VocabularyView } from "@/components/features/vocabulary-view";
import { VOCABULARY } from "@/content";
import { getCurrentUser } from "@/lib/auth/session";
import { listVocabularyProgress } from "@/lib/repositories/vocabulary";

export const metadata: Metadata = { title: "Vocabulary" };
export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const progress = await listVocabularyProgress(user.id);
  return <VocabularyView initialData={{ words: VOCABULARY, progress }} />;
}
