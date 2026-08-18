"""
Nina Redlyn — fan desk.

An operational tool for one creator: fans write to the bot, their messages
land in the creator's chat, and the creator answers from there. Photos, saved
replies and broadcasts all leave under the creator's hand.

Run it with:  python main.py
"""

from __future__ import annotations

import logging
import sys
import traceback

from dotenv import load_dotenv
from telegram import Update
from telegram.error import InvalidToken, NetworkError, TelegramError
from telegram.ext import (
    AIORateLimiter,
    Application,
    ApplicationBuilder,
    CallbackQueryHandler,
    ChatMemberHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    PicklePersistence,
    filters,
)

from config import Config, ConfigError, load_config
from handlers import admin, auto_replies, broadcast, fan_inbox, fans_admin, media
from handlers import quick_replies
from handlers.common import CONFIG, DB
from storage.db import Database

log = logging.getLogger("ninabot")


def setup_logging(level: str) -> None:
    logging.basicConfig(
        format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
        datefmt="%H:%M:%S",
        level=getattr(logging, level, logging.INFO),
    )
    # httpx logs every API call at INFO, which drowns everything else.
    logging.getLogger("httpx").setLevel(logging.WARNING)


async def on_startup(application: Application) -> None:
    """Open the database and hang the shared objects off the application."""
    cfg: Config = application.bot_data[CONFIG]
    application.bot_data[DB] = await Database.connect(cfg.db_path)
    cfg.media_root.mkdir(parents=True, exist_ok=True)

    me = await application.bot.get_me()
    log.info("running as @%s — admins: %s", me.username, ", ".join(map(str, cfg.admin_ids)))


async def on_shutdown(application: Application) -> None:
    database: Database | None = application.bot_data.get(DB)
    if database is not None:
        await database.close()
    log.info("stopped cleanly")


async def on_error(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Last line of defence.

    One handler blowing up must never take the bot down, and the creator
    should hear about it rather than wonder why a message went nowhere.
    """
    log.error("unhandled error", exc_info=context.error)

    cfg: Config | None = context.bot_data.get(CONFIG)
    if cfg is None:
        return

    detail = "".join(
        traceback.format_exception(
            type(context.error), context.error, context.error.__traceback__
        )
    )[-1200:]
    try:
        await context.bot.send_message(
            cfg.primary_admin,
            f"Something broke while handling an update:\n<pre>{detail}</pre>",
            parse_mode="HTML",
        )
    except TelegramError:
        log.exception("could not report the error to the admin")


def build_application(cfg: Config) -> Application:
    persistence = PicklePersistence(filepath=cfg.db_path.with_suffix(".state"))

    application = (
        ApplicationBuilder()
        .token(cfg.bot_token)
        .persistence(persistence)
        # Queues requests instead of tripping Telegram's flood limits.
        .rate_limiter(AIORateLimiter())
        .post_init(on_startup)
        .post_shutdown(on_shutdown)
        .build()
    )
    application.bot_data[CONFIG] = cfg

    is_admin = filters.User(user_id=list(cfg.admin_ids))
    private = filters.ChatType.PRIVATE
    admin_only = private & is_admin
    fan_only = private & ~is_admin

    # --- Admin commands ----------------------------------------------------
    application.add_handler(CommandHandler(["start", "help"], admin.admin_start, filters=admin_only))

    application.add_handler(CommandHandler("qr", quick_replies.qr_command, filters=admin_only))
    application.add_handler(CommandHandler("q", quick_replies.q_command, filters=admin_only))

    application.add_handler(CommandHandler("media", media.media_command, filters=admin_only))
    application.add_handler(CommandHandler("send", media.send_command, filters=admin_only))
    application.add_handler(CommandHandler("browse", media.browse_command, filters=admin_only))

    application.add_handler(CommandHandler("fan", fans_admin.fan_command, filters=admin_only))
    application.add_handler(CommandHandler("whois", fans_admin.whois_command, filters=admin_only))
    application.add_handler(CommandHandler("note", fans_admin.note_command, filters=admin_only))
    application.add_handler(CommandHandler("tag", fans_admin.tag_command, filters=admin_only))
    application.add_handler(CommandHandler("fans", fans_admin.fans_command, filters=admin_only))
    application.add_handler(CommandHandler("stats", fans_admin.stats_command, filters=admin_only))

    application.add_handler(CommandHandler("auto", auto_replies.auto_command, filters=admin_only))

    application.add_handler(CommandHandler("broadcast", broadcast.broadcast_command, filters=admin_only))
    application.add_handler(CommandHandler("cancel", broadcast.cancel_command, filters=admin_only))

    # --- Buttons -----------------------------------------------------------
    application.add_handler(CallbackQueryHandler(quick_replies.qr_button, pattern=r"^qr:"))
    application.add_handler(CallbackQueryHandler(media.browse_button, pattern=r"^mb:"))
    application.add_handler(CallbackQueryHandler(media.preview_button, pattern=r"^mp:"))
    application.add_handler(CallbackQueryHandler(media.send_button, pattern=r"^ms:"))
    application.add_handler(CallbackQueryHandler(broadcast.broadcast_button, pattern=r"^bc:"))

    # --- Fan side ----------------------------------------------------------
    application.add_handler(CommandHandler("start", fan_inbox.fan_start, filters=fan_only))

    # Free-form messages last, so no command is ever swallowed by them.
    application.add_handler(MessageHandler(admin_only & ~filters.COMMAND, fan_inbox.admin_message))
    application.add_handler(MessageHandler(fan_only & ~filters.COMMAND, fan_inbox.fan_message))

    application.add_handler(
        ChatMemberHandler(fan_inbox.on_chat_member, ChatMemberHandler.MY_CHAT_MEMBER)
    )

    application.add_error_handler(on_error)
    return application


def main() -> int:
    load_dotenv()
    try:
        cfg = load_config()
    except ConfigError as exc:
        print(f"Configuration problem: {exc}", file=sys.stderr)
        return 1

    setup_logging(cfg.log_level)
    application = build_application(cfg)

    log.info("starting up — press Ctrl+C to stop")
    try:
        application.run_polling(
            allowed_updates=Update.ALL_TYPES,
            drop_pending_updates=True,
        )
    except InvalidToken:
        # A stack trace here would bury the one thing worth reading.
        print(
            "Telegram rejected TELEGRAM_BOT_TOKEN.\n"
            "Check it against @BotFather — /mybots, pick the bot, API Token.",
            file=sys.stderr,
        )
        return 1
    except NetworkError as exc:
        print(
            f"Could not reach Telegram: {exc}\n"
            "Check the machine's internet connection, and any proxy or "
            "firewall between it and api.telegram.org.",
            file=sys.stderr,
        )
        return 1
    except KeyboardInterrupt:
        log.info("interrupted")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
