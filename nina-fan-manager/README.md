# Nina Redlyn — fan desk

A Telegram bot that helps one creator handle a lot of fan messages without
losing track of anyone.

Fans message the bot. Their messages land in your Telegram chat, labelled with
their name, id, tag and whatever private note you left on them. You reply to
that message and your answer goes back to them. They never see your personal
account; you never have to remember who you were talking to.

**It does not write as you.** There is no persona and no generated
conversation. The only messages that leave without you pressing something are
the canned answers you wrote yourself for mechanical questions like pricing —
and even those are logged to you, so you can follow up.

---

## What it does

| | |
| --- | --- |
| **Fan inbox** | Every fan message forwarded to you, with name, id, tag and note. Reply to it to answer them. |
| **Saved replies** | The lines you type twenty times a day, stored once and sent with a tap. |
| **Photo library** | Folders of photos on disk. Browse, preview, send — always by your hand. |
| **Auto-replies** | Canned answers for pricing and other mechanics, with a per-fan cooldown. |
| **Notes and tags** | A private line on each fan, plus `new` / `active` / `whale` / `inactive`. |
| **Broadcast** | A message to one tag group, paced so Telegram never rate-limits you. |

### Commands

**Answering**

| Command | What it does |
| --- | --- |
| *(reply to a forwarded message)* | Answers that fan |
| `/fan <id>` | Put someone in focus without a message to reply to |
| `/whois` | Who you're on right now |

**Saved replies**

| Command | What it does |
| --- | --- |
| `/qr` | List them, with a send button on each |
| `/qr add <name> <text>` | Save or overwrite one |
| `/qr del <name>` | Remove one |
| `/q <name>` | Send one to the fan in focus |

**Photos**

| Command | What it does |
| --- | --- |
| `/media` | What the library holds |
| `/send <category>` | Send a random photo from it |
| `/send <category> <n>` | Send photo number n |
| `/browse <category>` | Page through, preview, then send |

**Fans**

| Command | What it does |
| --- | --- |
| `/note <text>` | Private note — only you ever see it |
| `/tag <new\|active\|whale\|inactive>` | Tag the fan in focus |
| `/fans [tag]` | Who's on file, most recent first |
| `/stats` | Totals, by tag, and how many are reachable |

**Auto-replies and broadcast**

| Command | What it does |
| --- | --- |
| `/auto` | List the rules |
| `/auto add <keyword> \| <answer>` | Add one |
| `/auto del <id>` | Remove one |
| `/broadcast [tag]` | Compose one, then confirm |
| `/cancel` | Drop what you're composing |

---

## Setup

You need Python 3.10 or newer and a Telegram account.

### 1. Create the bot

In Telegram, open **@BotFather** → `/newbot`. Give it a name and a username
ending in `bot`. He replies with a token like `8123456789:AAF…`.

Keep that token private — anyone holding it controls the bot completely.

### 2. Get your user id

Message **@userinfobot**. It replies with your numeric id.

### 3. Install

```bash
git clone <this repo>
cd nina-fan-manager

python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
```

Open `.env` and fill in `TELEGRAM_BOT_TOKEN` and `ADMIN_IDS`. Everything else
has a working default.

### 4. Add your photos

```bash
mkdir -p media/boudoir media/fullbody media/closeups
# copy your files into them
```

Folder names are yours to choose — they're what you'll type after `/send`, so
short and lowercase is easiest. The bot picks up new folders and new files
immediately, with no restart. See [`media/README.md`](media/README.md).

### 5. Run it

```bash
python main.py
```

Send `/start` to your bot. You should get the control panel. Ask a friend to
message it and watch their message arrive in your chat.

To keep it running on a server, see **Running it permanently** below.

---

## How it hangs together

```
main.py               Wires handlers to the bot and starts polling
config.py             Every environment variable, validated once at startup
medialib.py           The photo folders on disk — pure filesystem logic
handlers/
  common.py           Shared helpers, and "which fan is this about?"
  fan_inbox.py        The two-way relay, plus auto-reply matching
  quick_replies.py    Saved replies
  media.py            /media, /send, /browse and the preview buttons
  auto_replies.py     Managing the canned answers
  fans_admin.py       Notes, tags, listings, stats
  broadcast.py        Composing and draining a broadcast
  admin.py            /start and /help for you
storage/
  db.py               Every database read and write, in one file
  bot.db              SQLite, created on first run (git-ignored)
media/                Your photos (git-ignored)
tests/                31 tests, no network needed
```

### Two decisions worth knowing about

**Replies are routed by message id, not by "whoever wrote last."** Every
message the bot puts in your chat is recorded against the fan it came from. So
if three people write while you're typing, replying to the right message still
reaches the right person. There's a test for exactly that case.

**Photos are uploaded once.** Telegram hands back a `file_id` after the first
upload; the bot stores it and reuses it forever after, so the second and every
later send of the same photo is instant. The cache is keyed on file size and
modification time as well as path, so replacing a photo while keeping its
filename does not keep sending the old one.

---

## Running it permanently

The bot uses long polling, so it needs a process that stays up — a small VPS,
a Raspberry Pi, or any always-on machine. No public URL or HTTPS certificate
is needed.

With systemd:

```ini
# /etc/systemd/system/nina-bot.service
[Unit]
Description=Nina fan desk
After=network-online.target

[Service]
Type=simple
User=nina
WorkingDirectory=/home/nina/nina-fan-manager
ExecStart=/home/nina/nina-fan-manager/.venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now nina-bot
sudo journalctl -u nina-bot -f      # watch the logs
```

---

## Development

```bash
source .venv/bin/activate
python -m unittest discover -s tests -t .    # 31 tests, no token required
python -m pyflakes *.py handlers/*.py storage/*.py
```

The tests fake Telegram entirely — they exercise the real routing, targeting,
cooldown and caching logic without a network or a bot token.

---

## Things worth knowing

**You can only message people who messaged you first.** Telegram forbids bots
from writing to anyone who has not opened a chat with them. `/broadcast`
reaches everyone who has written to the bot, which is why the bot's link
belongs anywhere your fans already are. `/stats` reports that reachable number
honestly rather than implying you can reach everyone.

**Blocks are handled.** When someone blocks the bot, they're marked and
skipped by every later broadcast instead of burning attempts forever.

**Your photos never enter git.** `media/*/` and the database are both in
`.gitignore`.

**Nothing here impersonates you.** Auto-replies are for pricing, payment and
availability — facts a fan would get from a menu. If you want a warmer answer,
save it as a quick reply and send it yourself; that keeps you in the loop and
keeps fans talking to an actual person, which is what they're paying for.
