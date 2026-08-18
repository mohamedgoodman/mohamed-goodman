"""
Every database read and write in one place.

SQLite is plenty for a single creator's inbox: the whole thing is one file,
there is no server to run, and it survives restarts. Access is async so the
bot never blocks its event loop on disk.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from pathlib import Path

import aiosqlite

log = logging.getLogger(__name__)

#: Tags a fan can carry. `new` is assigned on first contact.
TAGS = ("new", "active", "whale", "inactive")

SCHEMA = """
CREATE TABLE IF NOT EXISTS fans (
    user_id       INTEGER PRIMARY KEY,
    username      TEXT,
    first_name    TEXT,
    last_name     TEXT,
    note          TEXT NOT NULL DEFAULT '',
    tag           TEXT NOT NULL DEFAULT 'new',
    is_blocked    INTEGER NOT NULL DEFAULT 0,
    first_seen    INTEGER NOT NULL,
    last_seen     INTEGER NOT NULL,
    message_count INTEGER NOT NULL DEFAULT 0
);

-- Maps a message sitting in the admin's chat back to the fan it came from,
-- so replying to it is enough to answer the right person.
CREATE TABLE IF NOT EXISTS relay_map (
    admin_chat_id INTEGER NOT NULL,
    admin_msg_id  INTEGER NOT NULL,
    fan_id        INTEGER NOT NULL,
    created_at    INTEGER NOT NULL,
    PRIMARY KEY (admin_chat_id, admin_msg_id)
);
CREATE INDEX IF NOT EXISTS relay_map_fan_idx ON relay_map (fan_id);

