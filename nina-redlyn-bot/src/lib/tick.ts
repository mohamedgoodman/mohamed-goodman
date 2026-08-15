import { GrammyError, type Bot } from "grammy";
import type { Context } from "grammy";
import { config } from "../config.js";
import {
  deactivateSubscriber,
  duePosts,
  runningBroadcast,
  subscriberPage,
  updateBroadcast,
  updatePost,
} from "../db.js";
import { buildKeyboard } from "./keyboard.js";
import { sendComposed } from "./publish.js";

/** Telegram tolerates roughly 30 messages a second to distinct chats. */
const BROADCAST_BATCH = 100;
const SEND_INTERVAL_MS = 40;
const MAX_PUBLISH_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type TickResult = {
  published: { ok: number; failed: number };
  broadcast: { id: number; sent: number; failed: number; done: boolean } | null;
};

/**
 * The heartbeat: publishes posts whose time has come, then pushes one batch of
 * any running broadcast. Both are resumable, so a tick that runs out of time
 * simply picks up where it left off on the next one.
 */
export async function tick(
  bot: Bot<Context>,
  budgetMs: number,
): Promise<TickResult> {
  const startedAt = Date.now();
  return {
    published: await publishDuePosts(bot),
    broadcast: await drainBroadcast(bot, startedAt, budgetMs),
  };
}

async function notifyAdmins(bot: Bot<Context>, text: string): Promise<void> {
  for (const adminId of config().ADMIN_IDS) {
    await bot.api.sendMessage(adminId, text).catch(() => {});
  }
}

async function publishDuePosts(
  bot: Bot<Context>,
): Promise<{ ok: number; failed: number }> {
  const posts = await duePosts(10);
  let ok = 0;
  let failed = 0;

  for (const post of posts) {
    // Claim the row first so an overlapping tick cannot publish it twice:
    // `duePosts` only ever returns rows still marked `scheduled`.
    await updatePost(post.id, { status: "draft", attempts: post.attempts + 1 });

    try {
      const sent = await sendComposed(bot.api, config().CHANNEL_ID, {
        body_html: post.body_html,
        media_type: post.media_type,
        media_file_id: post.media_file_id,
        buttons: post.buttons,
      });
      await updatePost(post.id, {
        status: "published",
        published_at: new Date().toISOString(),
        message_id: sent.message_id,
        error: null,
      });
      ok += 1;
    } catch (error) {
      failed += 1;
      const reason = error instanceof Error ? error.message : String(error);
      const exhausted = post.attempts + 1 >= MAX_PUBLISH_ATTEMPTS;
      await updatePost(post.id, {
        status: exhausted ? "failed" : "scheduled",
        error: reason,
      });
      if (exhausted) {
        await notifyAdmins(
          bot,
          `Post #${post.id} could not be published after ` +
            `${MAX_PUBLISH_ATTEMPTS} tries:\n${reason}`,
        );
      }
    }
  }

  return { ok, failed };
}

async function drainBroadcast(
  bot: Bot<Context>,
  startedAt: number,
  budgetMs: number,
): Promise<TickResult["broadcast"]> {
  const job = await runningBroadcast();
  if (!job) return null;

  const recipients = await subscriberPage(job.cursor_id, BROADCAST_BATCH);
  if (recipients.length === 0) {
    await updateBroadcast(job.id, {
      status: "done",
      finished_at: new Date().toISOString(),
    });
    await notifyAdmins(
      bot,
      `Broadcast #${job.id} finished — ${job.sent_count} delivered, ` +
        `${job.failed_count} undeliverable.`,
    );
    return { id: job.id, sent: 0, failed: 0, done: true };
  }

  const reply_markup = buildKeyboard(job.buttons);
  let sent = 0;
  let failed = 0;
  let cursor = job.cursor_id;

  for (const userId of recipients) {
    if (Date.now() - startedAt > budgetMs) break;

    try {
      await bot.api.sendMessage(userId, job.body_html, {
        parse_mode: "HTML",
        reply_markup,
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      // 403 means blocked or deleted — stop spending attempts on them.
      if (error instanceof GrammyError && error.error_code === 403) {
        await deactivateSubscriber(userId).catch(() => {});
      }
    }
    cursor = userId;
    await sleep(SEND_INTERVAL_MS);
  }

  await updateBroadcast(job.id, {
    cursor_id: cursor,
    sent_count: job.sent_count + sent,
    failed_count: job.failed_count + failed,
  });

  return { id: job.id, sent, failed, done: false };
}
