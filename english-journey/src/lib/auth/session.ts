import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { COLLECTIONS, getStore } from "@/lib/db";
import type { PublicUser, User } from "@/types";

export const SESSION_COOKIE = "ej_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

interface AuthSession {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (value && value.length >= 16) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set (32+ random characters) in production.");
  }
  // Development fallback so `npm run dev` works with no .env at all.
  return "development-only-insecure-secret-key";
}

function sign(token: string): string {
  return createHmac("sha256", secret()).update(token).digest("hex");
}

function verify(token: string, signature: string): boolean {
  const expected = Buffer.from(sign(token), "hex");
  const given = Buffer.from(signature, "hex");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Create a server-side session row and set the signed cookie. */
export async function createSession(userId: string): Promise<void> {
  const store = getStore();
  const id = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + MAX_AGE_SECONDS * 1000);
  await store.insert<AuthSession>(COLLECTIONS.authSessions, {
    id,
    userId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, `${id}.${sign(id)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (raw) {
    const [id] = raw.split(".");
    if (id) await getStore().remove(COLLECTIONS.authSessions, id);
  }
  jar.delete(SESSION_COOKIE);
}

/** Resolve the signed-in user, or null. Safe to call from any server context. */
export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [id, signature] = raw.split(".");
  if (!id || !signature || !verify(id, signature)) return null;

  const store = getStore();
  const session = await store.get<AuthSession>(COLLECTIONS.authSessions, id);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await store.remove(COLLECTIONS.authSessions, id);
    return null;
  }
  return store.get<User>(COLLECTIONS.users, session.userId);
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
}
