import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "grammy";
import { config, isAdmin } from "../config.js";
import {
  countPublished,
  countSubscribers,
  getPost,
  updatePost,
  upcomingPosts,
} from "../db.js";
import { formatInZone } from "../lib/time.js";

export const schedule = new Composer<Context>();

/** Strips HTML down to a one-line teaser for the queue listing. */
function teaser(html: string, max = 60): string {
  const plain = html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max
    ? `${plain.slice(0, max - 1)}…`
    : plain || "(media only)";
}

schedule.command("scheduled", async (ctx) => {
  if (!isAdmin(ctx.from?.id) || ctx.chat?.type !== "private") return;

  const posts = await upcomingPosts(20);
  if (posts.length === 0) {
    await ctx.reply("Nothing scheduled. /post to write something.");
    return;
  }

  await ctx.reply(`<b>${posts.length} post(s) queued</b>`, {
    parse_mode: "HTML",
  });

  for (const post of posts) {
    const when = post.scheduled_at
      ? formatInZone(new Date(post.scheduled_at), config().TIMEZONE)
      : "no date";
    const label = post.media_type ? ` · ${post.media_type}` : "";
    await ctx.reply(
      `<b>#${post.id}</b> — ${when}${label}\n${teaser(post.body_html)}`,
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard().text(
          "Cancel this post",
          `sched:cancel:${post.id}`,
        ),
      },
    );
  }
});

schedule.callbackQuery(/^sched:cancel:(\d+)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.answerCallbackQuery("Not for you.");

  const id = Number(ctx.match[1]);
  const post = await getPost(id);
  if (!post || post.status !== "scheduled") {
    return ctx.answerCallbackQuery("Already published or cancelled.");
  }
  await updatePost(id, { status: "failed", error: "cancelled by admin" });
  await ctx.answerCallbackQuery("Cancelled.");
  await ctx.editMessageReplyMarkup({ reply_markup: undefined });
  await ctx.reply(`Post #${id} cancelled — it will not be published.`);
});

schedule.command("stats", async (ctx) => {
  if (!isAdmin(ctx.from?.id) || ctx.chat?.type !== "private") return;

  const [subscribers, published, queued] = await Promise.all([
    countSubscribers(),
    countPublished(),
    upcomingPosts(100),
  ]);

  const next = queued[0]?.scheduled_at
    ? formatInZone(new Date(queued[0].scheduled_at), config().TIMEZONE)
    : "—";

  await ctx.reply(
    [
      "<b>Nina Redlyn — numbers</b>",
      "",
      `Subscribers reachable by broadcast: <b>${subscribers}</b>`,
      `Posts published through the bot: <b>${published}</b>`,
      `Queued: <b>${queued.length}</b>`,
      `Next out: <b>${next}</b>`,
      "",
      `<i>Timezone ${config().TIMEZONE}</i>`,
    ].join("\n"),
    { parse_mode: "HTML" },
  );
});
