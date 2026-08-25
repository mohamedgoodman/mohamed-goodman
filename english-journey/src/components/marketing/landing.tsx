"use client";

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
import { useI18n } from "@/i18n/provider";
import { HeroIllustration } from "@/components/visual/illustrations";
import { LOCALES, LOCALE_META } from "@/i18n/config";

const PILLAR_ICONS = [Target, Ear, Mic, Globe2, Repeat2, BarChart3] as const;
const PILLAR_KEYS = ["goal", "listening", "speaking", "real", "review", "progress"] as const;

const BLOCKS: [
  "warmup" | "listening" | "context" | "speaking" | "pronunciation" | "challenge",
  number,
][] = [
  ["warmup", 3],
  ["listening", 7],
  ["context", 5],
  ["speaking", 5],
  ["pronunciation", 5],
  ["challenge", 5],
];

export function Landing() {
  const { t, locale, setLocale } = useI18n();
  const blockKeys = ["warmup", "listening", "context", "speaking", "pronunciation", "challenge"] as const;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-9 place-items-center rounded-xl text-white shadow-[0_4px_16px_rgba(124,58,237,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] [background:var(--grad-brand)]">
              EJ
            </span>
            <span>{t.common.appName}</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="inline-flex">
              <Button variant="ghost" size="sm">
                {t.auth.signIn}
              </Button>
            </Link>
            <Link href="/register" className="inline-flex">
              <Button size="sm">{t.landing.ctaPrimary}</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pt-14 pb-16 sm:pt-20 sm:pb-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div className="animate-in-up max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple/30 bg-brand-soft px-3.5 py-1.5 text-sm font-medium text-on-brand backdrop-blur">
              <Sparkles className="size-4" />
              {t.landing.badge}
            </span>
            <h1 className="mt-6 text-4xl leading-[1.08] font-bold sm:text-6xl">
              {t.landing.titleA} <span className="brand-text">{t.landing.titleB}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted sm:text-xl">
              {t.landing.subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex">
                <Button size="xl" className="w-full sm:w-auto">
                  {t.landing.ctaPrimary}
                  <ArrowRight className="size-5 rtl:rotate-180" />
                </Button>
              </Link>
              <Link href="/login" className="inline-flex">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  {t.landing.ctaSecondary}
                </Button>
              </Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted">
              <Flame className="size-4 animate-flame text-on-accent" />
              {t.landing.consistency}
            </p>
          </div>

          <HeroIllustration className="animate-fade mx-auto w-full max-w-sm lg:max-w-none" />
          </div>

          <div className="scrollbar-none mt-14 flex gap-2 overflow-x-auto pb-2">
            {t.landing.flow.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-border-strong bg-surface/60 px-3.5 py-2 text-sm whitespace-nowrap backdrop-blur">
                  {step}
                </span>
                {index < t.landing.flow.length - 1 ? (
                  <ArrowRight className="size-4 shrink-0 text-muted rtl:rotate-180" aria-hidden />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-bg-subtle/60 py-16 backdrop-blur sm:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-2xl font-semibold sm:text-3xl">{t.landing.howTitle}</h2>
            <p className="mt-2 max-w-2xl text-muted">{t.landing.howSubtitle}</p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PILLAR_KEYS.map((key, index) => {
                const Icon = PILLAR_ICONS[index]!;
                const pillar = t.landing.pillars[key];
                return (
                  <div key={key} className="card lift group p-6">
                    <span className="grid size-12 place-items-center rounded-xl text-white shadow-[0_6px_18px_rgba(124,58,237,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-300 group-hover:scale-105 [background:var(--grad-brand)]">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-semibold">{pillar.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{pillar.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">{t.landing.sessionTitle}</h2>
              <p className="mt-3 text-muted">{t.landing.sessionSubtitle}</p>
              <ul className="mt-6 space-y-3">
                {blockKeys.map((key) => (
                  <li key={key} className="flex gap-3">
                    <span
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-purple shadow-[0_0_8px_rgba(124,58,237,0.8)]"
                      aria-hidden
                    />
                    <span>
                      <strong className="font-medium">{t.content.blocks[key].title}</strong>
                      <span className="text-muted"> — {t.content.blocks[key].description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card card-elevated glow-purple space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">{t.dashboard.todayMission}</p>
                  <p className="mt-1 font-medium">{t.content.goals.general.blurb}</p>
                </div>
                <span className="rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-xs font-medium whitespace-nowrap text-on-accent">
                  {t.dashboard.level} 3 · {t.content.challenge[3].label}
                </span>
              </div>
              <div className="space-y-2.5">
                {BLOCKS.map(([key, minutes]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm sm:w-28">{t.content.blocks[key].title}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full [background:var(--grad-progress)] shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                        style={{ width: `${(minutes / 7) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-end text-sm text-muted tabular-nums">
                      {minutes} min
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted">{t.landing.planNote}</p>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-bg-subtle/60 py-16 backdrop-blur">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">{t.landing.closingTitle}</h2>
            <p className="mt-3 text-muted">{t.landing.closingBody}</p>
            <Link href="/register" className="mt-8 inline-block">
              <Button size="xl">
                {t.landing.closingCta}
                <ArrowRight className="size-5 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t.landing.footerA}</p>
          <p>{t.landing.footerB}</p>
        </div>
      </footer>
    </div>
  );
}
