import { Composer } from "grammy";
import type { Context } from "grammy";
import { GrammyError } from "grammy";
import { config, isAdmin } from "../config.js";
import { addWarning } from "../db.js";

export const moderation = new Composer<Context>();

/** Links to these hosts are always allowed — they are ours. */
const ALLOWED_HOSTS = [
  "t.me",
  "telegram.me",
  "instagram.com",
  "www.instagram.com",
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
];

const BANNED_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern:
      /\b(?:crypto|forex|binary option|investment plan)\b.*\b(?:dm|whatsapp|profit)\b/i,
    reason: "investment spam",
  },
  {
    pattern:
      /\b(?:free followers|cheap followers|buy followers|f4f|sub4sub)\b/i,
    reason: "engagement spam",
  },
  { pattern: /\b(?:onlyfans|porn|xxx|sex cam)\b/i, reason: "adult spam" },
  {
    pattern: /(?:\+?\d[\d\s().-]{9,})\s*(?:whatsapp|wa\.me)/i,
    reason: "unsolicited contact details",
  },
];

/** Three strikes inside a week earns a 24-hour mute. */
const WARNINGS_BEFORE_MUTE = 3;
const MUTE_SECONDS = 24 * 3600;

function hostsIn(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s]+/gi) ?? [];
  const hosts: string[] = [];
  for (const raw of matches) {
    try {
      hosts.push(new URL(raw).hostname.toLowerCase());
    } catch {
      // A malformed URL is not a link we need to police.
    }
  }
  return hosts;
}

/** Cheap heuristic for shouted spam: long message, mostly capitals. */
function isShouting(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 40) return false;
  const capitals = letters.replace(/[^A-Z]/g, "").length;
  return capitals / letters.length > 0.75;
}

async function isGroupAdmin(ctx: Context, userId: number): Promise<boolean> {
  if (isAdmin(userId)) return true;
  try {
    const member = await ctx.getChatMember(userId);
    return member.status === "administrator" || member.status === "creator";
  } catch {
    return false;
  }
}

// Keep the group clean of join/leave clutter.
moderation.on(
  ["message:new_chat_members", "message:left_chat_member"],
  async (ctx, next) => {
    if (ctx.chat.id !== config().GROUP_ID) return next();
    try {
      await ctx.deleteMessage();
    } catch {
      // The bot may lack delete rights; that is not worth crashing over.
    }
  },
);

moderation.on("message", async (ctx, next) => {
  const groupId = config().GROUP_ID;
  if (groupId === undefined || ctx.chat.id !== groupId) return next();

  const from = ctx.from;
  if (!from || from.is_bot) return next();

  const text = ctx.message.text ?? ctx.message.caption ?? "";

  // Automatic forwards of channel posts into the discussion group are the
  // channel's own — never touch them.
  if (ctx.message.is_automatic_forward) return next();

  let violation: string | null = null;

  const outsideHosts = hostsIn(text).filter(
    (host) =>
      !ALLOWED_HOSTS.some(
        (allowed) => host === allowed || host.endsWith(`.${allowed}`),
      ),
  );
  if (outsideHosts.length > 0) violation = "external link";

  if (!violation) {
    const banned = BANNED_PATTERNS.find((rule) => rule.pattern.test(text));
    if (banned) violation = banned.reason;
  }

  if (!violation && ctx.message.forward_origin)
    violation = "forwarded promotion";
  if (!violation && isShouting(text)) violation = "shouting";

  if (!violation) return next();
  if (await isGroupAdmin(ctx, from.id)) return next();

  try {
    await ctx.deleteMessage();
  } catch {
    // No delete rights — still warn, so the record exists.
  }

  const count = await addWarning(ctx.chat.id, from.id, violation);
  const name = from.first_name || from.username || "member";

  if (count >= WARNINGS_BEFORE_MUTE) {
    try {
      await ctx.restrictChatMember(
        from.id,
        { can_send_messages: false },
        { until_date: Math.floor(Date.now() / 1000) + MUTE_SECONDS },
      );
      await ctx.reply(
        `${name} is muted for 24 hours — ${count} warnings (${violation}).`,
      );
      return;
    } catch (error) {
      if (!(error instanceof GrammyError)) throw error;
      // Missing restrict rights: fall through to the plain warning.
    }
  }

  await ctx.reply(
    `${name}, that was removed — ${violation}. ` +
      `Warning ${count}/${WARNINGS_BEFORE_MUTE}.`,
  );
});
