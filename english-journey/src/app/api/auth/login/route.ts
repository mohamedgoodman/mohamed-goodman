import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/repositories/users";
import { error, json, readJson } from "@/lib/api";

const schema = z.object({ email: z.email(), password: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await readJson<unknown>(request));
  if (!parsed.success) return error("Enter your email and password.", 422);

  const user = await findUserByEmail(parsed.data.email);
  // Same message either way — don't leak which emails exist.
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return error("Email or password is incorrect.", 401);
  }

  await createSession(user.id);
  return json({ id: user.id, email: user.email, name: user.name });
}
