import { redirect } from "next/navigation";
import { AppStateProvider } from "@/components/app-state-provider";
import { AppShell } from "@/components/shell/app-shell";
import { getCurrentUser, toPublicUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/repositories/profiles";
import { buildAppState } from "@/lib/services/learning-service";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile.onboardedAt) redirect("/onboarding");

  const state = await buildAppState(toPublicUser(user));
  return (
    <AppStateProvider initialState={state}>
      <AppShell>{children}</AppShell>
    </AppStateProvider>
  );
}
