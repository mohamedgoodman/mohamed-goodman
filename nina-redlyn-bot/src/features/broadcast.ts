import { Composer } from "grammy";
import type { Context } from "grammy";
import { isAdmin } from "../config.js";
import {
  clearState,
  countSubscribers,
  createBroadcast,
  getState,
  runningBroadcast,
  setState,
  updateBroadcast,
} from "../db.js";

export const broadcast = new Composer<Context>();

broadcast.command("broadcast", async (ctx) => {
  if (!isAdmin(ctx.from?.id) || ctx.chat?.type !== "private") return;

  const inFlight = await runningBroadcast();
  if (inFlight) {
    await ctx.reply(
      `A broadcast is already going out (#${inFlight.id}, ` +
        `${inFlight.sent_count} sent). Wait for it, or /stopbroadcast.`,
    );
    return;
  }

  const audience = await countSubscribers();
  if (audience === 0) {
    await ctx.reply(
      "Nobody to broadcast to yet. Only people who have opened a private " +
        "chat with the bot can be messaged — Telegram does not allow " +
        "reaching channel members directly.",
    );
    return;
  }

  await setState(ctx.from!.id, "broadcast:content", {});
  await ctx.reply(
    `Write the message. It goes to <b>${audience}</b> subscriber(s) in their ` +
      "private chat with the bot.\n\n<i>/cancel to stop.</i>",
    { parse_mode: "HTML" },
  );
});

broadcast.callbackQuery("bc:send", async (ctx) => {
  const userId = ctx.from.id;
  if (!isAdmin(userId)) return ctx.answerCallbackQuery("Not for you.");

  const state = await getState(userId);
  if (!state || state.step !== "broadcast:confirm") {
    return ctx.answerCallbackQuery("This draft is no longer open.");
  }

  await ctx.answerCallbackQuery("Queued.");
  await ctx.editMessageReplyMarkup({ reply_markup: undefined });

  const job = await createBroadcast({
    author_id: userId,
    body_html: state.data.body_html ?? "",
    buttons: state.data.buttons ?? [],
  });
  await clearState(userId);

  await ctx.reply(
    `Broadcast #${job.id} queued. It is delivered in batches to stay inside ` +
      "Telegram's rate limits — /stats shows progress.",
  );
});

broadcast.command("stopbroadcast", async (ctx) => {
  if (!isAdmin(ctx.from?.id)) return;
  const job = await runningBroadcast();
  if (!job) {
    await ctx.reply("No broadcast is running.");
    return;
  }
  await updateBroadcast(job.id, {
    status: "cancelled",
    finished_at: new Date().toISOString(),
  });
  await ctx.reply(
    `Broadcast #${job.id} stopped after ${job.sent_count} message(s). ` +
      "Messages already delivered cannot be recalled.",
  );
});
