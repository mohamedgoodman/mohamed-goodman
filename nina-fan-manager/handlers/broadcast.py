"""
Broadcasts to a tag group.

Sending goes out in the background at a pace Telegram tolerates, so a large
list does not freeze the bot or trip rate limits. Anyone who has blocked the
bot is marked and skipped from then on.
"""

from __future__ import annotations

import asyncio
import logging

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.error import Forbidden, RetryAfter, TelegramError
from telegram.ext import ContextTypes

from handlers.common import BROADCAST_TAG, config_of, db_of, esc
from storage.db import TAGS

log = logging.getLogger(__name__)

DRAFT_CHAT = "broadcast_chat"
DRAFT_MSG = "broadcast_msg"

#: How often the progress message is refreshed while sending.
PROGRESS_EVERY = 25


async def broadcast_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """`/broadcast [tag]` — start composing one."""
    message = update.effective_message
    args = context.args or []
    tag = args[0].lower() if args else "all"

    if tag != "all" and tag not in TAGS:
        await message.reply_text(
            f"Unknown tag. Use one of: all, {', '.join(TAGS)}"
        )
        return

    audience = await db_of(context).audience(None if tag == "all" else tag)
    if not audience:
        await message.reply_text(
            "Nobody to send to. Only people who have written to the bot can be "
            "messaged — Telegram does not allow reaching anyone else."
        )
        return

    context.user_data[BROADCAST_TAG] = tag
    await message.reply_text(
        f"Composing a broadcast to <b>{len(audience)}</b> fan(s)"
        f"{'' if tag == 'all' else f' tagged #{esc(tag)}'}.\n\n"
        "Send the message now — text, a photo, whatever you want them to get. "
        "/cancel to drop it.",
        parse_mode="HTML",
    )


async def cancel_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    had_draft = bool(context.user_data.pop(BROADCAST_TAG, None))
    context.user_data.pop(DRAFT_CHAT, None)
    context.user_data.pop(DRAFT_MSG, None)
    await update.effective_message.reply_text(
        "Broadcast cancelled." if had_draft else "Nothing to cancel."
    )


async def capture_draft(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """The creator's next message becomes the broadcast body."""
    message = update.effective_message
    tag = context.user_data.get(BROADCAST_TAG, "all")

    # Keep the original message and copy it later, so formatting and media
    # survive exactly as composed.
    context.user_data[DRAFT_CHAT] = message.chat_id
    context.user_data[DRAFT_MSG] = message.message_id

    audience = await db_of(context).audience(None if tag == "all" else tag)
    await message.reply_text(
        f"That goes to <b>{len(audience)}</b> fan(s). Send it?",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(
            [
                [
                    InlineKeyboardButton("Send", callback_data="bc:go"),
                    InlineKeyboardButton("Cancel", callback_data="bc:no"),
                ]
            ]
        ),
    )


async def broadcast_button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    decision = query.data.split(":", 1)[1]

    if decision == "no":
        context.user_data.pop(BROADCAST_TAG, None)
        context.user_data.pop(DRAFT_CHAT, None)
        context.user_data.pop(DRAFT_MSG, None)
        await query.answer("Cancelled.")
        await query.edit_message_text("Broadcast cancelled. Nothing was sent.")
        return

    tag = context.user_data.pop(BROADCAST_TAG, "all")
    from_chat = context.user_data.pop(DRAFT_CHAT, None)
    from_msg = context.user_data.pop(DRAFT_MSG, None)

    if from_chat is None or from_msg is None:
        await query.answer("The draft is gone — start again with /broadcast.")
        return

    await query.answer("Sending…")
    await query.edit_message_text("Sending…")

    # Detached so the bot keeps answering while a long list drains.
    context.application.create_task(
        _run(context, tag, from_chat, from_msg, query.message.chat_id)
    )


async def _run(
    context: ContextTypes.DEFAULT_TYPE,
    tag: str,
    from_chat: int,
    from_msg: int,
    report_to: int,
) -> None:
    db = db_of(context)
    cfg = config_of(context)
    recipients = await db.audience(None if tag == "all" else tag)

    status = await context.bot.send_message(
        report_to, f"Broadcast started — 0/{len(recipients)}"
    )

    sent = failed = 0
    for position, fan_id in enumerate(recipients, start=1):
        try:
            await context.bot.copy_message(
                chat_id=fan_id, from_chat_id=from_chat, message_id=from_msg
            )
            sent += 1
        except RetryAfter as exc:
            # Telegram is asking us to slow down; wait exactly as long as told.
            await asyncio.sleep(exc.retry_after + 1)
            try:
                await context.bot.copy_message(
                    chat_id=fan_id, from_chat_id=from_chat, message_id=from_msg
                )
                sent += 1
            except TelegramError:
                failed += 1
        except Forbidden:
            failed += 1
            await db.mark_blocked(fan_id)
        except TelegramError:
            failed += 1
            log.warning("broadcast to %s failed", fan_id, exc_info=True)

        if position % PROGRESS_EVERY == 0:
            try:
                await status.edit_text(
                    f"Broadcast running — {position}/{len(recipients)}"
                )
            except TelegramError:
                pass

        await asyncio.sleep(cfg.broadcast_interval)

    summary = f"Broadcast finished — {sent} delivered"
    if failed:
        summary += f", {failed} undeliverable (blocked or gone)"
    try:
        await status.edit_text(summary)
    except TelegramError:
        await context.bot.send_message(report_to, summary)
