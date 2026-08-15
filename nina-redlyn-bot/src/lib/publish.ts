import type { Api } from "grammy";
import type { Message } from "grammy/types";
import type { Button, MediaType } from "../db.js";
import { buildKeyboard } from "./keyboard.js";

export type Composed = {
  body_html: string;
  media_type?: MediaType | null;
  media_file_id?: string | null;
  buttons: Button[];
};

/**
 * Sends a composed post to any chat — the channel when publishing, the
 * admin's private chat when previewing. One code path means the preview is
 * exactly what subscribers will see.
 */
export async function sendComposed(
  api: Api,
  chatId: number | string,
  post: Composed,
  options: { silent?: boolean } = {},
): Promise<Message> {
  const reply_markup = buildKeyboard(post.buttons);
  const common = {
    parse_mode: "HTML" as const,
    reply_markup,
    disable_notification: options.silent ?? false,
  };

  if (post.media_file_id && post.media_type) {
    const media = post.media_file_id;
    const caption = post.body_html || undefined;
    switch (post.media_type) {
      case "photo":
        return api.sendPhoto(chatId, media, { caption, ...common });
      case "video":
        return api.sendVideo(chatId, media, { caption, ...common });
      case "animation":
        return api.sendAnimation(chatId, media, { caption, ...common });
      case "audio":
        return api.sendAudio(chatId, media, { caption, ...common });
      case "document":
        return api.sendDocument(chatId, media, { caption, ...common });
    }
  }

  return api.sendMessage(chatId, post.body_html, {
    ...common,
    link_preview_options: { is_disabled: false },
  });
}

/** Pulls the media out of an incoming message, if it carries any. */
export function extractMedia(
  message: Message,
): { type: MediaType; file_id: string } | null {
  if (message.photo?.length) {
    // The last entry is the largest rendition.
    const largest = message.photo[message.photo.length - 1]!;
    return { type: "photo", file_id: largest.file_id };
  }
  if (message.video) return { type: "video", file_id: message.video.file_id };
  if (message.animation)
    return { type: "animation", file_id: message.animation.file_id };
  if (message.audio) return { type: "audio", file_id: message.audio.file_id };
  if (message.document)
    return { type: "document", file_id: message.document.file_id };
  return null;
}
