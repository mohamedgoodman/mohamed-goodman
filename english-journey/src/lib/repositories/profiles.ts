import { COLLECTIONS, getStore } from "@/lib/db";
import type { UserProfile } from "@/types";

type ProfileRow = UserProfile & { id: string };

const toRow = (profile: UserProfile): ProfileRow => ({ ...profile, id: profile.userId });

export function defaultProfile(userId: string): UserProfile {
  return {
    userId,
    goal: "general",
    selfReportedLevel: "unknown",
    level: "elementary",
    dailyMinutes: 20,
    challengeLevel: 1,
    destination: null,
    onboardedAt: null,
    placementScore: null,
    theme: "system",
    reminderEnabled: true,
  };
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const row = await getStore().get<ProfileRow>(COLLECTIONS.profiles, userId);
  if (row) {
    const { id: _id, ...profile } = row;
    return profile;
  }
  const created = defaultProfile(userId);
  await getStore().upsert<ProfileRow>(COLLECTIONS.profiles, toRow(created));
  return created;
}

export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  await getStore().upsert<ProfileRow>(COLLECTIONS.profiles, toRow(profile));
  return profile;
}

export async function patchProfile(
  userId: string,
  patch: Partial<UserProfile>,
): Promise<UserProfile> {
  const current = await getProfile(userId);
  return saveProfile({ ...current, ...patch, userId });
}
