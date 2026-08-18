import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "grammy";
import { config, isAdmin, publishingEnabled } from "../config.js";
import { deactivateSubscriber, upsertSubscriber } from "../db.js";

export const start = new Composer<Context>();

const WELCOME = [
  "<b>Welcome to Nina Redlyn.</b>",
  "",
  "You are now on the list. I will let you know when something new drops —",
  "no spam, only what matters.",
  "",
  "Use the buttons below, or just write to me: a question, a request or a",
  "collaboration proposal reaches the team directly.",
].join("\n");

/**
 * The panel lists only what this deployment can actually do — a bot with no
 * channel configured never advertises commands that would fail.
 */
function adminHelp(): string {
  const lines = ["<b>Admin panel</b>", ""];

  if (publishingEnabled()) {
    lines.push(
      "<b>/post</b> — compose a post: text, photo or video, buttons, then",
      "publish or schedule it.",
      "<b>/scheduled</b> — everything queued, with a cancel button.",
    );
  }

  lines.push(
    "<b>/broadcast</b> — message everyone who has written to the bot.",
    "<b>/stats</b> — subscribers and reach.",
    "<b>/cancel</b> — abandon whatever you are in the middle of.",
    "",
    "People writing to the bot land here, labelled with their name. Reply to",
    "one of those messages and your answer goes straight back to them.",
  );

  if (publishingEnabled()) {
    lines.push(
      "",
      "<i>Tip: write the post exactly as you want it to appear — bold,",
      "italics, links and emoji are all preserved.</i>",
    );
  }

  return lines.join("\n");
}

function memberMenu(): InlineKeyboard {
  const channel = config().CHANNEL_ID;
  // Only a public @handle gives a link a member can actually open.
  const link = channel?.startsWith("@")
    ? `https://t.me/${channel.slice(1)}`
    : undefined;
  const keyboard = new InlineKeyboard();
  if (link) keyboard.url("Open the channel", link).row();
  keyboard.text("Ask a question", "menu:ask");
  return keyboard;
}

start.command("start", async (ctx) => {
  const from = ctx.from;
  if (!from) return;

  await upsertSubscriber({
    user_id: from.id,
    username: from.username,
    first_name: from.first_name,
    last_name: from.last_name,
    language: from.language_code,
    source: ctx.match ? String(ctx.match) : undefined,
  });

  if (isAdmin(from.id)) {
    await ctx.reply(adminHelp(), { parse_mode: "HTML" });
    return;
  }

  await ctx.reply(WELCOME, {
    parse_mode: "HTML",
    reply_markup: memberMenu(),
  });
});

start.command("help", async (ctx) => {
  if (isAdmin(ctx.from?.id)) {
    await ctx.reply(adminHelp(), { parse_mode: "HTML" });
    return;
  }
  await ctx.reply(
    "Write your question here and it goes straight to the team. " +
      "You will get an answer in this chat.",
    { reply_markup: memberMenu() },
  );
});

start.callbackQuery("menu:ask", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    "Go ahead — write your question, and include as much detail as you can.",
  );
});

/**
 * Telegram reports a block as a `my_chat_member` update in the private chat.
 * Marking the subscriber inactive keeps broadcasts from burning attempts on
 * people who will never receive them.
 */
start.on("my_chat_member", async (ctx, next) => {
  const update = ctx.myChatMember;
  if (update.chat.type !== "private") return next();

  const status = update.new_chat_member.status;
  if (status === "kicked" || status === "left") {
    await deactivateSubscriber(update.from.id);
  } else if (status === "member") {
    await upsertSubscriber({
      user_id: update.from.id,
      username: update.from.username,
      first_name: update.from.first_name,
      last_name: update.from.last_name,
      language: update.from.language_code,
    });
  }
});
