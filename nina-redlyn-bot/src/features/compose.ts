import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "grammy";
import { channelId, config, isAdmin, publishingEnabled } from "../config.js";
import {
  clearState,
  createPost,
  getState,
  setState,
  updatePost,
  type AdminState,
} from "../db.js";
import { overLimit, toHtml, withSignature } from "../lib/format.js";
import { parseButtons } from "../lib/keyboard.js";
import { extractMedia, sendComposed, type Composed } from "../lib/publish.js";
import { formatInZone, parseWhen } from "../lib/time.js";

export const compose = new Composer<Context>();

function draftToComposed(data: AdminState["data"]): Composed {
  return {
    body_html: withSignature(data.body_html ?? "", config().SIGNATURE),
    media_type: data.media_type ?? null,
    media_file_id: data.media_file_id ?? null,
    buttons: data.buttons ?? [],
  };
}

const reviewKeyboard = new InlineKeyboard()
  .text("Publish now", "post:publish")
  .text("Schedule", "post:schedule")
  .row()
  .text("Edit buttons", "post:buttons")
  .text("Start over", "post:restart")
  .row()
  .text("Discard", "post:cancel");

async function showReview(ctx: Context, data: AdminState["data"]) {
  const post = draftToComposed(data);
  const excess = overLimit(post.body_html, Boolean(post.media_file_id));

  await ctx.reply(
    "<b>Preview — this is exactly what subscribers will see:</b>",
    {
      parse_mode: "HTML",
    },
  );
  await sendComposed(ctx.api, ctx.chat!.id, post);

  const notes: string[] = [];
  if (excess > 0) {
    notes.push(
      `⚠️ ${excess} characters over Telegram's limit — trim before publishing.`,
    );
  }
  if (post.buttons.length > 0) {
    notes.push(`${post.buttons.length} button(s) attached.`);
  }
  notes.push(`Channel: <code>${channelId()}</code>`);

  await ctx.reply(notes.join("\n"), {
    parse_mode: "HTML",
    reply_markup: reviewKeyboard,
  });
  await setState(ctx.from!.id, "post:review", data);
}

// --- Entry points ----------------------------------------------------------

compose.command("post", async (ctx) => {
  if (!isAdmin(ctx.from?.id) || ctx.chat?.type !== "private") return;
  if (!publishingEnabled()) {
    await ctx.reply(
      "Publishing is switched off on this bot — no channel is configured, so " +
        "it has no rights to post anywhere.\n\nTo turn it on, set CHANNEL_ID " +
        "and make the bot an administrator of that channel.",
    );
    return;
  }
  await setState(ctx.from!.id, "post:content", {});
  await ctx.reply(
    [
      "<b>New post.</b>",
      "",
      "Send it the way you want it to look — plain text, or a photo/video with",
      "its caption. Bold, italics, links, emoji and hashtags all carry over.",
      "",
      "<i>/cancel to stop.</i>",
    ].join("\n"),
    { parse_mode: "HTML" },
  );
});

compose.command("cancel", async (ctx) => {
  if (!isAdmin(ctx.from?.id)) return;
  const state = await getState(ctx.from!.id);
  await clearState(ctx.from!.id);
  await ctx.reply(
    state ? "Cancelled. Nothing was published." : "Nothing to cancel.",
  );
});

// --- Step handlers ---------------------------------------------------------

