# Nina Redlyn — channel bot

A private assistant for the Nina Redlyn Telegram channel. You write a post once,
in your own chat with the bot; the bot formats it, shows you exactly how it will
look, and either publishes it immediately or holds it until the time you set.

It also greets everyone who opens the bot, keeps them on a list you can message
later, forwards their questions to you, and keeps the discussion group clean.

**Two modes.** Set `CHANNEL_ID` and the bot publishes to your channel. Leave it
blank and it never posts anywhere and needs no administrator rights in any
chat — it just answers the people who write to it, and can still broadcast to
them. `/post` and `/scheduled` simply do not appear in that mode. Same for
`GROUP_ID`: blank means no moderation and no group to join.

---

## What it does

**Composing and scheduling.** `/post` walks you through it: send the text (or a
photo/video with its caption), add link buttons if you want them, look at the
preview, then **Publish now** or **Schedule**. Bold, italics, links, emoji and
hashtags all survive exactly as you typed them. Scheduling understands
`in 2h`, `18:30`, `tomorrow 9:00` and `20/08 18:30` — all in Casablanca time.

**Subscribers and broadcasts.** Everyone who taps _Start_ on the bot is saved.
`/broadcast` writes to all of them at once, in their private chat. It goes out in
batches so Telegram never rate-limits you, and anyone who has blocked the bot is
quietly dropped from the list.

**Questions from followers.** A follower writing to the bot lands in your chat,
labelled with their name. Reply to that message and your answer goes straight
back to them — they never see your personal account.

**Group moderation.** In the discussion group linked to the channel, the bot
removes outside links, known spam patterns, shouted messages and forwarded
promotions. Three removals in a week mutes that person for 24 hours. Your own
channel posts and group admins are never touched.

### Commands

| Command           | For       | What it does                                 |
| ----------------- | --------- | -------------------------------------------- |
| `/post`           | you       | Compose and publish or schedule              |
| `/scheduled`      | you       | The queue, with a cancel button on each      |
| `/broadcast`      | you       | Message every subscriber                     |
| `/stopbroadcast`  | you       | Halt one that is mid-flight                  |
| `/stats`          | you       | Subscribers, posts published, what is queued |
| `/cancel`         | you       | Abandon the draft you are writing            |
| `/start`, `/help` | followers | Join and reach you                           |

`/post` and `/scheduled` exist only when `CHANNEL_ID` is set.

---

## Setting it up

Roughly twenty minutes, once. You need a Telegram account, a free
[Supabase](https://supabase.com) account and a free [Vercel](https://vercel.com)
account.

### 1. Create the bot

In Telegram, open **@BotFather** → `/newbot`. Give it a name and a username.
He replies with a token that looks like `8123456789:AAF…`. Keep it — anyone who
has it controls the bot.

While you are there, send `/setprivacy` → pick your bot → **Disable**. Without
this the bot cannot see group messages, so moderation would do nothing.

### 2. Get the ids you need

- **Your user id** — write to **@userinfobot**, it replies with a number.
- **Channel** — if the channel is public, its id is just `@handle`. If it is
  private, forward any channel post to **@userinfobot** and use the
  `-100…` number it gives you.
- **Group** — same method, forward a group message to **@userinfobot**.

If you want the bot to publish, add it to the channel as an **administrator**
with _Post messages_ permission. If you want moderation, add it to the
discussion group as an administrator with _Delete messages_ and _Ban users_.

Running it as a private assistant only? Skip both — leave `CHANNEL_ID` and
`GROUP_ID` blank and the bot needs no rights anywhere.

### 3. Create the database

In Supabase: **New project** → wait for it to finish → **SQL Editor** → **New
query**. Paste the whole of [`supabase/schema.sql`](supabase/schema.sql) and hit
**Run**. From **Project settings → API**, copy the _Project URL_ and the
_service_role_ key.

> The service_role key bypasses all database rules. It only ever lives in the
> bot's server environment — never in a browser, never in this repository.

### 4. Deploy

Push this folder to a repository of its own, then import it in Vercel
(**Add New → Project**). Before the first deploy, add the environment
variables from [`.env.example`](.env.example) under **Settings → Environment
Variables**.

For the two secrets, generate real random values:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice — once for `WEBHOOK_SECRET`, once for `CRON_SECRET`.

### 5. Point Telegram at the deployment

Locally, copy `.env.example` to `.env`, fill in the same values, then:

```bash
npm install
npm run webhook:set -- https://your-project.vercel.app
```

That registers the webhook and installs the command menus. Check it with
`npm run webhook:info`.

Send `/start` to your bot. You should get the admin panel. That is everything.

---

## About the schedule

Scheduled posts are published by `/api/cron/tick`, which Vercel calls every
minute (`vercel.json`). (Only relevant when publishing is on.) **Minute-level cron needs a Vercel Pro plan** — the Hobby
plan only allows one run per day, which would make scheduling useless.

If you are staying on Hobby, use a free external scheduler instead — for example
[cron-job.org](https://cron-job.org): create a job hitting
`https://your-project.vercel.app/api/cron/tick` every minute, with a request
header `x-cron-secret` set to your `CRON_SECRET`. Then delete the `crons` block
from `vercel.json`.

Either way the endpoint refuses calls without the secret, and a post is claimed
in the database before it is sent, so two overlapping runs can never publish the
same post twice.

---

## Working on it

```bash
npm install
npm run dev            # long polling — no public URL needed
npm test               # 24 tests over config, formatting and scheduling
npm run typecheck
```

`npm run dev` runs the identical bot against Telegram's long-polling API and
ticks the scheduler in-process every 30 seconds. Run `npm run webhook:delete`
first — Telegram will not poll while a webhook is registered — and
`npm run webhook:set -- <url>` to switch back.

### How it fits together

```
api/
  telegram.ts        Webhook entry. Verifies Telegram's secret, hands off to grammY.
  cron/tick.ts       Heartbeat entry. Verifies CRON_SECRET, calls lib/tick.
src/
  config.ts          Every environment variable, validated once at boot.
  bot.ts             Wires the features together in order.
  db.ts              The only file that talks to Supabase.
  features/
    start.ts         /start, welcome, subscriber capture, block detection
    compose.ts       The post composer state machine
    schedule.ts      /scheduled, /stats
    broadcast.ts     /broadcast, /stopbroadcast
    moderation.ts    Group rules
    inquiries.ts     Follower messages in, admin replies out
  lib/
    format.ts        Telegram entities → HTML
    keyboard.ts      "Label - url" → inline keyboard
    publish.ts       One send path for preview and for the real thing
    time.ts          Human times → UTC instants, in the channel's timezone
    tick.ts          Publish due posts, advance the running broadcast
supabase/schema.sql  Run once, in the Supabase SQL editor
```

Because serverless functions keep nothing in memory between calls, the composer's
current step and draft live in the `admin_state` table rather than in a session
object. That is why the flow survives a redeploy mid-draft.

---

## Things worth knowing

**A broadcast cannot reach channel members.** Telegram forbids a bot from
messaging someone who has never written to it. `/broadcast` reaches everyone who
has tapped _Start_ — which is why the channel should link to the bot. `/stats`
shows that reachable number honestly.

**Media is stored by reference.** Posts keep Telegram's `file_id`, not the file
itself, so nothing large is ever stored and scheduled media posts cost nothing.

**Failed posts are not silent.** A scheduled post retries twice; if it still
fails, every admin gets a message saying which post and why.

**Everything is private by default.** Admin commands check your user id and
ignore everyone else, the webhook rejects calls without Telegram's secret token,
the cron endpoint rejects calls without its own, and every database table has row
level security on with no public policy.
