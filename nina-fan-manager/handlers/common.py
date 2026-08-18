"""Helpers shared by the admin-facing handlers."""

from __future__ import annotations

import html
import logging

from telegram import Update
from telegram.ext import ContextTypes

from storage.db import Database, Fan

log = logging.getLogger(__name__)

#: `context.user_data` keys, named once so a typo cannot silently diverge.
ACTIVE_FAN = "active_fan"
BROADCAST_TAG = "broadcast_tag"

#: Where the shared objects live on `application.bot_data`.
DB = "db"
CONFIG = "config"


def db_of(context: ContextTypes.DEFAULT_TYPE) -> Database:
    return context.bot_data[DB]


def config_of(context: ContextTypes.DEFAULT_TYPE):
    return context.bot_data[CONFIG]


def esc(text: str | None) -> str:
    return html.escape(text or "")


async def resolve_target(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> int | None:
    """
    Work out which fan an admin command is aimed at.

    Replying to a relayed message is the unambiguous way and wins. Otherwise
    the last fan the admin answered stays "active", so a run of commands does
    not need a reply every time.
    """
    message = update.effective_message
    if message is None:
        return None

    if message.reply_to_message is not None:
        fan_id = await db_of(context).fan_for_relay(
            message.chat_id, message.reply_to_message.message_id
        )
        if fan_id is not None:
            set_active(context, fan_id)
            return fan_id

    active = context.user_data.get(ACTIVE_FAN) if context.user_data else None
    return int(active) if active else None


def set_active(context: ContextTypes.DEFAULT_TYPE, fan_id: int) -> None:
    if context.user_data is not None:
        context.user_data[ACTIVE_FAN] = fan_id


NO_TARGET = (
    "I do not know who you mean. Reply to one of the messages I forwarded "
    "you, or run /fan &lt;id&gt; first to pick someone."
)


def fan_line(fan: Fan) -> str:
    """One-line fan summary for listings and confirmations."""
    bits = [f"<b>{esc(fan.display)}</b>", f"<code>{fan.user_id}</code>"]
    bits.append(f"#{esc(fan.tag)}")
    if fan.note:
        bits.append(f"— {esc(fan.note)}")
    if fan.is_blocked:
        bits.append("(blocked the bot)")
    return " · ".join(bits)
