import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser, toPublicUser } from "@/lib/auth/session";
import type { PublicUser } from "@/types";

export function json<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Run a handler with the signed-in user, or return 401. */
export async function withUser(
  handler: (user: PublicUser) => Promise<NextResponse>,
): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) return error("Not signed in.", 401);
  try {
    return await handler(toPublicUser(user));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return error(message, 500);
  }
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
