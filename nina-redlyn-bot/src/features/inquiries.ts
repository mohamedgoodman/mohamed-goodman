import { Composer } from "grammy";
import type { Context } from "grammy";
import { config, isAdmin } from "../config.js";
import {
  inquiryByAdminMessage,
  markInquiryAnswered,
  saveInquiry,
  upsertSubscriber,
} from "../db.js";
import { escapeHtml, toHtml } from "../lib/format.js";

export const inquiries = new Composer<Context>();

/**
 * An admin replying to a forwarded copy answers the person who wrote it.
 * This must be checked before the generic member handler below.
 */
inquiries.on("message", async (ctx, next) => {
  if (ctx.chat.type !== "private") return next();
  if (!isAdmin(ctx.from?.id)) return next();

  const replyTo = ctx.message.reply_to_message;
  if (!replyTo) return next();

  const inquiry = await inquiryByAdminMessage(ctx.chat.id, replyTo.message_id);
  if (!inquiry) return next();

  const text = ctx.message.text ?? ctx.message.caption ?? "";
  try {
    await ctx.api.sendMessage(
      inquiry.user_id,
      `<b>Nina Redlyn</b>\n\n${toHtml(text, ctx.message.entities ?? ctx.message.caption_entities ?? [])}`,
      { parse_mode: "HTML" },
    );
    await markInquiryAnswered(inquiry.id);
    await ctx.reply("Sent.");
  } catch {
    await ctx.reply("Could not deliver — they have probably blocked the bot.");
  }
});

/** Anything else a member writes in private becomes an inquiry. */
inquiries.on("message", async (ctx, next) => {
  if (ctx.chat.type !== "private") return next();
  if (isAdmin(ctx.from?.id)) return next();

  const from = ctx.from;
  if (!from) return next();

  const text = ctx.message.text ?? ctx.message.caption ?? "(media, no text)";

  await upsertSubscriber({
    user_id: from.id,
    username: from.username,
    first_name: from.first_name,
    last_name: from.last_name,
    language: from.language_code,
  });

  const handle = from.username ? `@${from.username}` : `id ${from.id}`;
  const header =
    `<b>New message</b>\n` +
    `From: ${escapeHtml(from.first_name ?? "")} (${escapeHtml(handle)})\n` +
    `<i>Reply to this message to answer them directly.</i>\n\n`;

  for (const adminId of config().ADMIN_IDS) {
    try {
      const forwarded = await ctx.api.sendMessage(
        adminId,
        header +
          toHtml(
            text,
            ctx.message.entities ?? ctx.message.caption_entities ?? [],
          ),
        { parse_mode: "HTML" },
      );
      await saveInquiry({
        user_id: from.id,
        username: from.username,
        body: text,
        admin_chat_id: adminId,
        admin_msg_id: forwarded.message_id,
      });
    } catch {
      // An admin who has not started the bot cannot be messaged — skip them.
    }
  }

  await ctx.reply(
    "Got it — your message is with the team. You will get an answer right here.",
  );
});