CREATE TABLE IF NOT EXISTS quick_replies (
    trigger    TEXT PRIMARY KEY,
    body       TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS auto_replies (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL UNIQUE,
    body    TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1
);

-- Remembers when an auto-reply last fired for a fan, so a fan who keeps
-- saying "price" is not answered by the machine over and over.
CREATE TABLE IF NOT EXISTS auto_reply_log (
    fan_id  INTEGER NOT NULL,
    auto_id INTEGER NOT NULL,
    sent_at INTEGER NOT NULL,
    PRIMARY KEY (fan_id, auto_id)
);

-- Telegram hands back a file_id for every upload. Reusing it makes the second
-- and every later send of the same photo instant, with no upload at all.
CREATE TABLE IF NOT EXISTS media_cache (
    path    TEXT PRIMARY KEY,
    size    INTEGER NOT NULL,
    mtime   INTEGER NOT NULL,
    file_id TEXT NOT NULL
);
"""


@dataclass
class Fan:
    user_id: int
    username: str | None
    first_name: str | None
    last_name: str | None
    note: str
    tag: str
    is_blocked: bool
    message_count: int

    @property
    def display(self) -> str:
        """A human label: real name if known, else the @handle, else the id."""
        name = " ".join(p for p in (self.first_name, self.last_name) if p)
        if name and self.username:
            return f"{name} (@{self.username})"
        if name:
            return name
        if self.username:
            return f"@{self.username}"
        return f"id {self.user_id}"


def _now() -> int:
    return int(time.time())


class Database:
    """Owns the single connection. Create with `await Database.connect(path)`."""

    def __init__(self, conn: aiosqlite.Connection) -> None:
        self._conn = conn

    @classmethod
    async def connect(cls, path: Path) -> "Database":
        path.parent.mkdir(parents=True, exist_ok=True)
        conn = await aiosqlite.connect(path)
        conn.row_factory = aiosqlite.Row
        # WAL keeps reads from blocking the write that a busy inbox is doing.
        await conn.execute("PRAGMA journal_mode=WAL")
        await conn.execute("PRAGMA foreign_keys=ON")
        await conn.executescript(SCHEMA)
        await conn.commit()
        log.info("database ready at %s", path)
        return cls(conn)

    async def close(self) -> None:
        await self._conn.close()

    # --- Fans --------------------------------------------------------------

    async def upsert_fan(
        self,
        user_id: int,
        username: str | None,
        first_name: str | None,
        last_name: str | None,
        *,
        count_message: bool = False,
    ) -> None:
        now = _now()
        await self._conn.execute(
            """
            INSERT INTO fans (user_id, username, first_name, last_name,
                              first_seen, last_seen, message_count)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                username      = excluded.username,
                first_name    = excluded.first_name,
                last_name     = excluded.last_name,
                last_seen     = excluded.last_seen,
                is_blocked    = 0,
                message_count = fans.message_count + ?
            """,
            (
                user_id,
                username,
                first_name,
                last_name,
                now,
                now,
                1 if count_message else 0,
                1 if count_message else 0,
            ),
        )
        await self._conn.commit()

    async def get_fan(self, user_id: int) -> Fan | None:
        async with self._conn.execute(
            "SELECT * FROM fans WHERE user_id = ?", (user_id,)
        ) as cur:
            row = await cur.fetchone()
        return _row_to_fan(row) if row else None

    async def set_note(self, user_id: int, note: str) -> None:
        await self._conn.execute(
            "UPDATE fans SET note = ? WHERE user_id = ?", (note, user_id)
        )
        await self._conn.commit()

    async def set_tag(self, user_id: int, tag: str) -> None:
        await self._conn.execute(
            "UPDATE fans SET tag = ? WHERE user_id = ?", (tag, user_id)
        )
        await self._conn.commit()

    async def mark_blocked(self, user_id: int) -> None:
        await self._conn.execute(
            "UPDATE fans SET is_blocked = 1 WHERE user_id = ?", (user_id,)
        )
        await self._conn.commit()

    async def list_fans(self, tag: str | None = None, limit: int = 50) -> list[Fan]:
        sql = "SELECT * FROM fans"
        params: list[object] = []
        if tag:
            sql += " WHERE tag = ?"
            params.append(tag)
        sql += " ORDER BY last_seen DESC LIMIT ?"
        params.append(limit)
        async with self._conn.execute(sql, params) as cur:
            rows = await cur.fetchall()
        return [_row_to_fan(r) for r in rows]

    async def audience(self, tag: str | None) -> list[int]:
        """Fans reachable by broadcast: everyone not known to have blocked us."""
        sql = "SELECT user_id FROM fans WHERE is_blocked = 0"
        params: list[object] = []
        if tag:
            sql += " AND tag = ?"
            params.append(tag)
        sql += " ORDER BY user_id"
        async with self._conn.execute(sql, params) as cur:
            rows = await cur.fetchall()
        return [int(r["user_id"]) for r in rows]

    async def counts_by_tag(self) -> dict[str, int]:
        async with self._conn.execute(
            "SELECT tag, COUNT(*) AS n FROM fans GROUP BY tag"
        ) as cur:
            rows = await cur.fetchall()
        return {str(r["tag"]): int(r["n"]) for r in rows}

    # --- Relay mapping -----------------------------------------------------

    async def remember_relay(
        self, admin_chat_id: int, admin_msg_id: int, fan_id: int
    ) -> None:
        await self._conn.execute(
            """
            INSERT OR REPLACE INTO relay_map
                (admin_chat_id, admin_msg_id, fan_id, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (admin_chat_id, admin_msg_id, fan_id, _now()),
        )
        await self._conn.commit()

    async def fan_for_relay(self, admin_chat_id: int, admin_msg_id: int) -> int | None:
        async with self._conn.execute(
            "SELECT fan_id FROM relay_map WHERE admin_chat_id = ? AND admin_msg_id = ?",
            (admin_chat_id, admin_msg_id),
        ) as cur:
            row = await cur.fetchone()
        return int(row["fan_id"]) if row else None

    # --- Quick replies -----------------------------------------------------

    async def save_quick_reply(self, trigger: str, body: str) -> None:
        await self._conn.execute(
            """
            INSERT INTO quick_replies (trigger, body, created_at) VALUES (?, ?, ?)
            ON CONFLICT(trigger) DO UPDATE SET body = excluded.body
            """,
            (trigger, body, _now()),
        )
        await self._conn.commit()

    async def get_quick_reply(self, trigger: str) -> str | None:
        async with self._conn.execute(
            "SELECT body FROM quick_replies WHERE trigger = ?", (trigger,)
        ) as cur:
            row = await cur.fetchone()
        return str(row["body"]) if row else None

    async def list_quick_replies(self) -> list[tuple[str, str]]:
        async with self._conn.execute(
            "SELECT trigger, body FROM quick_replies ORDER BY trigger"
        ) as cur:
            rows = await cur.fetchall()
        return [(str(r["trigger"]), str(r["body"])) for r in rows]

    async def delete_quick_reply(self, trigger: str) -> bool:
        cur = await self._conn.execute(
            "DELETE FROM quick_replies WHERE trigger = ?", (trigger,)
        )
        await self._conn.commit()
        return cur.rowcount > 0

    # --- Auto-replies ------------------------------------------------------

    async def add_auto_reply(self, keyword: str, body: str) -> None:
        await self._conn.execute(
            """
            INSERT INTO auto_replies (keyword, body) VALUES (?, ?)
            ON CONFLICT(keyword) DO UPDATE SET body = excluded.body, enabled = 1
            """,
            (keyword.lower(), body),
        )
        await self._conn.commit()

    async def list_auto_replies(self) -> list[tuple[int, str, str, bool]]:
        async with self._conn.execute(
            "SELECT id, keyword, body, enabled FROM auto_replies ORDER BY id"
        ) as cur:
            rows = await cur.fetchall()
        return [
            (int(r["id"]), str(r["keyword"]), str(r["body"]), bool(r["enabled"]))
            for r in rows
        ]

    async def delete_auto_reply(self, auto_id: int) -> bool:
        cur = await self._conn.execute(
            "DELETE FROM auto_replies WHERE id = ?", (auto_id,)
        )
        await self._conn.commit()
        return cur.rowcount > 0

    async def auto_reply_on_cooldown(
        self, fan_id: int, auto_id: int, cooldown: int
    ) -> bool:
        async with self._conn.execute(
            "SELECT sent_at FROM auto_reply_log WHERE fan_id = ? AND auto_id = ?",
            (fan_id, auto_id),
        ) as cur:
            row = await cur.fetchone()
        return bool(row) and _now() - int(row["sent_at"]) < cooldown

    async def record_auto_reply(self, fan_id: int, auto_id: int) -> None:
        await self._conn.execute(
            """
            INSERT INTO auto_reply_log (fan_id, auto_id, sent_at) VALUES (?, ?, ?)
            ON CONFLICT(fan_id, auto_id) DO UPDATE SET sent_at = excluded.sent_at
            """,
            (fan_id, auto_id, _now()),
        )
        await self._conn.commit()

    # --- Media cache -------------------------------------------------------

    async def cached_file_id(self, path: str, size: int, mtime: int) -> str | None:
        async with self._conn.execute(
            "SELECT size, mtime, file_id FROM media_cache WHERE path = ?", (path,)
        ) as cur:
            row = await cur.fetchone()
        if not row:
            return None
        # A replaced file keeps its name, so verify the bytes look the same.
        if int(row["size"]) != size or int(row["mtime"]) != mtime:
            return None
        return str(row["file_id"])

    async def cache_file_id(
        self, path: str, size: int, mtime: int, file_id: str
    ) -> None:
        await self._conn.execute(
            """
            INSERT INTO media_cache (path, size, mtime, file_id) VALUES (?, ?, ?, ?)
            ON CONFLICT(path) DO UPDATE SET
                size = excluded.size,
                mtime = excluded.mtime,
                file_id = excluded.file_id
            """,
            (path, size, mtime, file_id),
        )
        await self._conn.commit()


def _row_to_fan(row: aiosqlite.Row) -> Fan:
    return Fan(
        user_id=int(row["user_id"]),
        username=row["username"],
        first_name=row["first_name"],
        last_name=row["last_name"],
        note=str(row["note"]),
        tag=str(row["tag"]),
        is_blocked=bool(row["is_blocked"]),
        message_count=int(row["message_count"]),
    )
