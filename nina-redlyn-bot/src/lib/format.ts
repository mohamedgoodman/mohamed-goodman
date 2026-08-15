import type { MessageEntity } from "grammy/types";

/**
 * Telegram gives formatting as a flat list of entities over UTF-16 offsets.
 * To publish, schedule and preview the same post we need it as HTML, so this
 * module converts in that direction and escapes anything user-supplied.
 */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function openTag(entity: MessageEntity): string | null {
  switch (entity.type) {
    case "bold":
      return "<b>";
    case "italic":
      return "<i>";
    case "underline":
      return "<u>";
    case "strikethrough":
      return "<s>";
    case "spoiler":
      return '<span class="tg-spoiler">';
    case "code":
      return "<code>";
    case "pre":
      return entity.language
        ? `<pre><code class="language-${escapeHtml(entity.language)}">`
        : "<pre>";
    case "blockquote":
      return "<blockquote>";
    case "expandable_blockquote":
      return "<blockquote expandable>";
    case "text_link":
      return `<a href="${escapeHtml(entity.url)}">`;
    case "text_mention":
      return `<a href="tg://user?id=${entity.user.id}">`;
    case "custom_emoji":
      return `<tg-emoji emoji-id="${escapeHtml(entity.custom_emoji_id)}">`;
    default:
      // url, mention, hashtag, bot_command, email, phone_number… carry no
      // markup of their own — Telegram re-detects them from the plain text.
      return null;
  }
}

function closeTag(entity: MessageEntity): string {
  switch (entity.type) {
    case "bold":
      return "</b>";
    case "italic":
      return "</i>";
    case "underline":
      return "</u>";
    case "strikethrough":
      return "</s>";
    case "spoiler":
      return "</span>";
    case "code":
      return "</code>";
    case "pre":
      return entity.language ? "</code></pre>" : "</pre>";
    case "blockquote":
    case "expandable_blockquote":
      return "</blockquote>";
    case "text_link":
    case "text_mention":
      return "</a>";
    case "custom_emoji":
      return "</tg-emoji>";
    default:
      return "";
  }
}

/**
 * Converts a message's text plus entities into Telegram-flavoured HTML.
 *
 * Entities may nest but never partially overlap, so sorting by start offset
 * (longest first on a tie) and walking the string once with a close-stack
 * reproduces the nesting exactly.
 */
export function toHtml(text: string, entities: MessageEntity[] = []): string {
  if (entities.length === 0) return escapeHtml(text);

  // Telegram offsets are UTF-16 code units, which is what a JS string uses,
  // so Array.from would be wrong here — index by code unit.
  const sorted = [...entities].sort(
    (a, b) => a.offset - b.offset || b.length - a.length,
  );

  let out = "";
  let cursor = 0;
  const stack: { end: number; entity: MessageEntity }[] = [];

  const closeUntil = (position: number) => {
    while (stack.length > 0 && stack[stack.length - 1]!.end <= position) {
      const top = stack.pop()!;
      out += escapeHtml(text.slice(cursor, top.end));
      cursor = top.end;
      out += closeTag(top.entity);
    }
  };

  for (const entity of sorted) {
    const open = openTag(entity);
    if (open === null) continue;
    closeUntil(entity.offset);
    out += escapeHtml(text.slice(cursor, entity.offset));
    cursor = entity.offset;
    out += open;
    stack.push({ end: entity.offset + entity.length, entity });
  }

  closeUntil(text.length);
  out += escapeHtml(text.slice(cursor));
  return out;
}

/** Appends the channel signature, keeping one blank line before it. */
export function withSignature(html: string, signature: string): string {
  const trimmed = html.trimEnd();
  if (!signature.trim()) return trimmed;
  if (trimmed.includes(signature.trim())) return trimmed;
  return `${trimmed}\n\n${signature.trim()}`;
}

/** Telegram's hard limits, so we can warn before the API does. */
export const LIMIT_TEXT = 4096;
export const LIMIT_CAPTION = 1024;

export function overLimit(html: string, hasMedia: boolean): number {
  const limit = hasMedia ? LIMIT_CAPTION : LIMIT_TEXT;
  // HTML tags do not count toward Telegram's limit — measure the visible text.
  const visible = html.replace(/<[^>]+>/g, "").length;
  return visible > limit ? visible - limit : 0;
}
