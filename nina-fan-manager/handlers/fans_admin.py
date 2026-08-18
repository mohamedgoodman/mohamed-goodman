"""Fan records: who is in focus, private notes, tags, and listings."""

from __future__ import annotations

from telegram import Update
from telegram.ext import ContextTypes

from handlers.common import (
    NO_TARGET,
    db_of,
    esc,
    fan_line,
    resolve_target,
    set_active,
)
from storage.db import TAGS


async def fan_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """`/fan <id>` — put someone in focus without needing a message to reply to."""
    message = update.effective_message
    args = context.args or []
    if not args or not args[0].lstrip("-").isdigit():
        await message.reply_text(
            "Usage: <code>/fan 5493017574</code> — the id is in every message "
            "I forward you.",
            parse_mode="HTML",
        )
        return

    fan_id = int(args[0])
    fan = await db_of(context).get_fan(fan_id)
    if fan is None:
        await message.reply_text("Nobody by that id has written to the bot.")
        return

    set_active(context, fan_id)
    await message.reply_text(
        f"Now on {fan_line(fan)}\n\n"
        "/send, /q and your replies go to them until you switch.",
        parse_mode="HTML",
    )


async def whois_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """`/whois` — who is currently in focus."""
    fan_id = await resolve_target(update, context)
    if fan_id is None:
        await update.effective_message.reply_text(NO_TARGET, parse_mode="HTML")
        return

    fan = await db_of(context).get_fan(fan_id)
    if fan is None:
        await update.effective_message.reply_text("That fan is no longer on file.")
        return

    await update.effective_message.reply_text(
        "\n".join(
            [
                fan_line(fan),
                "",
                f"Messages received: {fan.message_count}",
                f"Note: {esc(fan.note) if fan.note else '<i>none</i>'}",
            ]
        ),
        parse_mode="HTML",
    )


async def note_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """`/note <text>` — a private line only the creator ever sees."""
    message = update.effective_message
    fan_id = await resolve_target(update, context)
    if fan_id is None:
        await message.reply_text(NO_TARGET, parse_mode="HTML")
        return

    parts = message.text.split(maxsplit=1)
    if len(parts) < 2:
        fan = await db_of(context).get_fan(fan_id)
        await message.reply_text(
            f"Note: {esc(fan.note)}" if fan and fan.note else "No note on them yet."
        )
        return

    await db_of(context).set_note(fan_id, parts[1].strip())
    await message.reply_text("Noted.")


async def tag_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """`/tag <new|active|whale|inactive>`."""
    message = update.effective_message
    args = context.args or []
    if not args:
        await message.reply_text(
            f"Usage: <code>/tag whale</code>\nTags: {', '.join(TAGS)}",
            parse_mode="HTML",
        )
        return

    tag = args[0].lower()
    if tag not in TAGS:
        await message.reply_text(f"Unknown tag. Pick one of: {', '.join(TAGS)}")
        return

    fan_id = await resolve_target(update, context)
    if fan_id is None:
        await message.reply_text(NO_TARGET, parse_mode="HTML")
        return

    await db_of(context).set_tag(fan_id, tag)
    await message.reply_text(f"Tagged #{tag}.")


async def fans_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """`/fans [tag]` — most recent first."""
    args = context.args or []
    tag = args[0].lower() if args else None
    if tag and tag not in TAGS:
        await update.effective_message.reply_text(
            f"Unknown tag. Pick one of: {', '.join(TAGS)}"
        )
        return

    fans = await db_of(context).list_fans(tag=tag, limit=40)
    if not fans:
        await update.effective_message.reply_text(
            "Nobody here yet." if not tag else f"Nobody tagged #{tag}."
        )
        return

    heading = f"<b>Fans</b>{f' · #{tag}' if tag else ''} — {len(fans)} shown"
    body = "\n".join(fan_line(f) for f in fans)
    await update.effective_message.reply_text(f"{heading}\n\n{body}", parse_mode="HTML")


async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    db = db_of(context)
    counts = await db.counts_by_tag()
    reachable = len(await db.audience(None))
    total = sum(counts.values())

    lines = ["<b>Numbers</b>", "", f"Fans on file: <b>{total}</b>"]
    lines += [f"  #{tag}: {counts[tag]}" for tag in sorted(counts)]
    lines += ["", f"Reachable by broadcast: <b>{reachable}</b>"]
    if total > reachable:
        lines.append(f"<i>{total - reachable} have blocked the bot.</i>")

    await update.effective_message.reply_text("\n".join(lines), parse_mode="HTML")
