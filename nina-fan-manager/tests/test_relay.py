"""The relay is the heart of the tool: a wrong route means a private message
reaches the wrong person, so these cover routing rather than wording."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from telegram.error import Forbidden

from config import Config
from handlers import fan_inbox
from handlers.common import CONFIG, DB
from storage.db import Database
from tests.fakes import FakeBot, FakeContext, FakeMessage, FakeUpdate, FakeUser

ADMIN = 900
FAN = 111
OTHER_FAN = 222


def make_config(root: Path) -> Config:
    return Config(
        bot_token="x",
        admin_ids=(ADMIN,),
        db_path=root / "t.db",
        media_root=root / "media",
        welcome="Welcome.",
        log_level="CRITICAL",
        auto_reply_cooldown=600,
        broadcast_interval=0.0,
    )


class RelayTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.root = Path(tempfile.mkdtemp())
        self.cfg = make_config(self.root)
        self.db = await Database.connect(self.cfg.db_path)
        self.bot = FakeBot()
        self.bot_data = {DB: self.db, CONFIG: self.cfg}

    async def asyncTearDown(self) -> None:
        await self.db.close()

    def fan_context(self) -> FakeContext:
        return FakeContext(self.bot, self.bot_data)

    async def relay_in(self, fan_id: int, text: str, msg_id: int = 1) -> FakeMessage:
        message = FakeMessage(chat_id=fan_id, message_id=msg_id, text=text)
        update = FakeUpdate(user=FakeUser(fan_id, "Fan", username=f"u{fan_id}"), message=message)
        await fan_inbox.fan_message(update, self.fan_context())
        return message

    async def test_fan_message_reaches_the_admin_and_is_acknowledged(self) -> None:
        message = await self.relay_in(FAN, "hey there")

        to_admin = self.bot.to(ADMIN)
        self.assertEqual(len(to_admin), 1, "short text should cost one message")
        body = to_admin[0].payload["text"]
        self.assertIn("hey there", body)
        self.assertIn(str(FAN), body, "the admin needs the id to act on it")
        self.assertTrue(message.replies, "the fan should get a receipt")

    async def test_replying_to_a_relayed_message_answers_that_fan(self) -> None:
        await self.relay_in(FAN, "first")
        relayed_id = self.bot.to(ADMIN)[0].message_id

        reply = FakeMessage(
            chat_id=ADMIN,
            message_id=77,
            text="on its way",
            reply_to_message=FakeMessage(chat_id=ADMIN, message_id=relayed_id),
        )
        context = self.fan_context()
        await fan_inbox.admin_message(FakeUpdate(user=FakeUser(ADMIN), message=reply), context)

        delivered = self.bot.to(FAN)
        self.assertEqual(delivered[-1].method, "copy_message")
        self.assertEqual(delivered[-1].payload["source_message_id"], 77)
        self.assertEqual(reply.reactions, ["👍"], "the admin gets visual confirmation")

    async def test_two_fans_never_cross(self) -> None:
        await self.relay_in(FAN, "from one", msg_id=1)
        first_relay = self.bot.to(ADMIN)[0].message_id
        await self.relay_in(OTHER_FAN, "from two", msg_id=2)
        second_relay = self.bot.to(ADMIN)[1].message_id

        # Answer the FIRST fan after the second one has written — the naive
        # "reply to whoever wrote last" bug would misroute this.
        reply = FakeMessage(
            chat_id=ADMIN,
            message_id=78,
            text="for the first one",
            reply_to_message=FakeMessage(chat_id=ADMIN, message_id=first_relay),
        )
        await fan_inbox.admin_message(
            FakeUpdate(user=FakeUser(ADMIN), message=reply), self.fan_context()
        )

        self.assertNotEqual(first_relay, second_relay)
        self.assertTrue(self.bot.to(FAN), "the first fan should have received it")
        self.assertFalse(
            [m for m in self.bot.to(OTHER_FAN) if m.method == "copy_message"],
            "the second fan must not receive a reply meant for the first",
        )

    async def test_a_reply_to_something_unrelated_is_refused(self) -> None:
        reply = FakeMessage(
            chat_id=ADMIN,
            message_id=79,
            text="hello?",
            reply_to_message=FakeMessage(chat_id=ADMIN, message_id=4242),
        )
        await fan_inbox.admin_message(
            FakeUpdate(user=FakeUser(ADMIN), message=reply), self.fan_context()
        )
        self.assertFalse(self.bot.sent, "nothing should be delivered to anyone")
        self.assertIn("don't know who", reply.replies[0])

    async def test_a_blocking_fan_is_marked_and_reported(self) -> None:
        await self.relay_in(FAN, "hi")
        relayed_id = self.bot.to(ADMIN)[0].message_id
        self.bot.raise_on_send = Forbidden("blocked")

        reply = FakeMessage(
            chat_id=ADMIN,
            message_id=80,
            text="hello",
            reply_to_message=FakeMessage(chat_id=ADMIN, message_id=relayed_id),
        )
        await fan_inbox.admin_message(
            FakeUpdate(user=FakeUser(ADMIN), message=reply), self.fan_context()
        )

        fan = await self.db.get_fan(FAN)
        self.assertTrue(fan.is_blocked)
        self.assertIn("blocked", reply.replies[0].lower())
        self.assertNotIn(FAN, await self.db.audience(None))

    async def test_long_messages_arrive_as_a_header_plus_a_copy(self) -> None:
        await self.relay_in(FAN, "x" * (fan_inbox.INLINE_LIMIT + 1))
        to_admin = self.bot.to(ADMIN)
        self.assertEqual([m.method for m in to_admin], ["send_message", "copy_message"])

        # Both the header and the copy must route back to the fan.
        for message in to_admin:
            self.assertEqual(
                await self.db.fan_for_relay(ADMIN, message.message_id), FAN
            )


if __name__ == "__main__":
    unittest.main()
