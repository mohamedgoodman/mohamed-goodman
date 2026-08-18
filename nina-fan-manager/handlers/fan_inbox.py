"""
The two-way relay: fans write in, the creator writes back.

A fan never sees the creator's personal account, and the creator never has to
remember who they are answering — replying to a forwarded message is enough.
"""

from __future__ import annotations

import logging

from telegram import Update
from telegram.constants import ChatType
from telegram.error import Forbidden, TelegramError
from telegram.ext import ContextTypes

from handlers.common import (
    BROADCAST_TAG,
    config_of,
    db_of,
    esc,
    set_active,
)

log = logging.getLogger(__name__)

#: Text messages shorter than this are inlined into the header, so the common
#: case costs the creator one message in their chat instead of two.
INLINE_LIMIT = 600


async def fan_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """A fan pressed Start."""
    user = update.effective_user
    if user is None:
        return
    await db_of(context).upsert_fan(
        user.id, user.username, user.first_name, user.last_name
    )
    await update.effective_message.reply_text(config_of(context).welcome)


async def fan_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Anything a fan sends: record it, maybe auto-reply, always relay."""
    user = update.effective_user
    message = update.effective_message
    if user is None or message is None:
        return

    db = db_of(context)
    cfg = config_of(context)
    await db.upsert_fan(
        user.id, user.username, user.first_name, user.last_name, count_message=True
    )
    fan = await db.get_fan(user.id)

    text = message.text or message.caption or ""
    auto_used = await _maybe_auto_reply(update, context, fan_id=user.id, text=text)

    header_bits = [
        "📨 <b>New message</b>",
        f"From: <b>{esc(fan.display if fan else user.first_name)}</b>",
        f"ID: <code>{user.id}</code>",
    ]
    if fan:
        header_bits.append(f"Tag: #{esc(fan.tag)} · messages: {fan.message_count}")
        if fan.note:
            header_bits.append(f"Note: <i>{esc(fan.note)}</i>")
    if auto_used:
        header_bits.append(f"<i>Auto-replied with “{esc(auto_used)}”.</i>")

    admin_chat = cfg.primary_admin
    inline = bool(message.text) and len(message.text) <= INLINE_LIMIT

    try:
        if inline:
            sent = await context.bot.send_message(
                admin_chat,
                "\n".join(header_bits) + f"\n\n{esc(message.text)}",
                parse_mode="HTML",
            )
            await db.remember_relay(admin_chat, sent.message_id, user.id)
        else:
            header = await context.bot.send_message(
                admin_chat, "\n".join(header_bits), parse_mode="HTML"
            )
            copied = await context.bot.copy_message(
                chat_id=admin_chat,
                from_chat_id=message.chat_id,
                message_id=message.message_id,
                reply_to_message_id=header.message_id,
            )
            # Map both, so a reply to either one reaches the fan.
            await db.remember_relay(admin_chat, header.message_id, user.id)
            await db.remember_relay(admin_chat, copied.message_id, user.id)
    except TelegramError:
        log.exception("could not relay a message from %s", user.id)
        return

    if not auto_used:
        # Silence would read as being ignored; this is a receipt, not a persona.
        await message.reply_text("Got it — this is with me, I'll answer here.")


async def _maybe_auto_reply(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
    *,
    fan_id: int,
    text: str,
) -> str | None:
    """
    Answer the mechanical questions only — pricing, payment, what's on offer.

    Returns the keyword that fired, or None. A keyword answers a given fan at
    most once per cooldown window, so a repeated word is not met with a wall
    of identical canned replies.
    """
    if not text:
        return None

    db = db_of(context)
    cfg = config_of(context)
    haystack = text.lower()

    for auto_id, keyword, body, enabled in await db.list_auto_replies():
        if not enabled or keyword not in haystack:
            continue
        if await db.auto_reply_on_cooldown(fan_id, auto_id, cfg.auto_reply_cooldown):
            return None
        try:
            await update.effective_message.reply_text(body)
        except TelegramError:
            log.exception("auto-reply to %s failed", fan_id)
            return None
        await db.record_auto_reply(fan_id, auto_id)
        return keyword
    return None


async def admin_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    A non-command message from the creator.

    Replying to a relayed message answers that fan. If a broadcast is being
    composed, the message becomes the draft instead. Anything else gets a
    nudge rather than vanishing.
    """
    message = update.effective_message
    if message is None:
        return

    if context.user_data and context.user_data.get(BROADCAST_TAG):
        from handlers.broadcast import capture_draft

        await capture_draft(update, context)
        return

    if message.reply_to_message is None:
        await message.reply_text(
            "Reply to one of the messages I forward you and I'll pass it on. "
            "/help lists everything else."
        )
        return

    fan_id = await db_of(context).fan_for_relay(
        message.chat_id, message.reply_to_message.message_id
    )
    if fan_id is None:
        await message.reply_text(
            "That message isn't one of mine, so I don't know who it belongs to."
        )
        return

    set_active(context, fan_id)
    await send_to_fan(update, context, fan_id)


async def send_to_fan(
    update: Update, context: ContextTypes.DEFAULT_TYPE, fan_id: int
) -> None:
    """
    Copy the creator's message to the fan.

    `copy_message` keeps text, photos, voice notes and formatting intact, and
    arrives without a "forwarded from" header.
    """
    message = update.effective_message
    try:
        await context.bot.copy_message(
            chat_id=fan_id,
            from_chat_id=message.chat_id,
            message_id=message.message_id,
        )
    except Forbidden:
        await db_of(context).mark_blocked(fan_id)
        await message.reply_text(
            "They have blocked the bot, so that did not go through. "
            "I've marked them so broadcasts skip them."
        )
        return
    except TelegramError:
        log.exception("delivering to %s failed", fan_id)
        await message.reply_text("Telegram refused that one. Try again?")
        return

    await message.set_reaction("👍")


async def on_chat_member(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Telegram reports a block as a status change in the private chat."""
    membership = update.my_chat_member
    if membership is None or membership.chat.type != ChatType.PRIVATE:
        return

    user = membership.from_user
    status = membership.new_chat_member.status
    if status in ("kicked", "left"):
        await db_of(context).mark_blocked(user.id)
        log.info("%s blocked the bot", user.id)
    else:
        await db_of(context).upsert_fan(
            user.id, user.username, user.first_name, user.last_name
        )
