import type { IncomingMessage, ServerResponse } from "node:http";
import { createBot } from "../../src/bot.js";
import { config } from "../../src/config.js";
import { tick } from "../../src/lib/tick.js";

/** Leaves headroom under the 60-second function limit set in vercel.json. */
const TIME_BUDGET_MS = 45_000;

/**
 * Called every minute by Vercel Cron (or any external scheduler holding
 * CRON_SECRET). Publishes due posts and advances any running broadcast.
 */
export default async function handler(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  const provided =
    request.headers["authorization"] ?? request.headers["x-cron-secret"];
  const secret = config().CRON_SECRET;
  if (provided !== `Bearer ${secret}` && provided !== secret) {
    response.statusCode = 401;
    response.end("unauthorized");
    return;
  }

  const bot = createBot();
  await bot.init();
  const result = await tick(bot, TIME_BUDGET_MS);

  response.statusCode = 200;
  response.setHeader("content-type", "application/json");
  response.end(JSON.stringify(result));
}
