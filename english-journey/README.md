# English Journey

A personal English coach for Moroccan learners: goal-driven daily practice,
real-world expressions, listening that speeds up as you do, speaking with
coaching instead of red crosses, pronunciation drills, and review generated
from your own mistakes.

**The interface is in Moroccan Darija (الدارجة المغربية), the content being
learned is English.** Every explanation, instruction and piece of coaching is
in the language the learner thinks in; every word, phrase and dialogue being
taught stays in English. English is also available as an interface language.

The product philosophy, top to bottom:

> Goal → personalised plan → daily practice → real English → challenge →
> feedback → review → consistency → long-term progress.

## Running it

```bash
npm install
cp .env.example .env      # then fill in AUTH_SECRET
npm run dev               # http://localhost:3100
```

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`AUTH_SECRET` is required in production and falls back to a development value
when `NODE_ENV !== "production"`, so `npm run dev` works with no `.env` at all.

| Command             | What it does                       |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Dev server on :3100                |
| `npm run build`     | Production build                   |
| `npm start`         | Serve the production build         |
| `npm run lint`      | ESLint (flat config)               |
| `npm run typecheck` | `tsc --noEmit`, strict             |
| `npm test`          | All test suites                    |
| `npm run test:store` | Storage contract tests            |
| `npm run test:hydrate` | Stored-session hydration tests  |

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** in strict mode
  (`noUncheckedIndexedAccess` included).
- **Tailwind CSS v4** with design tokens in `src/app/globals.css`; light/dark
  are token swaps, so no component hardcodes a colour.
- **Visual identity**: deep navy ground (`#080B18`) with an electric purple →
  royal blue brand gradient, cyan for interactive/technology, green for success
  and amber for XP and streaks. Depth comes from CSS only — layered shadows,
  gradient hairline borders, inner highlights, backdrop blur and a capped 4.5°
  pointer tilt on desktop. No WebGL, no canvas, no 3D library.
- **No UI framework dependency** — the primitives in `src/components/ui` are
  small and owned.
- **Audio** uses the browser's `SpeechSynthesis` for playback and
  `SpeechRecognition` (where available) for repeat-and-compare. Everything
  degrades gracefully: no speech support means the transcript and a self-rating
  step instead.

## How it fits together

```
src/
  types/                 The domain model. Every layer speaks these types.
  content/               The authored corpus — the thing the app teaches.
    goals · vocabulary · real-english · listening · speaking
    pronunciation · grammar · immersion · achievements
  lib/
    db/                  DataStore interface + JSON-file implementation.
    repositories/        One module per aggregate, no framework imports.
    auth/                scrypt password hashing, signed session cookies.
    learning/            The engine: planner, SRS, difficulty, scoring,
                         insights, speaking grader, date helpers.
    ai/                  AIProvider interface + offline engine + OpenAI-
                         compatible provider.
    services/            Orchestration (a completed session → XP, streak,
                         difficulty change, review items, achievements).
  i18n/                  Locales, dictionaries (ar · en) and the client provider
  app/
    (auth)/              login · register
    onboarding/          Goal → level (+ optional placement) → destination → time
    (app)/               The signed-in shell and every feature page
    api/                 REST endpoints, all zod-validated
  components/            ui · shell · practice · features · charts
```

### Stored sessions are references, not snapshots

A planned session is persisted with the content it points at. That snapshot
goes stale — when the library gains a field or an exercise changes shape,
sessions already in the database still carry the old form. This shipped as a
bug once: answer options rendered blank in production because the payload shape
had changed underneath them, and local testing never caught it because the dev
data file was wiped between runs while production data is not.

`lib/learning/hydrate.ts` now re-resolves every payload against the content
library by id at render time, falling back to the stored copy. Content fixes
reach already-planned sessions instead of waiting for the next day, and both
payload shapes render correctly. `scripts/test-hydrate.ts` covers the legacy
shapes explicitly.

### Language

`src/i18n` holds two dictionaries. `en.ts` defines the shape; `ar.ts` is typed
against it, so a missing key is a build error rather than an English string
leaking into a Darija screen. The active locale lives in a cookie, is read on
the server, and sets `lang` and `dir` on `<html>` — so the first paint is
already in the right script and direction, with no flash.

Three details that decide whether this feels native or translated:

- **Generated coaching is not generated English.** The engine returns insight
  ids plus parameters (`{ id: "weakestSkill", params: { skill, score } }`), and
  the interface renders them per locale. The server never builds a sentence.
- **The English being taught is direction-isolated.** An English sentence inside
  an RTL paragraph otherwise has its full stop flipped to the front; the `<En>`
  wrapper (`unicode-bidi: isolate`) keeps it reading correctly.
- **Darija glosses live in the content, not the dictionary.** Every vocabulary
  word and real-English phrase carries a `darija` field — the meaning as a
  Moroccan would explain it to a friend — and warm-up answer options are built
  from it, so the learner chooses the meaning in the language they think in.

Arabic day counts are handled properly (نهار / نهارين / أيام), because getting
that wrong is the first thing a Moroccan reader notices.

### The learning engine

- **Planner** (`lib/learning/planner.ts`) builds the six-block session —
  warm-up, listening, context, speaking, pronunciation, challenge — scaling the
  time split to the learner's daily budget and pulling content by goal topic,
  level window and what's due for review. It's seeded per user per day, so
  reloading gives the same plan.
- **Difficulty** (`lib/learning/difficulty.ts`) implements the visible
  Challenge Level 1–5. Two strong sessions raise it; two weak ones lower it and
  flag the weak skills for targeted practice. The CEFR-ish level only moves
  after sustained work at a high challenge — levels are measured in weeks.
