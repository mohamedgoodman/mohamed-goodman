import { z } from "zod";
import { createSession } from "@/lib/auth/session";
import { createUser, findUserByEmail } from "@/lib/repositories/users";
import { defaultProfile, saveProfile } from "@/lib/repositories/profiles";
import { defaultProgress, defaultStreak, saveProgress, saveStreak } from "@/lib/repositories/progress";
import { error, json, readJson } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Please enter your name.").max(80),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(request: Request) {
  const body = await readJson<unknown>(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid details.", 422);
  }

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) return error("An account with that email already exists.", 409);

  const user = await createUser(parsed.data);
  // Give every new account its blank slate up front — no fake progress.
  await Promise.all([
    saveProfile(defaultProfile(user.id)),
    saveProgress(defaultProgress(user.id)),
    saveStreak(defaultStreak(user.id)),
  ]);
  await createSession(user.id);

  return json({ id: user.id, email: user.email, name: user.name }, 201);
}
