import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/repositories/profiles";
import { Landing } from "@/components/marketing/landing";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    const profile = await getProfile(user.id);
    redirect(profile.onboardedAt ? "/dashboard" : "/onboarding");
  }
  return <Landing />;
}
