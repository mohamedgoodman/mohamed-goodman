import { randomUUID } from "node:crypto";
import { COLLECTIONS, getStore } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import type { User } from "@/types";

export async function findUserByEmail(email: string): Promise<User | null> {
  return getStore().findOne<User>(COLLECTIONS.users, (u) => u.email === email.toLowerCase());
}

export async function findUserById(id: string): Promise<User | null> {
  return getStore().get<User>(COLLECTIONS.users, id);
}

export async function createUser(params: {
  email: string;
  name: string;
  password: string;
  provider?: string;
}): Promise<User> {
  const user: User = {
    id: randomUUID(),
    email: params.email.toLowerCase(),
    name: params.name.trim(),
    passwordHash: await hashPassword(params.password),
    provider: params.provider ?? "password",
    createdAt: new Date().toISOString(),
  };
  return getStore().insert<User>(COLLECTIONS.users, user);
}
