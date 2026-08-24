import { startSession } from "@/lib/services/learning-service";
import { json, withUser } from "@/lib/api";

export async function POST() {
  return withUser(async (user) => json(await startSession(user.id)));
}
