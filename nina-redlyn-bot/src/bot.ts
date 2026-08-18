import { Bot, GrammyError, HttpError } from "grammy";
import type { Context } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { config, publishingEnabled } from "./config.js";
import { broadcast } from "./features/broadcast.js";
import { compose } from "./features/compose.js";
import { inquiries } from "./features/inquiries.js";
import { moderation } from "./features/moderation.js";
import { schedule } from "./features/schedule.js";
import { start } from "./features/start.js";

let instance: Bot<Context> | undefined;

/**
 * Built once per warm serverless instance. `bot.init()` is awaited by the
 * caller before handling an update, because grammY needs the bot's own
 * identity and there is no long-running startup phase here.
 */
export function createBot(): Bot<Context> {
  if (instance) return instance;

  const bot = new Bot<Context>(config().BOT_TOKEN);

  // Retries 429s with the delay Telegram asks for, and 5xx a few times.
  bot.api.config.use(autoRetry({ maxRetryAttempts: 3, maxDelaySeconds: 10 }));

  // Order matters: group moderation first, then admin tooling, and the
  // inquiry catch-all last so it only sees what nothing else claimed.
  bot.use(moderation);
  bot.use(start);
  bot.use(compose);
  bot.use(schedule);
  bot.use(broadcast);
  bot.use(inquiries);

  bot.catch((err) => {
    const context = `update ${err.ctx.update.update_id}`;
    if (err.error instanceof GrammyError) {
      console.error(`${context}: Telegram said ${err.error.description}`);
    } else if (err.error instanceof HttpError) {
      console.error(`${context}: could not reach Telegram —`, err.error);
    } else {
      console.error(`${context}:`, err.error);
    }
  });

  instance = bot;
  return bot;
}

/** The command list shown in Telegram's menu. */
export const MEMBER_COMMANDS = [
  { command: "start", description: "Join and see what this bot does" },
  { command: "help", description: "How to reach the team" },
];

const PUBLISHING_COMMANDS = [
  { command: "post", description: "Compose a post for the channel" },
  { command: "scheduled", description: "See and cancel queued posts" },
];

const ALWAYS_ON_COMMANDS = [
  { command: "broadcast", description: "Message every subscriber" },
  { command: "stats", description: "Subscribers and reach" },
  { command: "cancel", description: "Abandon the current draft" },
];

/**
 * A deployment with no channel configured must not offer /post — a menu entry
 * that always answers "publishing is switched off" is worse than no entry.
 */
export function adminCommands() {
  return publishingEnabled()
    ? [...PUBLISHING_COMMANDS, ...ALWAYS_ON_COMMANDS]
    : ALWAYS_ON_COMMANDS;
}
