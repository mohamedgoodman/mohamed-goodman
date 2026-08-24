"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Ear,
  Flame,
  Mic,
  Repeat2,
  Sparkles,
  Target,
  TrendingUp,
  Volume2,
  Zap,
} from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { AnimatedNumber } from "@/components/visual/animated-number";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardLabel } from "@/components/ui/card";
import { ProgressBar, RingProgress } from "@/components/ui/progress";
import { GOALS } from "@/content/goals";
import { CHALLENGE_META, LEVEL_META, xpLevel } from "@/lib/learning/levels";
import { lastNDays, todayISO, formatDayLabel } from "@/lib/learning/dates";
import { cn, formatMinutes } from "@/lib/utils";
import type { SkillId } from "@/types";

const SKILL_META: Record<SkillId, { label: string; icon: typeof Ear }> = {
  listening: { label: "Listening", icon: Ear },
  vocabulary: { label: "Vocabulary", icon: BookOpen },
  speaking: { label: "Speaking", icon: Mic },
  pronunciation: { label: "Pronunciation", icon: Volume2 },
  grammar: { label: "Grammar", icon: Sparkles },
};

export function DashboardView() {
  const { state } = useAppState();
  const { profile, progress, streak, today, insights } = state;
  const goal = GOALS[profile.goal];
  const xp = xpLevel(progress.xpTotal);
  const week = lastNDays(7);
  const weeklyXp = progress.daily
    .filter((d) => week.includes(d.date))
    .reduce((sum, d) => sum + d.xp, 0);
  const doneToday = today?.status === "completed";

  return (
    <div className="space-y-6">
      {/* Header ------------------------------------------------------------ */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            {greeting()}, {state.user.name.split(" ")[0]}.
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">
            <Target className="size-3.5" />
            Goal: {goal.label}
          </Badge>
          <Badge tone="accent">
            <Flame className="size-3.5" />
            {streak.current} day streak
          </Badge>
        </div>
      </div>

      {/* Today's practice --------------------------------------------------- */}
      <Card elevated glow className="relative overflow-hidden">
        {/* Two ambient lights give the hero card its sense of volume. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 -right-20 size-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.35), rgba(124,58,237,0) 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.22), rgba(37,99,235,0) 70%)" }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <CardLabel>Today&apos;s mission</CardLabel>
            <h2 className="mt-1.5 text-xl leading-snug font-semibold sm:text-2xl">
              {today?.mission ?? "Your session is being prepared."}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {today
                ? `${today.blocks.length} blocks · ${formatMinutes(today.totalMinutes)} · Challenge level ${today.challengeLevel} — ${CHALLENGE_META[today.challengeLevel].label}`
                : "Come back in a moment."}
            </p>
            <div className="mt-5">
              <Link href="/learn" className="inline-flex">
                <Button size="xl" variant={doneToday ? "secondary" : "primary"}>
                  {doneToday ? "Practise again" : "Start today's practice"}
                  <ArrowRight className="size-5" />
                </Button>
              </Link>
            </div>
          </div>
          <RingProgress
            value={doneToday ? 100 : today?.status === "in-progress" ? 45 : 0}
            size={112}
            stroke={10}
            tone={doneToday ? "success" : "brand"}
          >
            <span className="text-xl font-semibold tabular-nums">
              {doneToday ? "✓" : formatMinutes(today?.totalMinutes ?? 0)}
            </span>
            <span className="text-[11px] text-dim">{doneToday ? "done today" : "today"}</span>
          </RingProgress>
        </div>
      </Card>

      {/* Key numbers -------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          icon={<Flame className={streak.current > 0 ? "size-4 animate-flame" : "size-4"} />}
          tone="amber"
          label="Daily streak"
          value={streak.current}
          hint={`Longest ${streak.longest}`}
        />
        <StatTile
          icon={<Zap className="size-4" />}
          tone="amber"
          label="Weekly XP"
          value={weeklyXp}
          hint={`${progress.xpTotal.toLocaleString()} total`}
        />
        <StatTile
          icon={<TrendingUp className="size-4" />}
          tone="success"
          label="Level"
          text={LEVEL_META[progress.level].label}
          hint={`${LEVEL_META[progress.level].cefr} · XP level ${xp.level}`}
        />
        <StatTile
          icon={<CalendarCheck className="size-4" />}
          tone="cyan"
          label="Days practised"
          value={progress.daysPracticed}
          hint={formatMinutes(progress.totalMinutes)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Skills ---------------------------------------------------------- */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Your skills"
            subtitle="Rolling averages from your own sessions — nothing is simulated."
          />
          <div className="space-y-4">
            {(Object.keys(SKILL_META) as SkillId[]).map((skill) => {
              const Icon = SKILL_META[skill].icon;
              const value = progress.skills[skill];
              return (
                <div key={skill}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <Icon className="size-4 text-muted" />
                      {SKILL_META[skill].label}
                    </span>
                    <span className="font-medium tabular-nums">
                      {value > 0 ? `${value}%` : "—"}
                    </span>
                  </div>
                  <ProgressBar
                    value={value}
                    tone={value >= 75 ? "success" : value >= 50 ? "brand" : value > 0 ? "accent" : "brand"}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl bg-surface-2/60 p-4">
            <p className="text-sm font-medium">
              Challenge level {progress.challengeLevel} — {CHALLENGE_META[progress.challengeLevel].label}
            </p>
            <p className="mt-1 text-sm text-muted">{CHALLENGE_META[progress.challengeLevel].blurb}</p>
            <ProgressBar className="mt-3" value={(progress.challengeLevel / 5) * 100} tone="accent" />
          </div>
        </Card>

        {/* Insights + week -------------------------------------------------- */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="What's actually happening" subtitle="Feedback from your numbers." />
            <ul className="space-y-3">
              {insights.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-purple shadow-[0_0_8px_rgba(124,58,237,0.7)]" aria-hidden />
                  <span className="text-muted">{line}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="This week" subtitle={`Goal: ${progress.weeklyGoalDays} days`} />
            <div className="flex justify-between gap-1">
              {week.map((day) => {
                const practised = streak.history.includes(day);
                const isToday = day === todayISO();
                return (
                  <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "grid aspect-square w-full max-w-10 place-items-center rounded-xl text-sm font-medium transition-all duration-300",
                        practised
                          ? "text-white shadow-[0_4px_14px_rgba(124,58,237,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] [background:var(--grad-brand)]"
                          : isToday
                            ? "border border-dashed border-purple/50 bg-surface-2/60 text-muted"
                            : "bg-surface-2/60 text-dim",
                      )}
                      title={day}
                    >
                      {practised ? "✓" : day.slice(-2)}
                    </div>
                    <span className="text-[11px] text-muted">{formatDayLabel(day)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick links -------------------------------------------------------- */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink
          href="/review"
          icon={<Repeat2 className="size-5" />}
          title="Review centre"
          subtitle={
            state.reviewCounts.dueNow > 0
              ? `${state.reviewCounts.dueNow} item${state.reviewCounts.dueNow === 1 ? "" : "s"} due now`
              : "Nothing due — good place to be"
          }
          highlight={state.reviewCounts.dueNow > 0}
        />
        <QuickLink
          href="/listening"
          icon={<Ear className="size-5" />}
          title="Listening lab"
          subtitle={`${formatMinutes(progress.listeningMinutes)} logged`}
        />
        <QuickLink
          href="/speaking"
          icon={<Mic className="size-5" />}
          title="Speaking scenarios"
          subtitle={`${progress.speakingSessions} answers given`}
        />
        <QuickLink
          href="/real-english"
          icon={<Sparkles className="size-5" />}
          title="Real English"
          subtitle="How people actually talk"
        />
      </div>
    </div>
  );
}

const TILE_TONES = {
  amber: "bg-accent-soft text-on-accent ring-accent/25",
  brand: "bg-brand-soft text-on-brand ring-purple/25",
  success: "bg-success-soft text-on-success ring-success/25",
  cyan: "bg-cyan-soft text-on-cyan ring-cyan/25",
} as const;

/** Metric tile: an icon plate, a live number, and one line of context. */
function StatTile({
  icon,
  label,
  value,
  text,
  hint,
  tone = "brand",
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  text?: string;
  hint: string;
  tone?: keyof typeof TILE_TONES;
}) {
  return (
    <div className="card lift p-4">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg ring-1 ring-inset",
            TILE_TONES[tone],
          )}
        >
          {icon}
        </span>
        <CardLabel>{label}</CardLabel>
      </div>
      <p className="mt-2.5 text-2xl font-semibold tracking-tight">
        {text ?? <AnimatedNumber value={value ?? 0} />}
      </p>
      <p className="mt-0.5 text-xs text-dim">{hint}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  subtitle,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "card lift group flex items-center gap-3 p-4",
        highlight && "glow-purple",
      )}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105",
          highlight
            ? "text-white shadow-[0_4px_16px_rgba(124,58,237,0.45)] [background:var(--grad-brand)]"
            : "bg-surface-2 text-on-brand ring-1 ring-inset ring-purple/20",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        <span className="block truncate text-sm text-muted">{subtitle}</span>
      </span>
    </Link>
  );
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
