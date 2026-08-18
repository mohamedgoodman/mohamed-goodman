"""The admin's own entry points: /start and /help."""

from __future__ import annotations

from telegram import Update
from telegram.ext import ContextTypes

HELP = """<b>Your control panel</b>

<b>Answering fans</b>
Reply to any message I forward you — it goes straight back to them.
<code>/fan &lt;id&gt;</code> — put someone in focus without a reply
<code>/whois</code> — who you're on right now

<b>Saved replies</b>
<code>/qr</code> — list · <code>/qr add &lt;name&gt; &lt;text&gt;</code> · <code>/qr del &lt;name&gt;</code>
<code>/q &lt;name&gt;</code> — send one

<b>Photos</b>
<code>/media</code> — what's in the library
<code>/send &lt;category&gt; [n]</code> — send one
<code>/browse &lt;category&gt;</code> — look first, then send

<b>Notes and tags</b>
<code>/note &lt;text&gt;</code> — private, only you see it
<code>/tag &lt;new|active|whale|inactive&gt;</code>
<code>/fans [tag]</code> — who's on file
<code>/stats</code> — the numbers

<b>Auto-replies</b> (pricing and other mechanics only)
<code>/auto</code> · <code>/auto add &lt;keyword&gt; | &lt;answer&gt;</code> · <code>/auto del &lt;id&gt;</code>

<b>Broadcast</b>
<code>/broadcast [tag]</code> — then send the message
<code>/cancel</code> — drop what you're composing

Every photo and every reply leaves because you sent it. Nothing writes on \
your behalf except the auto-replies you wrote yourself."""


async def admin_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.effective_message.reply_text(HELP, parse_mode="HTML")
