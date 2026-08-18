"""
Automatic replies for the mechanical questions only.

A fan asking "how much?" at 3am gets the price list without waiting. These are
plain canned answers the creator writes: no persona, no improvisation, and the
message is still relayed so the creator sees it and can follow up.
"""

from __future__ import annotations

from telegram import Update
from telegram.ext import ContextTypes

from handlers.common import config_of, db_of, esc

USAGE = (
    "<b>Auto-replies</b>\n\n"
    "<code>/auto</code> — list them\n"
    "<code>/auto add &lt;keyword&gt; | &lt;answer&gt;</code>\n"
    "<code>/auto del &lt;id&gt;</code>\n\n"
    "The keyword matches anywhere in a fan's message, case-insensitively. "
    "First match wins, so put the specific ones in first.\n"
    "Each keyword answers a given fan once per cooldown window."
)


async def auto_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    message = update.effective_message
    args = context.args or []
    db = db_of(context)

    if not args:
        rules = await db.list_auto_replies()
        if not rules:
            await message.reply_text(
                "No auto-replies set.\n\n" + USAGE, parse_mode="HTML"
            )
            return
        cooldown = config_of(context).auto_reply_cooldown // 60
        lines = ["<b>Auto-replies</b>", ""]
        for auto_id, keyword, body, enabled in rules:
            preview = body if len(body) <= 60 else body[:59] + "…"
            state = "" if enabled else " (off)"
            lines.append(
                f"<b>{auto_id}.</b> <code>{esc(keyword)}</code>{state} → {esc(preview)}"
            )
        lines += ["", f"<i>Cooldown: {cooldown} minutes per fan per keyword.</i>"]
        await message.reply_text("\n".join(lines), parse_mode="HTML")
        return

    action = args[0].lower()

    if action == "add":
        raw = message.text.split(maxsplit=1)[1][len("add") :].strip()
        if "|" not in raw:
            await message.reply_text(
                "Separate the keyword from the answer with <code>|</code>:\n"
                "<code>/auto add price | Menu: 20€ photo set, 50€ custom.</code>",
                parse_mode="HTML",
            )
            return
        keyword, body = (part.strip() for part in raw.split("|", 1))
        if not keyword or not body:
            await message.reply_text("Both the keyword and the answer need content.")
            return
        await db.add_auto_reply(keyword, body)
        await message.reply_text(f"Saved. Fans writing “{keyword}” now get that answer.")
        return

    if action in ("del", "delete", "rm"):
        if len(args) < 2 or not args[1].isdigit():
            await message.reply_text("Usage: <code>/auto del 2</code>", parse_mode="HTML")
            return
        removed = await db.delete_auto_reply(int(args[1]))
        await message.reply_text("Deleted." if removed else "No rule with that id.")
        return

    await message.reply_text(USAGE, parse_mode="HTML")
