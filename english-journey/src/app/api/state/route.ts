import { buildAppState } from "@/lib/services/learning-service";
import { json, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return withUser(async (user) => json(await buildAppState(user)));
}
