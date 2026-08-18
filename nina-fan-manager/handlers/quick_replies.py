"""
Saved replies.

The lines a creator types twenty times a day, stored once and sent with a tap.
The creator writes them; nothing here generates text.
"""

from __future__ import annotations

import re

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.error import Forbidden, TelegramError
from telegram.ext import ContextTypes

from handlers.common import NO_TARGET, db_of, esc, resolve_target

#: Triggers stay simple so they are quick to type and safe in callback data.
TRIGGER_RE = re.compile(r"^[a-z0-9_-]{1,24}$")

USAGE = (
    "<b>Saved replies</b>\n\n"
    "<code>/qr</code> — list them\n"
    "<code>/qr add &lt;name&gt; &lt;text&gt;</code> — save or overwrite one\n"
    "<code>/qr del &lt;name&gt;</code> — remove one\n"
    "<code>/q &lt;name&gt;</code> — send one to the fan you're on\n\n"
    "Names may use letters, digits, <code>-</code> and <code>_</code>."
)


async def qr_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    message = update.effective_message
    args = context.args or []

    if not args:
        await _list(update, context)
        return

    action = args[0].lower()

    if action == "add":
        if len(args) < 3:
            await message.reply_text(
                "Usage: <code>/qr add welcome Hey, thanks for subscribing!</code>",
                parse_mode="HTML",
            )
            return
        trigger = args[1].lower()
        if not TRIGGER_RE.match(trigger):
            await message.reply_text(
                "Names may only use letters, digits, - and _, up to 24 characters."
            )
            return
        body = message.text.split(maxsplit=2)[2]
        await db_of(context).save_quick_reply(trigger, body)
        await message.reply_text(f"Saved as /q {trigger}")
        return

    if action in ("del", "delete", "rm"):
        if len(args) < 2:
            await message.reply_text("Usage: <code>/qr del welcome</code>", parse_mode="HTML")
            return
        removed = await db_of(context).delete_quick_reply(args[1].lower())
        await message.reply_text("Deleted." if removed else "No saved reply by that name.")
        return

    await message.reply_text(USAGE, parse_mode="HTML")


async def _list(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    saved = await db_of(context).list_quick_replies()
    if not saved:
        await update.effective_message.reply_text(
            "No saved replies yet.\n\n" + USAGE, parse_mode="HTML"
        )
        return

    lines = ["<b>Saved replies</b>", ""]
    for trigger, body in saved:
        preview = body if len(body) <= 70 else body[:69] + "…"
        lines.append(f"<code>/q {esc(trigger)}</code> — {esc(preview)}")

    # Buttons send straight to whoever is active, which is the common case.
    keyboard = [
        [InlineKeyboardButton(t, callback_data=f"qr:{t}")]
        for t, _ in saved[:20]
    ]
    await update.effective_message.reply_text(
        "\n".join(lines),
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


async def q_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """`/q <name>` — send a saved reply to the fan in focus."""
    message = update.effective_message
    args = context.args or []
    if not args:
        await message.reply_text("Usage: <code>/q welcome</code>", parse_mode="HTML")
        return

    body = await db_of(context).get_quick_reply(args[0].lower())
    if body is None:
        await message.reply_text("No saved reply by that name. /qr lists them.")
        return

    fan_id = await resolve_target(update, context)
    if fan_id is None:
        await message.reply_text(NO_TARGET, parse_mode="HTML")
        return

    await _deliver(update, context, fan_id, body)


async def qr_button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    trigger = query.data.split(":", 1)[1]

    body = await db_of(context).get_quick_reply(trigger)
    if body is None:
        await query.answer("That reply no longer exists.")
        return

    fan_id = await resolve_target(update, context)
    if fan_id is None:
        await query.answer("Pick a fan first — reply to one, or /fan <id>.", show_alert=True)
        return

    await query.answer("Sending…")
    await _deliver(update, context, fan_id, body)


async def _deliver(
    update: Update, context: ContextTypes.DEFAULT_TYPE, fan_id: int, body: str
) -> None:
    db = db_of(context)
    try:
        await context.bot.send_message(fan_id, body)
    except Forbidden:
        await db.mark_blocked(fan_id)
        await update.effective_message.reply_text(
            "They have blocked the bot — nothing was sent."
        )
        return
    except TelegramError:
        await update.effective_message.reply_text("Telegram refused that. Try again?")
        return

    fan = await db.get_fan(fan_id)
    await update.effective_message.reply_text(
        f"Sent to {esc(fan.display if fan else str(fan_id))}.", parse_mode="HTML"
    )
