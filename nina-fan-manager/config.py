"""
Configuration, read once from the environment at startup.

A missing or malformed value fails here with a message that says what to fix,
rather than surfacing later as a confusing error inside a handler.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


class ConfigError(RuntimeError):
    """Raised when the environment is incomplete or invalid."""


def _require(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise ConfigError(
            f"{name} is not set. Copy .env.example to .env and fill it in."
        )
    return value


def _parse_admin_ids(raw: str) -> tuple[int, ...]:
    ids: list[int] = []
    for piece in raw.replace(",", " ").split():
        try:
            ids.append(int(piece))
        except ValueError as exc:
            raise ConfigError(
                f"ADMIN_IDS must be numeric Telegram user ids, got {piece!r}. "
                "Ask @userinfobot for yours."
            ) from exc
    if not ids:
        raise ConfigError("ADMIN_IDS is empty.")
    return tuple(ids)


DEFAULT_WELCOME = (
    "Hey, thanks for the message.\n\n"
    "Write whatever you want here and it reaches me directly — I read "
    "everything myself and answer here."
)


@dataclass(frozen=True)
class Config:
    bot_token: str
    admin_ids: tuple[int, ...]
    db_path: Path
    media_root: Path
    welcome: str
    log_level: str
    #: Seconds before the same auto-reply may fire again for the same fan.
    auto_reply_cooldown: int
    #: Pause between broadcast messages; Telegram tolerates ~30/second.
    broadcast_interval: float

    @property
    def primary_admin(self) -> int:
        """Where relayed fan messages land."""
        return self.admin_ids[0]


def load_config() -> Config:
    root = Path(__file__).resolve().parent
    return Config(
        bot_token=_require("TELEGRAM_BOT_TOKEN"),
        admin_ids=_parse_admin_ids(_require("ADMIN_IDS")),
        db_path=Path(os.environ.get("DB_PATH") or root / "storage" / "bot.db"),
        media_root=Path(os.environ.get("MEDIA_ROOT") or root / "media"),
        welcome=os.environ.get("WELCOME_MESSAGE", "").strip() or DEFAULT_WELCOME,
        log_level=os.environ.get("LOG_LEVEL", "INFO").upper(),
        auto_reply_cooldown=int(os.environ.get("AUTO_REPLY_COOLDOWN", "600")),
        broadcast_interval=float(os.environ.get("BROADCAST_INTERVAL", "0.05")),
    )
