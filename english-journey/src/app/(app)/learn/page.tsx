import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { startSession } from "@/lib/services/learning-service";
import { LearnView } from "@/components/practice/learn-view";

export const metadata: Metadata = { title: "Today's practice" };
export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Marks the session in-progress the first time the learner opens it.
  const session = await startSession(user.id);
  return <LearnView session={session} />;
}
