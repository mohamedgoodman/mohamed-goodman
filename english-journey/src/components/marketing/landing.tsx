import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Ear,
  Flame,
  Globe2,
  Mic,
  Repeat2,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PILLARS = [
  {
    icon: Target,
    title: "Start from a goal, not a syllabus",
    body: "Work, travel, immigration, business, friends, films. Your goal decides the vocabulary, the situations and the accent you train against.",
  },
  {
    icon: Ear,
    title: "Listening that gets harder on purpose",
    body: "Easy → Normal → Challenging → Native speed. When you handle a tier, you leave it. Nobody improves by staying comfortable.",
  },
  {
    icon: Mic,
    title: "Speaking with feedback, not red crosses",
    body: "Real situations. You answer out loud, and you get coaching on vocabulary, grammar, naturalness and whether your meaning actually landed.",
  },
  {
    icon: Globe2,
    title: "Real English, not textbook English",
    body: "“I'm gonna head out.” “Can I run something by you?” Plus when each one is appropriate — and when it isn't.",
  },
  {
    icon: Repeat2,
    title: "Review driven by your mistakes",
    body: "Spaced repetition. What you keep forgetting comes back sooner. What you own disappears from rotation.",
  },
  {
    icon: BarChart3,
    title: "Progress measured in months",
    body: "Streaks, minutes, listening accuracy, level progression. Real numbers from your own sessions — never a fake demo dashboard.",
  },
];

const FLOW = [
  "Goal",
  "Personalised plan",
  "Daily practice",
  "Real English",
  "Challenge",
  "Feedback",
  "Review",
  "Consistency",
];

const BLOCKS: [string, number][] = [
  ["Warm-up", 3],
  ["Listening", 7],
  ["Context", 5],
  ["Speaking", 5],
  ["Pronunciation", 5],
  ["Challenge", 5],
];

const SESSION_STEPS: [string, string][] = [
  ["Warm-up", "Phrases and words, including anything due for review."],
  ["Listening", "Natural dialogue at your current speed. Transcript after the attempt."],
  ["Context", "How the expressions are really used — register, tone, the grammar behind them."],
  ["Speaking", "One situation. You answer, you get coached."],
  ["Pronunciation", "Listen, repeat, compare. Clarity over accent."],
  ["Challenge", "Deliberately above your level. You're not meant to catch everything."],
];

export function Landing() {
  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-8 place-items-center rounded-xl bg-brand text-white">EJ</span>
            <span>English Journey</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Start free</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pt-14 pb-16 sm:pt-20 sm:pb-24">
          <div className="animate-in-up max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand-strong">
              <Sparkles className="size-4" />
              A coach, not a dictionary
            </span>
            <h1 className="mt-6 text-4xl leading-[1.08] font-bold sm:text-6xl">
              Build the English you
              <span className="text-brand"> actually need.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted sm:text-xl">
              English Journey trains English like a muscle: a structured session every day, real-world
              expressions, listening that speeds up as you do, speaking with honest feedback, and review
              built from your own mistakes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="xl" className="w-full sm:w-auto">
                  Start your journey
                  <ArrowRight className="size-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  I already have an account
                </Button>
              </Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted">
              <Flame className="size-4 text-accent" />
              10 minutes a day is enough to start. Consistency beats intensity.
            </p>
          </div>

          <div className="scrollbar-none mt-14 flex gap-2 overflow-x-auto pb-2">
            {FLOW.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-surface px-3.5 py-2 text-sm whitespace-nowrap">
                  {step}
                </span>
                {index < FLOW.length - 1 ? (
                  <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-bg-subtle py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-2xl font-semibold sm:text-3xl">How it works</h2>
            <p className="mt-2 max-w-2xl text-muted">
              Six ideas the whole product is built on. No gimmicks, no streak guilt, no fake progress.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PILLARS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="card p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-strong">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">A real session, every day</h2>
              <p className="mt-3 text-muted">
                Your daily plan is generated from your goal, your level and the time you actually have.
                Six blocks, scaled to 10 minutes or to an hour.
              </p>
              <ul className="mt-6 space-y-3">
                {SESSION_STEPS.map(([title, body]) => (
                  <li key={title} className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    <span>
                      <strong className="font-medium">{title}</strong>
                      <span className="text-muted"> — {body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">Today&apos;s mission</p>
                  <p className="mt-1 font-medium">Understand 5 minutes of natural English.</p>
                </div>
                <span className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium whitespace-nowrap text-accent">
                  Level 3 · Real English
                </span>
              </div>
              <div className="space-y-2.5">
                {BLOCKS.map(([label, minutes]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm sm:w-28">{label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${(minutes / 7) * 100}%` }} />
                    </div>
                    <span className="w-12 shrink-0 text-right text-sm text-muted tabular-nums">
                      {minutes} min
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted">
                Illustration of a 30-minute plan. Your own plan is generated from your answers.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-bg-subtle py-16">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Six days a week beats one perfect day</h2>
            <p className="mt-3 text-muted">
              Progress is measured over weeks and months. English Journey shows you the numbers so you
              can see it happening — and tells you exactly what tomorrow will target.
            </p>
            <Link href="/register" className="mt-8 inline-block">
              <Button size="xl">
                Create your free account
                <ArrowRight className="size-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>English Journey — goal → plan → practice → feedback → review → progress.</p>
          <p>Built as a complete learning system, not a word list.</p>
        </div>
      </footer>
    </div>
  );
}