- **Spaced repetition** (`lib/learning/srs.ts`) is SM-2 with a shorter leash:
  a forgotten word returns tomorrow and loses ease; a mastered one stretches
  out to months.
- **Speaking feedback** (`lib/learning/speaking-grader.ts`) scores vocabulary,
  grammar, naturalness and communication, and always answers with what to do
  differently — never with "wrong".
- **Insights** (`lib/learning/insights.ts`) only states things the numbers
  support: days practised, accuracy delta, weakest skill, what tomorrow targets.
  There are no generic motivational quotes anywhere in the product.

### Data & persistence

`DataStore` (`lib/db/adapter.ts`) is a small document-store interface with two
implementations. `getStore()` picks one from the environment; repositories and
routes never know which is active.

| | When it's used | What it's for |
| --- | --- | --- |
| `JsonStore` | `DATABASE_URL` unset | Local development — one JSON file, written atomically, writes serialised through a promise queue. Nothing to install. |
| `PostgresStore` | `DATABASE_URL` set | Every real deployment. Durable, safe with concurrent writers, read-modify-write under a row lock. |

Postgres uses a single table, because the interface is a document store and
the schema should say so:

```sql
documents(collection text, id text, data jsonb, updated_at timestamptz,
          PRIMARY KEY (collection, id))
```

It's created on first use — no migration step. Predicate reads (`find`,
`findOne`) load a collection and filter in JavaScript, matching the interface's
semantics; collections are small and per-user, and if one ever isn't, the fix
is a purpose-built query on `PostgresStore` rather than a change to every
caller.

Both implementations are held to the same contract tests
(`scripts/test-store.ts`), which run against the file store always and against
a real Postgres when `TEST_DATABASE_URL` is set:

```bash
npm run test:store
TEST_DATABASE_URL=postgres://user:pass@localhost:5432/ej_test npm run test:store
```

### Deploying

The app lives in a sub-directory of this repository, so set the project's
**Root Directory** to `english-journey`.

Environment variables:

| Variable | Required | Notes |
| --- | --- | --- |
| `AUTH_SECRET` | yes | 32+ random characters. The app refuses to start in production without it. |
| `DATABASE_URL` | on serverless | Use the **pooled** connection string on Neon or Supabase — serverless functions open many short-lived connections. |
| `AI_PROVIDER`, `AI_API_KEY` | no | Omit to run on the built-in offline engine. |

Without `DATABASE_URL` a serverless deploy will appear to work and then lose
every account on the next request, because the filesystem is ephemeral. That is
the one configuration mistake worth being loud about.

Progress is real from the first session: a new account starts empty, and every
number on the dashboard comes from that user's own completed work.

### AI architecture

`AIProvider` (`lib/ai/types.ts`) is the seam. Nothing calls a model directly.

- `MockAIProvider` is the **offline engine** — the deterministic content engine
  that makes the app fully usable with no API key and no network.
- `OpenAIProvider` talks to any OpenAI-compatible `/v1/chat/completions`
  endpoint for the language work (speaking feedback, grammar explanations,
  extra examples, writing feedback), and **falls back to the offline engine on
  any error**, so a provider outage degrades instead of breaking.
- Session structure stays deterministic on purpose: the six-block spine is the
  product, not a model output.

Keys live in server-only environment variables (`AI_API_KEY`), are read in
`lib/ai/index.ts` (which imports `server-only`), and never reach the browser.

```bash
AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

## API

| Method | Route                     | Purpose                                  |
| ------ | ------------------------- | ---------------------------------------- |
| POST   | `/api/auth/register`      | Create an account and sign in            |
| POST   | `/api/auth/login`         | Sign in                                  |
| POST   | `/api/auth/logout`        | Sign out                                 |
| POST   | `/api/onboarding`         | Save goal/level/time, build the plan      |
| GET    | `/api/state`              | Everything the client shell needs         |
| PATCH  | `/api/profile`            | Change goal, level, time, destination     |
| POST   | `/api/session/start`      | Mark today's session in progress          |
| POST   | `/api/session/complete`   | Score, XP, streak, difficulty, review      |
| GET    | `/api/vocabulary`         | Words + this user's SRS state             |
| POST   | `/api/vocabulary/answer`  | Record an answer, advance the schedule     |
| GET    | `/api/review`             | Review queue                              |
| POST   | `/api/review/answer`      | Work one review item                       |
| POST   | `/api/speaking/grade`     | Coaching feedback on a spoken answer       |
| POST   | `/api/ai/explain`         | Ask the coach a grammar/usage question     |
| GET    | `/api/progress`           | Long-term stats and session history        |

## Content

The corpus in `src/content` is authored to sound like people, not textbooks —
"I'm gonna head out", "Can I run something by you?", "You alright?" — and every
entry is labelled **formal / neutral / casual / slang** with a note on when it
is and isn't appropriate. Slang is never taught without that context.

Immersion packs cover the USA, UK, Canada, Australia and Ireland: local
expressions, vocabulary differences, accent notes, cultural context, a real
conversation and where to find more input.

## Accessibility & responsiveness

Mobile-first, verified at 390px and 1440px **in both languages and both
writing directions**, with no horizontal overflow on any page and WCAG AA text
contrast audited across every screen. Layout uses logical properties
(`ms`/`me`, `ps`/`pe`, `start`/`end`) so RTL mirrors correctly, and directional
icons flip with `rtl:rotate-180`. The sidebar
becomes a floating bottom bar on phones, tap targets stay at 40px+, and the
heavier effects (drifting blobs, particles, tilt) are desktop-only so mid-range
Android stays smooth. Focus rings everywhere, `aria-current` on navigation, labelled controls,
`role="progressbar"` on progress bars, chart summaries in `aria-label`, and
`prefers-reduced-motion` respected.
