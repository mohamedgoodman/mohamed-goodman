import { webhookCallback } from "grammy";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createBot } from "../src/bot.js";
import { config } from "../src/config.js";

/**
 * Telegram's webhook endpoint.
 *
 * The secret token is checked before the update is handled, so a stranger who
 * finds the URL cannot make the bot do anything.
 */
export default async function handler(
  request: IncomingMessage & { body?: unknown },
  response: ServerResponse,
): Promise<void> {
  if (request.method !== "POST") {
    response.statusCode = 200;
    response.end("Nina Redlyn bot is running.");
    return;
  }

  const secret = request.headers["x-telegram-bot-api-secret-token"];
  if (secret !== config().WEBHOOK_SECRET) {
    response.statusCode = 403;
    response.end("forbidden");
    return;
  }

  const bot = createBot();
  await bot.init();

  try {
    await webhookCallback(bot, "https")(request, response);
  } catch (error) {
    // Answer 200 regardless: a non-2xx makes Telegram redeliver the same
    // update forever, which turns one bug into an endless loop.
    console.error("webhook failed:", error);
    if (!response.writableEnded) {
      response.statusCode = 200;
      response.end("ok");
    }
  }
}
