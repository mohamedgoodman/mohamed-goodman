/**
 * Local development: runs the same bot over long polling, so no public URL or
 * tunnel is needed. An in-process timer calls the very same `tick` the cron
 * endpoint uses in production, so scheduling works locally too.
 *
 *   npm run dev
 *
 * Remember to `npm run webhook:delete` first — Telegram will not deliver
 * updates by polling while a webhook is registered.
 */
import "dotenv/config";
import { createBot } from "../src/bot.js";
import { tick } from "../src/lib/tick.js";

const bot = createBot();

const heartbeat = setInterval(() => {
  void tick(bot, 30_000).catch((error) => console.error("tick failed:", error));
}, 30_000);

void bot.start({
  drop_pending_updates: true,
  onStart: (info) => console.log(`@${info.username} is listening (polling).`),
});

const shutdown = () => {
  clearInterval(heartbeat);
  void bot.stop();
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
