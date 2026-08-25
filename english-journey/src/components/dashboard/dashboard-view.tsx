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
import { useDays, useI18n, useInsightText } from "@/i18n/provider";
import { LEVEL_META, xpLevel } from "@/lib/learning/levels";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { lastNDays, todayISO, formatDayLabel } from "@/lib/learning/dates";
import { cn, formatMinutes } from "@/lib/utils";
import type { SkillId } from "@/types";

const SKILL_ICONS: Record<SkillId, typeof Ear> = {
  listening: Ear,
  vocabulary: BookOpen,
  speaking: Mic,
  pronunciation: Volume2,
  grammar: Sparkles,
};

export function DashboardView() {
  const { state } = useAppState();
  const { t, locale, fmt } = useI18n();
  const insightText = useInsightText();
  const days = useDays();
  const { profile, progress, streak, today, insights } = state;
  const goal = t.content.goals[profile.goal];
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
            {new Date().toLocaleDateString(locale === "ar" ? "ar-MA" : "en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            {greeting(t)}، {state.user.name.split(" ")[0]}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">
            <Target className="size-3.5" />
            {t.dashboard.goal}: {goal.label}
          </Badge>
          <Badge tone="accent">
            <Flame className="size-3.5" />
            {days(streak.current)} {t.dashboard.streak}
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
            <CardLabel>{t.dashboard.todayMission}</CardLabel>
            <h2 className="mt-1.5 text-xl leading-snug font-semibold sm:text-2xl">
              {today ? (t.content.missions[today.goal][today.missionIndex] ?? today.mission) : t.dashboard.preparing}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {today
                ? `${today.blocks.length} ${t.dashboard.blocks} · ${formatMinutes(today.totalMinutes, t)} · ${t.dashboard.challengeLevel} ${today.challengeLevel} — ${t.content.challenge[today.challengeLevel].label}`
                : t.dashboard.comeBack}
            </p>
            <div className="mt-5">
              <Link href="/learn" className="inline-flex">
                <Button size="xl" variant={doneToday ? "secondary" : "primary"}>
                  {doneToday ? t.dashboard.practiseAgain : t.dashboard.startPractice}
                  <ArrowRight className="size-5 rtl:rotate-180" />
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
              {doneToday ? "✓" : formatMinutes(today?.totalMinutes ?? 0, t)}
            </span>
            <span className="text-[11px] text-dim">
              {doneToday ? t.dashboard.doneToday : t.dashboard.today}
            </span>
          </RingProgress>
        </div>
      </Card>

      {/* Key numbers -------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          icon={<Flame className={streak.current > 0 ? "size-4 animate-flame" : "size-4"} />}
          tone="amber"
          label={t.dashboard.dailyStreak}
          value={streak.current}
          hint={`${t.dashboard.longest} ${days(streak.longest)}`}
        />
        <StatTile
          icon={<Zap className="size-4" />}
          tone="amber"
          label={t.dashboard.weeklyXp}
          value={weeklyXp}
          hint={`${progress.xpTotal.toLocaleString()} ${t.dashboard.total}`}
        />
        <StatTile
          icon={<TrendingUp className="size-4" />}
          tone="success"
          label={t.dashboard.level}
          text={t.content.levels[progress.level].label}
          hint={`${LEVEL_META[progress.level].cefr} · ${fmt(t.progress.xpLevel, { level: xp.level })}`}
        />
        <StatTile
          icon={<CalendarCheck className="size-4" />}
          tone="cyan"
          label={t.dashboard.daysPractised}
          value={progress.daysPracticed}
          hint={formatMinutes(progress.totalMinutes, t)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Skills ---------------------------------------------------------- */}
        <Card className="lg:col-span-3">
          <CardHeader title={t.dashboard.skillsTitle} subtitle={t.dashboard.skillsSubtitle} />
          <div className="space-y-4">
            {(Object.keys(SKILL_ICONS) as SkillId[]).map((skill) => {
              const Icon = SKILL_ICONS[skill];
              const value = progress.skills[skill];
              return (
                <div key={skill}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <Icon className="size-4 text-muted" />
                      {t.content.skills[skill]}
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
              {t.dashboard.challengeLevel} {progress.challengeLevel} —{" "}
              {t.content.challenge[progress.challengeLevel].label}
            </p>
            <p className="mt-1 text-sm text-muted">
              {t.content.challenge[progress.challengeLevel].blurb}
            </p>
            <ProgressBar className="mt-3" value={(progress.challengeLevel / 5) * 100} tone="accent" />
          </div>
        </Card>

        {/* Insights + week -------------------------------------------------- */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title={t.dashboard.insightsTitle} subtitle={t.dashboard.insightsSubtitle} />
            <ul className="space-y-3">
              {insights.map((insight, index) => (
                <li key={`${insight.id}-${index}`} className="flex gap-2.5 text-sm">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-purple shadow-[0_0_8px_rgba(124,58,237,0.7)]"
                    aria-hidden
                  />
                  <span className="text-muted">{insightText(insight)}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader
              title={t.dashboard.weekTitle}
              subtitle={`${t.dashboard.weekGoal}: ${progress.weeklyGoalDays} ${t.common.days}`}
            />
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
          title={t.dashboard.reviewCentre}
          subtitle={
            state.reviewCounts.dueNow > 0
              ? `${state.reviewCounts.dueNow} ${state.reviewCounts.dueNow === 1 ? t.dashboard.itemDue : t.dashboard.itemsDue}`
              : t.dashboard.nothingDue
          }
          highlight={state.reviewCounts.dueNow > 0}
        />
        <QuickLink
          href="/listening"
          icon={<Ear className="size-5" />}
          title={t.dashboard.listeningLab}
          subtitle={`${formatMinutes(progress.listeningMinutes, t)} ${t.dashboard.logged}`}
        />
        <QuickLink
          href="/speaking"
          icon={<Mic className="size-5" />}
          title={t.dashboard.speakingScenarios}
          subtitle={`${progress.speakingSessions} ${t.dashboard.answersGiven}`}
        />
        <QuickLink
          href="/real-english"
          icon={<Sparkles className="size-5" />}
          title={t.dashboard.realEnglishTitle}
          subtitle={t.dashboard.realEnglishSubtitle}
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

function greeting(t: Dictionary): string {
  const hour = new Date().getHours();
  if (hour < 12) return t.dashboard.morning;
  if (hour < 18) return t.dashboard.afternoon;
  return t.dashboard.evening;
}
