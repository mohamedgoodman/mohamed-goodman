"""Auto-replies, targeting, saved replies and the photo library."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from handlers import auto_replies, fan_inbox, media, quick_replies
from handlers.common import ACTIVE_FAN, CONFIG, DB, resolve_target
from storage.db import Database
from tests.fakes import FakeBot, FakeContext, FakeMessage, FakeUpdate, FakeUser
from tests.test_relay import ADMIN, FAN, make_config

import medialib


class FeatureTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.root = Path(tempfile.mkdtemp())
        self.cfg = make_config(self.root)
        self.db = await Database.connect(self.cfg.db_path)
        self.bot = FakeBot()
        self.bot_data = {DB: self.db, CONFIG: self.cfg}
        await self.db.upsert_fan(FAN, "fan", "Fan", None)

    async def asyncTearDown(self) -> None:
        await self.db.close()

    def ctx(self, args: list[str] | None = None) -> FakeContext:
        return FakeContext(self.bot, self.bot_data, args=args)

    def admin_msg(self, text: str, reply_to_id: int | None = None) -> FakeMessage:
        return FakeMessage(
            chat_id=ADMIN,
            message_id=50,
            text=text,
            reply_to_message=(
                FakeMessage(chat_id=ADMIN, message_id=reply_to_id) if reply_to_id else None
            ),
        )

    # --- Auto-replies ------------------------------------------------------

    async def test_auto_reply_fires_once_then_respects_the_cooldown(self) -> None:
        await self.db.add_auto_reply("price", "Sets are 20€.")

        first = FakeMessage(chat_id=FAN, message_id=1, text="hey what's the PRICE?")
        await fan_inbox.fan_message(
            FakeUpdate(user=FakeUser(FAN), message=first), self.ctx()
        )
        self.assertIn("Sets are 20€.", first.replies)

        second = FakeMessage(chat_id=FAN, message_id=2, text="price again?")
        await fan_inbox.fan_message(
            FakeUpdate(user=FakeUser(FAN), message=second), self.ctx()
        )
        self.assertNotIn("Sets are 20€.", second.replies)

    async def test_an_auto_replied_message_still_reaches_the_admin(self) -> None:
        await self.db.add_auto_reply("price", "Sets are 20€.")
        message = FakeMessage(chat_id=FAN, message_id=1, text="price?")
        await fan_inbox.fan_message(
            FakeUpdate(user=FakeUser(FAN), message=message), self.ctx()
        )
        relayed = self.bot.texts_to(ADMIN)
        self.assertTrue(relayed)
        self.assertIn("Auto-replied", relayed[0])

    async def test_auto_add_requires_the_pipe_separator(self) -> None:
        message = self.admin_msg("/auto add price 20 euros")
        await auto_replies.auto_command(
            FakeUpdate(user=FakeUser(ADMIN), message=message), self.ctx(["add", "price", "20"])
        )
        self.assertIn("|", message.replies[0])
        self.assertEqual(await self.db.list_auto_replies(), [])

    async def test_auto_add_stores_keyword_and_body(self) -> None:
        message = self.admin_msg("/auto add price | Sets are 20€.")
        await auto_replies.auto_command(
            FakeUpdate(user=FakeUser(ADMIN), message=message),
            self.ctx(["add", "price", "|", "Sets", "are", "20€."]),
        )
        rules = await self.db.list_auto_replies()
        self.assertEqual([(r[1], r[2]) for r in rules], [("price", "Sets are 20€.")])

    # --- Targeting ---------------------------------------------------------

    async def test_a_reply_beats_the_active_fan(self) -> None:
        await self.db.remember_relay(ADMIN, 300, FAN)
        context = self.ctx()
        context.user_data[ACTIVE_FAN] = 999

        update = FakeUpdate(user=FakeUser(ADMIN), message=self.admin_msg("hi", reply_to_id=300))
        self.assertEqual(await resolve_target(update, context), FAN)
        self.assertEqual(context.user_data[ACTIVE_FAN], FAN, "focus should follow the reply")

    async def test_the_active_fan_is_used_when_there_is_no_reply(self) -> None:
        context = self.ctx()
        context.user_data[ACTIVE_FAN] = FAN
        update = FakeUpdate(user=FakeUser(ADMIN), message=self.admin_msg("hi"))
        self.assertEqual(await resolve_target(update, context), FAN)

    async def test_no_reply_and_no_active_fan_means_no_target(self) -> None:
        update = FakeUpdate(user=FakeUser(ADMIN), message=self.admin_msg("hi"))
        self.assertIsNone(await resolve_target(update, self.ctx()))

    # --- Saved replies -----------------------------------------------------

    async def test_a_saved_reply_goes_to_the_fan_in_focus(self) -> None:
        await self.db.save_quick_reply("welcome", "Thanks for subscribing!")
        context = self.ctx(["welcome"])
        context.user_data[ACTIVE_FAN] = FAN

        message = self.admin_msg("/q welcome")
        await quick_replies.q_command(FakeUpdate(user=FakeUser(ADMIN), message=message), context)

        delivered = self.bot.to(FAN)
        self.assertEqual(delivered[-1].payload["text"], "Thanks for subscribing!")

    async def test_a_saved_reply_without_a_target_sends_nothing(self) -> None:
        await self.db.save_quick_reply("welcome", "Thanks!")
        message = self.admin_msg("/q welcome")
        await quick_replies.q_command(
            FakeUpdate(user=FakeUser(ADMIN), message=message), self.ctx(["welcome"])
        )
        self.assertFalse(self.bot.sent)

    async def test_bad_trigger_names_are_rejected(self) -> None:
        message = self.admin_msg("/qr add Not A Name some text")
        await quick_replies.qr_command(
            FakeUpdate(user=FakeUser(ADMIN), message=message),
            self.ctx(["add", "Not A Name", "some"]),
        )
        self.assertEqual(await self.db.list_quick_replies(), [])

    # --- Photo library -----------------------------------------------------

    def stock_library(self) -> None:
        for category, names in {"boudoir": ["a.jpg", "b.jpg"], "full": ["c.png"]}.items():
            folder = self.cfg.media_root / category
            folder.mkdir(parents=True, exist_ok=True)
            for name in names:
                (folder / name).write_bytes(b"fake-image-bytes")

    async def test_send_delivers_a_photo_to_the_fan_in_focus(self) -> None:
        self.stock_library()
        context = self.ctx(["boudoir", "1"])
        context.user_data[ACTIVE_FAN] = FAN

        message = self.admin_msg("/send boudoir 1")
        await media.send_command(FakeUpdate(user=FakeUser(ADMIN), message=message), context)

        to_fan = [m for m in self.bot.to(FAN) if m.method == "send_photo"]
        self.assertEqual(len(to_fan), 1)

    async def test_a_photo_is_uploaded_once_then_reused_by_file_id(self) -> None:
        self.stock_library()
        context = self.ctx(["boudoir", "1"])
        context.user_data[ACTIVE_FAN] = FAN
        update = FakeUpdate(user=FakeUser(ADMIN), message=self.admin_msg("/send boudoir 1"))

        await media.send_command(update, context)
        await media.send_command(update, context)

        photos = [m for m in self.bot.to(FAN) if m.method == "send_photo"]
        self.assertEqual(len(photos), 2)
        # The first send uploads a file handle; the second reuses the id.
        self.assertNotIsInstance(photos[0].payload["photo"], str)
        self.assertIsInstance(photos[1].payload["photo"], str)

    async def test_send_without_a_target_delivers_nothing(self) -> None:
        self.stock_library()
        message = self.admin_msg("/send boudoir")
        await media.send_command(
            FakeUpdate(user=FakeUser(ADMIN), message=message), self.ctx(["boudoir"])
        )
        self.assertFalse([m for m in self.bot.sent if m.method == "send_photo"])

    async def test_an_unknown_category_is_reported_not_guessed(self) -> None:
        self.stock_library()
        context = self.ctx(["nope"])
        context.user_data[ACTIVE_FAN] = FAN
        message = self.admin_msg("/send nope")
        await media.send_command(FakeUpdate(user=FakeUser(ADMIN), message=message), context)
        self.assertFalse(self.bot.sent)
        self.assertIn("No category", message.replies[0])

    def test_browse_paging_covers_every_photo_exactly_once(self) -> None:
        folder = self.cfg.media_root / "big"
        folder.mkdir(parents=True, exist_ok=True)
        for n in range(20):
            (folder / f"{n:02d}.jpg").write_bytes(b"x")

        index = medialib.categories(self.cfg.media_root).index("big")
        seen: list[str] = []
        page = 0
        while True:
            text, markup = media._browse_page(self.cfg.media_root, index, page)
            seen += [
                b.callback_data
                for row in markup.inline_keyboard
                for b in row
                if b.callback_data.startswith("mp:")
            ]
            if "Next ›" not in str(markup):
                break
            page += 1

        self.assertEqual(len(seen), 20)
        self.assertEqual(len(set(seen)), 20, "no photo should appear on two pages")

    def test_browse_clamps_a_page_beyond_the_end(self) -> None:
        self.stock_library()
        index = medialib.categories(self.cfg.media_root).index("full")
        text, _ = media._browse_page(self.cfg.media_root, index, 99)
        self.assertIn("page 1/1", text)


if __name__ == "__main__":
    unittest.main()
