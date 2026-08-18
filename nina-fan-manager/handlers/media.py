"""
The photo library, driven entirely by the creator.

Nothing here fires on its own: every photo leaves because the creator ran a
command or pressed a button. Categories are just folders under the media root.
"""

from __future__ import annotations

import logging
from pathlib import Path

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.error import Forbidden, TelegramError
from telegram.ext import ContextTypes

import medialib
from handlers.common import NO_TARGET, config_of, db_of, esc, resolve_target

log = logging.getLogger(__name__)

#: Filenames per page of the browser.
PAGE_SIZE = 8


async def media_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """`/media` — what the library holds."""
    root = config_of(context).media_root
    stock = medialib.summary(root)

    if not stock:
        await update.effective_message.reply_text(
            "The library is empty.\n\n"
            f"Make folders under <code>{esc(str(root))}</code> — one per "
            "category — and drop photos in. They show up here immediately.",
            parse_mode="HTML",
        )
        return

    lines = ["<b>Photo library</b>", ""]
    lines += [f"<code>{esc(name)}</code> — {count} photo(s)" for name, count in stock]
    lines += [
        "",
        "<code>/send &lt;category&gt;</code> — send a random one",
        "<code>/send &lt;category&gt; &lt;n&gt;</code> — send a specific one",
        "<code>/browse &lt;category&gt;</code> — look through them first",
    ]
    await update.effective_message.reply_text("\n".join(lines), parse_mode="HTML")


async def send_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """`/send <category> [n]` — send a photo to the fan in focus."""
    message = update.effective_message
    args = context.args or []
    if not args:
        await message.reply_text(
            "Usage: <code>/send boudoir</code> or <code>/send boudoir 3</code>. "
            "/media lists the categories.",
            parse_mode="HTML",
        )
        return

    root = config_of(context).media_root
    category = medialib.resolve_category(root, args[0])
    if category is None:
        await message.reply_text("No category by that name — /media lists them.")
        return

    index = None
    if len(args) > 1:
        try:
            # Shown to the creator as 1-based; stored 0-based.
            index = int(args[1]) - 1
        except ValueError:
            await message.reply_text("The photo number has to be a number.")
            return

    photo = medialib.pick(root, category, index)
    if photo is None:
        await message.reply_text("No photo at that position in this category.")
        return

    fan_id = await resolve_target(update, context)
    if fan_id is None:
        await message.reply_text(NO_TARGET, parse_mode="HTML")
        return

    await deliver_photo(update, context, fan_id, photo)


async def browse_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """`/browse <category>` — page through filenames and preview before sending."""
    args = context.args or []
    root = config_of(context).media_root

    if not args:
        await media_command(update, context)
        return

    category = medialib.resolve_category(root, args[0])
    if category is None:
        await update.effective_message.reply_text("No category by that name.")
        return

    cat_index = medialib.categories(root).index(category)
    text, markup = _browse_page(root, cat_index, 0)
    await update.effective_message.reply_text(
        text, parse_mode="HTML", reply_markup=markup
    )


