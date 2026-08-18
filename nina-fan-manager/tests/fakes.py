"""
Minimal stand-ins for the Telegram objects the handlers touch.

Handlers only ever receive an Update and a Context, so faking those two is
enough to exercise the real routing logic without a network or a bot token.
Every outbound call is recorded so a test can assert what the fan actually
received.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class SentMessage:
    method: str
    chat_id: int
    payload: dict[str, Any]
    message_id: int


class FakeBot:
    """Records outbound calls and hands back plausible message ids."""

    def __init__(self) -> None:
        self.sent: list[SentMessage] = []
        self._next_id = 1000
        #: Set to an exception to make the next delivery attempt fail.
        self.raise_on_send: Exception | None = None

    def _record(self, method: str, chat_id: int, **payload: Any) -> SentMessage:
        if self.raise_on_send is not None:
            error, self.raise_on_send = self.raise_on_send, None
            raise error
        self._next_id += 1
        message = SentMessage(method, chat_id, payload, self._next_id)
        self.sent.append(message)
        return message

    async def send_message(self, chat_id: int, text: str, **kwargs: Any):
        return self._record("send_message", chat_id, text=text, **kwargs)

    async def copy_message(self, chat_id: int, from_chat_id: int, message_id: int, **kw: Any):
        return self._record(
            "copy_message", chat_id, from_chat_id=from_chat_id,
            source_message_id=message_id, **kw
        )

    async def send_photo(self, chat_id: int, photo: Any, **kwargs: Any):
        message = self._record("send_photo", chat_id, photo=photo, **kwargs)
        # Telegram answers with the stored renditions; the largest carries the
        # file_id the caching layer wants.
        message.payload["photo_sizes"] = [FakePhotoSize(f"FILE{message.message_id}")]
        return _WithPhoto(message)

    # Convenience for assertions -------------------------------------------

    def to(self, chat_id: int) -> list[SentMessage]:
        return [m for m in self.sent if m.chat_id == chat_id]

    def texts_to(self, chat_id: int) -> list[str]:
        return [m.payload.get("text", "") for m in self.to(chat_id)]


@dataclass
class FakePhotoSize:
    file_id: str


class _WithPhoto:
    """A sent photo, exposing `.photo` the way python-telegram-bot does."""

    def __init__(self, message: SentMessage) -> None:
        self._message = message
        self.message_id = message.message_id
        self.photo = message.payload["photo_sizes"]


@dataclass
class FakeUser:
    id: int
    first_name: str | None = "Fan"
    last_name: str | None = None
    username: str | None = None


class FakeMessage:
    def __init__(
        self,
        *,
        chat_id: int,
        message_id: int = 1,
        text: str | None = None,
        caption: str | None = None,
        reply_to_message: "FakeMessage | None" = None,
    ) -> None:
        self.chat_id = chat_id
        self.message_id = message_id
        self.text = text
        self.caption = caption
        self.reply_to_message = reply_to_message
        self.replies: list[str] = []
        self.reactions: list[str] = []

    async def reply_text(self, text: str, **kwargs: Any):
        self.replies.append(text)
        return FakeMessage(chat_id=self.chat_id, message_id=self.message_id + 500, text=text)

    async def set_reaction(self, reaction: str, **kwargs: Any) -> None:
        self.reactions.append(reaction)


class FakeCallbackQuery:
    def __init__(self, data: str, message: FakeMessage) -> None:
        self.data = data
        self.message = message
        self.answers: list[tuple[str | None, bool]] = []
        self.edited_text: str | None = None
        self.markup_cleared = False

    async def answer(self, text: str | None = None, show_alert: bool = False) -> None:
        self.answers.append((text, show_alert))

    async def edit_message_text(self, text: str, **kwargs: Any) -> None:
        self.edited_text = text

    async def edit_message_reply_markup(self, **kwargs: Any) -> None:
        self.markup_cleared = True


class FakeUpdate:
    def __init__(
        self,
        *,
        user: FakeUser | None = None,
        message: FakeMessage | None = None,
        callback_query: FakeCallbackQuery | None = None,
    ) -> None:
        self.effective_user = user
        self.effective_message = message or (callback_query.message if callback_query else None)
        self.callback_query = callback_query
        self.my_chat_member = None


class FakeApplication:
    def __init__(self) -> None:
        self.tasks: list[Any] = []

    def create_task(self, coro):
        # Kept unawaited on purpose: tests drive the coroutine themselves when
        # they care about it, and close it otherwise.
        self.tasks.append(coro)
        return coro


class FakeContext:
    def __init__(self, bot: FakeBot, bot_data: dict, *, args: list[str] | None = None) -> None:
        self.bot = bot
        self.bot_data = bot_data
        self.user_data: dict[str, Any] = {}
        self.args = args or []
        self.application = FakeApplication()
        self.error: BaseException | None = None