compose.on("message", async (ctx, next) => {
  if (ctx.chat.type !== "private" || !isAdmin(ctx.from?.id)) return next();

  const state = await getState(ctx.from!.id);
  if (!state) return next();

  const userId = ctx.from!.id;
  const message = ctx.message!;
  const text = message.text ?? message.caption ?? "";
  const entities = message.entities ?? message.caption_entities ?? [];

  switch (state.step) {
    case "post:content":
    case "broadcast:content": {
      const media = extractMedia(message);
      if (!text.trim() && !media) {
        await ctx.reply("I need some text or a photo/video to work with.");
        return;
      }
      const data: AdminState["data"] = {
        body_html: toHtml(text, entities),
        buttons: [],
        ...(media
          ? { media_type: media.type, media_file_id: media.file_id }
          : {}),
      };

      if (state.step === "broadcast:content") {
        if (media) {
          await ctx.reply(
            "Broadcasts are text-only for now — send the message without media.",
          );
          return;
        }
        await setState(userId, "broadcast:confirm", data);
        await ctx.reply("<b>Preview:</b>", { parse_mode: "HTML" });
        await sendComposed(ctx.api, ctx.chat.id, {
          body_html: data.body_html!,
          buttons: [],
        });
        await ctx.reply("Send this to every subscriber?", {
          reply_markup: new InlineKeyboard()
            .text("Send it", "bc:send")
            .text("Cancel", "post:cancel"),
        });
        return;
      }

      await setState(userId, "post:buttons", data);
      await ctx.reply(
        [
          "Buttons? One per line:",
          "",
          "<code>Shop the drop - https://example.com</code>",
          "<code>Instagram - https://instagram.com/…</code>",
          "",
          "Put two on the same row with <code>|</code> between them.",
          "Send <b>/skip</b> for no buttons.",
        ].join("\n"),
        { parse_mode: "HTML" },
      );
      return;
    }

    case "post:buttons": {
      const raw = text.trim();
      if (raw === "/skip" || raw === "-") {
        await showReview(ctx, { ...state.data, buttons: [] });
        return;
      }
      const { buttons, errors } = parseButtons(raw);
      if (errors.length > 0) {
        await ctx.reply(
          `I could not read:\n${errors.map((e) => `• ${e}`).join("\n")}\n\nTry again, or /skip.`,
        );
        return;
      }
      await showReview(ctx, { ...state.data, buttons });
      return;
    }

    case "post:schedule": {
      const parsed = parseWhen(text, config().TIMEZONE);
      if (!parsed.ok) {
        await ctx.reply(
          `I could not read that time — ${parsed.reason}.\n\n` +
            "Try: <code>in 2h</code>, <code>18:30</code>, " +
            "<code>tomorrow 9:00</code> or <code>20/08 18:30</code>.",
          { parse_mode: "HTML" },
        );
        return;
      }
      const draft = draftToComposed(state.data);
      const post = await createPost({
        author_id: userId,
        status: "scheduled",
        body_html: draft.body_html,
        media_type: draft.media_type ?? undefined,
        media_file_id: draft.media_file_id ?? undefined,
        buttons: draft.buttons,
        scheduled_at: parsed.at.toISOString(),
      });
      await clearState(userId);
      await ctx.reply(
        `Scheduled for <b>${formatInZone(parsed.at, config().TIMEZONE)}</b> ` +
          `(${config().TIMEZONE}).\nPost #${post.id} — /scheduled to review or cancel.`,
        { parse_mode: "HTML" },
      );
      return;
    }

    default:
      return next();
  }
});

// --- Review actions --------------------------------------------------------

compose.callbackQuery("post:publish", async (ctx) => {
  const userId = ctx.from.id;
  if (!isAdmin(userId)) return ctx.answerCallbackQuery("Not for you.");

  const state = await getState(userId);
  if (!state || state.step !== "post:review") {
    return ctx.answerCallbackQuery("This draft is no longer open.");
  }
  await ctx.answerCallbackQuery("Publishing…");
  await ctx.editMessageReplyMarkup({ reply_markup: undefined });

  const draft = draftToComposed(state.data);
  const post = await createPost({
    author_id: userId,
    status: "draft",
    body_html: draft.body_html,
    media_type: draft.media_type ?? undefined,
    media_file_id: draft.media_file_id ?? undefined,
    buttons: draft.buttons,
  });

  try {
    const sent = await sendComposed(ctx.api, channelId(), draft);
    await updatePost(post.id, {
      status: "published",
      published_at: new Date().toISOString(),
      message_id: sent.message_id,
    });
    await clearState(userId);
    await ctx.reply(`Published to the channel. Post #${post.id}.`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    await updatePost(post.id, { status: "failed", error: reason });
    await ctx.reply(
      `Telegram refused the post:\n<code>${reason}</code>\n\n` +
        "The draft is still here — fix it and try again.",
      { parse_mode: "HTML" },
    );
  }
});

compose.callbackQuery("post:schedule", async (ctx) => {
  const userId = ctx.from.id;
  const state = await getState(userId);
  if (!state) return ctx.answerCallbackQuery("This draft is no longer open.");
  await ctx.answerCallbackQuery();
  await setState(userId, "post:schedule", state.data);
  await ctx.reply(
    [
      `When? Times are ${config().TIMEZONE}.`,
      "",
      "<code>in 2h</code> · <code>18:30</code> · <code>tomorrow 9:00</code> ·",
      "<code>20/08 18:30</code> · <code>2026-08-20 18:30</code>",
    ].join("\n"),
    { parse_mode: "HTML" },
  );
});

compose.callbackQuery("post:buttons", async (ctx) => {
  const userId = ctx.from.id;
  const state = await getState(userId);
  if (!state) return ctx.answerCallbackQuery("This draft is no longer open.");
  await ctx.answerCallbackQuery();
  await setState(userId, "post:buttons", state.data);
  await ctx.reply(
    "Send the buttons — <code>Label - https://url</code>, one per line. " +
      "/skip removes them.",
    { parse_mode: "HTML" },
  );
});

compose.callbackQuery("post:restart", async (ctx) => {
  await ctx.answerCallbackQuery();
  await setState(ctx.from.id, "post:content", {});
  await ctx.reply("Starting over — send the post.");
});

compose.callbackQuery("post:cancel", async (ctx) => {
  await ctx.answerCallbackQuery("Discarded.");
  await clearState(ctx.from.id);
  await ctx.editMessageReplyMarkup({ reply_markup: undefined });
  await ctx.reply("Discarded. Nothing was published.");
});