def _browse_page(root: Path, cat_index: int, page: int):
    """
    Render one page of a category.

    Photos are addressed by position in the sorted listing, which keeps
    callback data short. Adding or removing files shifts those positions, so
    the page is always rebuilt from disk rather than from a stale snapshot.
    """
    categories = medialib.categories(root)
    category = categories[cat_index]
    files = medialib.photos(root, category)
    pages = max(1, -(-len(files) // PAGE_SIZE))
    page = max(0, min(page, pages - 1))
    start = page * PAGE_SIZE

    rows = []
    for offset, path in enumerate(files[start : start + PAGE_SIZE]):
        position = start + offset
        rows.append(
            [
                InlineKeyboardButton(
                    f"{position + 1}. {path.name[:28]}",
                    callback_data=f"mp:{cat_index}:{position}",
                )
            ]
        )

    nav = []
    if page > 0:
        nav.append(InlineKeyboardButton("‹ Back", callback_data=f"mb:{cat_index}:{page - 1}"))
    if page < pages - 1:
        nav.append(InlineKeyboardButton("Next ›", callback_data=f"mb:{cat_index}:{page + 1}"))
    if nav:
        rows.append(nav)

    text = (
        f"<b>{esc(category)}</b> — {len(files)} photo(s), page {page + 1}/{pages}\n"
        "Tap one to preview it here before it goes anywhere."
    )
    return text, InlineKeyboardMarkup(rows)


async def browse_button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Page navigation."""
    query = update.callback_query
    _, cat_index, page = query.data.split(":")
    root = config_of(context).media_root

    if int(cat_index) >= len(medialib.categories(root)):
        await query.answer("That category is gone.")
        return

    await query.answer()
    text, markup = _browse_page(root, int(cat_index), int(page))
    await query.edit_message_text(text, parse_mode="HTML", reply_markup=markup)


async def preview_button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show the creator a photo, with a button to pass it on."""
    query = update.callback_query
    _, cat_index, photo_index = query.data.split(":")
    root = config_of(context).media_root

    photo = _photo_at(root, int(cat_index), int(photo_index))
    if photo is None:
        await query.answer("That photo is no longer there.")
        return

    await query.answer()
    fan_id = await resolve_target(update, context)
    fan = await db_of(context).get_fan(fan_id) if fan_id else None

    caption = f"<code>{esc(photo.name)}</code>"
    keyboard = None
    if fan:
        caption += f"\nSend to <b>{esc(fan.display)}</b>?"
        keyboard = InlineKeyboardMarkup(
            [[InlineKeyboardButton("Send it", callback_data=f"ms:{cat_index}:{photo_index}")]]
        )
    else:
        caption += "\n<i>Pick a fan first — reply to one, or /fan &lt;id&gt;.</i>"

    await _send_photo(context, query.message.chat_id, photo, caption, keyboard)


async def send_button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Confirmed from the preview."""
    query = update.callback_query
    _, cat_index, photo_index = query.data.split(":")
    root = config_of(context).media_root

    photo = _photo_at(root, int(cat_index), int(photo_index))
    if photo is None:
        await query.answer("That photo is no longer there.")
        return

    fan_id = await resolve_target(update, context)
    if fan_id is None:
        await query.answer("Pick a fan first.", show_alert=True)
        return

    await query.answer("Sending…")
    await query.edit_message_reply_markup(reply_markup=None)
    await deliver_photo(update, context, fan_id, photo)


def _photo_at(root: Path, cat_index: int, photo_index: int) -> Path | None:
    categories = medialib.categories(root)
    if cat_index >= len(categories):
        return None
    return medialib.pick(root, categories[cat_index], photo_index)


async def deliver_photo(
    update: Update, context: ContextTypes.DEFAULT_TYPE, fan_id: int, photo: Path
) -> None:
    db = db_of(context)
    try:
        await _send_photo(context, fan_id, photo, caption=None, keyboard=None)
    except Forbidden:
        await db.mark_blocked(fan_id)
        await update.effective_message.reply_text(
            "They have blocked the bot — the photo was not sent."
        )
        return
    except TelegramError:
        log.exception("sending %s to %s failed", photo, fan_id)
        await update.effective_message.reply_text("Telegram refused that photo.")
        return

    fan = await db.get_fan(fan_id)
    await update.effective_message.reply_text(
        f"📷 <code>{esc(photo.name)}</code> → <b>{esc(fan.display if fan else str(fan_id))}</b>",
        parse_mode="HTML",
    )


async def _send_photo(
    context: ContextTypes.DEFAULT_TYPE,
    chat_id: int,
    photo: Path,
    caption: str | None,
    keyboard: InlineKeyboardMarkup | None,
):
    """
    Send a photo, reusing Telegram's file_id after the first upload.

    The cache is keyed on size and mtime as well as path, so replacing a file
    while keeping its name does not send the old picture forever.
    """
    db = db_of(context)
    stat = photo.stat()
    key = str(photo.resolve())
    file_id = await db.cached_file_id(key, stat.st_size, int(stat.st_mtime))

    if file_id:
        message = await context.bot.send_photo(
            chat_id, file_id, caption=caption, parse_mode="HTML" if caption else None,
            reply_markup=keyboard,
        )
    else:
        with photo.open("rb") as handle:
            message = await context.bot.send_photo(
                chat_id, handle, caption=caption,
                parse_mode="HTML" if caption else None, reply_markup=keyboard,
            )
        if message.photo:
            await db.cache_file_id(
                key, stat.st_size, int(stat.st_mtime), message.photo[-1].file_id
            )
    return message
