import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getCurrentUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/repositories/profiles";

export const metadata: Metadata = { title: "Set up your plan" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await getProfile(user.id);
  if (profile.onboardedAt) redirect("/dashboard");
  return <OnboardingWizard name={user.name} />;
}
