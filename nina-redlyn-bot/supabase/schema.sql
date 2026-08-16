-- ---------------------------------------------------------------------------
-- Nina Redlyn bot — database schema
-- Run this once in the Supabase SQL editor (Database > SQL Editor > New query).
--
-- Every table is service-role only: the bot talks to Supabase with the service
-- key from a server, and nothing here is ever exposed to a browser. RLS is
-- enabled with no permissive policy, so an accidentally leaked anon key still
-- reads nothing.
-- ---------------------------------------------------------------------------

-- Subscribers -----------------------------------------------------------------
-- Everyone who has ever opened a private chat with the bot. These are the
-- people a broadcast can reach — Telegram does not allow messaging channel
-- members who never wrote to the bot.
create table if not exists subscribers (
  user_id      bigint primary key,
  username     text,
  first_name   text,
  last_name    text,
  language     text,
  source       text,                                   -- deep-link payload
  is_active    boolean     not null default true,      -- false once they block
  joined_at    timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists subscribers_active_idx
  on subscribers (is_active, user_id);

-- Posts ------------------------------------------------------------------------
-- One row per composed post. `draft` while being written, `scheduled` until its
-- time comes, then `published` or `failed`.
create table if not exists posts (
  id            bigserial primary key,
  author_id     bigint      not null,
  status        text        not null default 'draft'
                check (status in ('draft', 'scheduled', 'published', 'failed')),
  body_html     text        not null default '',
  media_type    text        check (media_type in ('photo', 'video', 'animation', 'document', 'audio')),
  media_file_id text,
  buttons       jsonb       not null default '[]'::jsonb,
  scheduled_at  timestamptz,
  published_at  timestamptz,
  message_id    bigint,                                -- id inside the channel
  error         text,
  attempts      int         not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists posts_due_idx
  on posts (status, scheduled_at)
  where status = 'scheduled';

-- Broadcasts -------------------------------------------------------------------
-- A broadcast is drained in batches by the cron worker so a large audience
-- never runs into a serverless timeout or Telegram's rate limits.
create table if not exists broadcasts (
  id           bigserial primary key,
  author_id    bigint      not null,
  body_html    text        not null,
  buttons      jsonb       not null default '[]'::jsonb,
  status       text        not null default 'running'
               check (status in ('running', 'done', 'cancelled')),
  cursor_id    bigint      not null default 0,         -- last user_id handled
  sent_count   int         not null default 0,
  failed_count int         not null default 0,
  created_at   timestamptz not null default now(),
  finished_at  timestamptz
);

create index if not exists broadcasts_running_idx
  on broadcasts (status, id)
  where status = 'running';

-- Admin composer state ---------------------------------------------------------
-- The composer is a small state machine. Serverless functions keep no memory
-- between calls, so the current step and draft live here.
create table if not exists admin_state (
  user_id    bigint primary key,
  step       text        not null,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Inquiries --------------------------------------------------------------------
-- Messages from people who are not admins. Forwarded to the admins, who reply
-- by replying to the forwarded copy.
create table if not exists inquiries (
  id              bigserial primary key,
  user_id         bigint      not null,
  username        text,
  body            text        not null,
  admin_chat_id   bigint,
  admin_msg_id    bigint,                              -- forwarded copy
  answered        boolean     not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists inquiries_admin_msg_idx
  on inquiries (admin_chat_id, admin_msg_id);

-- Moderation warnings ----------------------------------------------------------
create table if not exists warnings (
  id         bigserial primary key,
  chat_id    bigint      not null,
  user_id    bigint      not null,
  reason     text        not null,
  created_at timestamptz not null default now()
);

create index if not exists warnings_recent_idx
  on warnings (chat_id, user_id, created_at desc);

-- Lock down every table --------------------------------------------------------
alter table subscribers  enable row level security;
alter table posts        enable row level security;
alter table broadcasts   enable row level security;
alter table admin_state  enable row level security;
alter table inquiries    enable row level security;
alter table warnings     enable row level security;
