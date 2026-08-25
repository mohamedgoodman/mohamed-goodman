"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Clock, Flame, Headphones, Mic, Target, TrendingUp, Zap } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { BarChart, LineChart, type Point } from "@/components/charts/line-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { TabBar } from "@/components/ui/tabs";
import { formatDayLabel, lastNDays } from "@/lib/learning/dates";
import { LEVEL_META, xpLevel } from "@/lib/learning/levels";
import { formatMinutes } from "@/lib/utils";
import { useDays, useI18n } from "@/i18n/provider";
import type { DailyStat, Streak, UserProgress } from "@/types";

type Range = 7 | 30 | 90;

export function ProgressView() {
  const { state } = useAppState();
  const { t, fmt, locale } = useI18n();
  const dayCount = useDays();
  const [range, setRange] = useState<Range>(30);
  const [data, setData] = useState<{ progress: UserProgress; streak: Streak } | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/progress", { cache: "no-store" });
      if (response.ok) setData((await response.json()) as { progress: UserProgress; streak: Streak });
    })();
  }, []);

  const progress = data?.progress ?? state.progress;
  const streak = data?.streak ?? state.streak;
  const xp = xpLevel(progress.xpTotal);

  const days = useMemo(() => lastNDays(range), [range]);
  const byDate = useMemo(
    () => new Map(progress.daily.map((d) => [d.date, d])),
    [progress.daily],
  );
  const series = (pick: (stat: DailyStat | undefined) => number): Point[] =>
    days.map((date) => ({
      label: range === 7 ? formatDayLabel(date, locale) : date.slice(5),
      value: pick(byDate.get(date)),
    }));

  const practisedInRange = days.filter((d) => streak.history.includes(d)).length;
  const unlocked = state.achievements.filter((a) => a.unlockedAt);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{t.progress.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t.progress.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Clock className="size-4 text-on-brand" />} label={t.progress.totalPractice} value={formatMinutes(progress.totalMinutes, t)} />
        <Stat icon={<Flame className="size-4 text-on-accent" />} label={t.progress.currentStreak} value={dayCount(streak.current)} hint={`${t.dashboard.longest} ${streak.longest}`} />
        <Stat icon={<Target className="size-4 text-on-success" />} label={t.progress.daysPractised} value={`${progress.daysPracticed}`} />
        <Stat icon={<Zap className="size-4 text-on-accent" />} label={t.progress.totalXp} value={`${progress.xpTotal}`} hint={fmt(t.progress.xpLevel, { level: xp.level })} />
        <Stat icon={<Headphones className="size-4 text-on-cyan" />} label={t.progress.listening} value={formatMinutes(progress.listeningMinutes, t)} />
        <Stat icon={<Mic className="size-4 text-on-cyan" />} label={t.progress.speakingAnswers} value={`${progress.speakingSessions}`} />
        <Stat icon={<TrendingUp className="size-4 text-on-success" />} label={t.progress.wordsMastered} value={`${progress.wordsMastered}`} hint={`${progress.wordsLearning} ${t.progress.inProgress}`} />
        <Stat icon={<Award className="size-4 text-on-accent" />} label={t.progress.pronunciation} value={progress.pronunciationScore ? `${progress.pronunciationScore}%` : "—"} />
      </div>

      <Card>
        <CardHeader
          title={t.progress.levelProgression}
          subtitle={`${t.content.levels[progress.level].label} (${LEVEL_META[progress.level].cefr}) — ${t.content.levels[progress.level].blurb}`}
        />
        <ProgressBar
          value={progress.levelProgress}
          showValue
          label={fmt(t.progress.towards, { level: t.content.levels[nextLevelLabel(progress)].label })}
          tone="success"
        />
        <div className="mt-4 rounded-xl bg-surface-2/60 p-4 text-sm">
          <p className="font-medium">
            {t.dashboard.challengeLevel} {progress.challengeLevel} —{" "}
            {t.content.challenge[progress.challengeLevel].label}
          </p>
          <p className="mt-1 text-muted">{t.content.challenge[progress.challengeLevel].blurb}</p>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium">{fmt(t.progress.xpLevel, { level: xp.level })}</p>
          <ProgressBar className="mt-1.5" value={(xp.into / xp.needed) * 100} />
          <p className="mt-1 text-xs text-muted">
            {fmt(t.progress.xpToNext, { into: xp.into, needed: xp.needed, next: xp.level + 1 })}
          </p>
        </div>
      </Card>

      <TabBar
        tabs={[
          { id: 7 as Range, label: t.progress.ranges[7] },
          { id: 30 as Range, label: t.progress.ranges[30] },
          { id: 90 as Range, label: t.progress.ranges[90] },
        ]}
        value={range}
        onChange={setRange}
      />

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader title={t.progress.accuracy} subtitle={t.progress.accuracyHint} />
          <LineChart data={series((s) => s?.accuracy ?? 0)} suffix="%" emptyMessage={t.progress.emptyChart} />
        </Card>
        <Card className="min-w-0">
          <CardHeader title={t.progress.practiceMinutes} subtitle={t.progress.practiceMinutesHint} />
          <BarChart data={series((s) => s?.minutes ?? 0)} suffix=" min" emptyMessage={t.progress.noPractice} />
        </Card>
        <Card className="min-w-0">
          <CardHeader title={t.progress.xpEarned} subtitle={t.progress.xpEarnedHint} />
          <LineChart data={series((s) => s?.xp ?? 0)} emptyMessage={t.progress.noXp} />
        </Card>
        <Card className="min-w-0">
          <CardHeader title={t.progress.listeningMinutes} subtitle={t.progress.listeningMinutesHint} />
          <BarChart data={series((s) => s?.listeningMinutes ?? 0)} suffix=" min" emptyMessage={t.progress.noListening} />
        </Card>
      </div>

      <Card>
        <CardHeader
          title={t.progress.calendar}
          subtitle={fmt(t.progress.calendarHint, { done: practisedInRange, total: range })}
        />
        <div className="flex flex-wrap gap-1.5">
          {days.map((date) => {
            const practised = streak.history.includes(date);
            const stat = byDate.get(date);
            return (
              <span
                key={date}
                title={`${date}${stat ? ` · ${stat.minutes} ${t.common.minutes} · ${stat.accuracy}%` : ` · ${t.progress.noPractiseDay}`}`}
                className={[
                  "size-4 rounded-[5px] transition-all duration-300",
                  practised
                    ? stat && stat.minutes >= 30
                      ? "[background:var(--grad-brand)] shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                      : "bg-purple/55"
                    : "bg-surface-3",
                ].join(" ")}
              />
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader
          title={t.progress.achievements}
          subtitle={fmt(t.progress.achievementsHint, {
            done: unlocked.length,
            total: state.achievements.length,
          })}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {state.achievements.map(({ achievement, unlockedAt }) => (
            <div
              key={achievement.id}
              className={[
                "flex items-start gap-3 rounded-xl border p-3.5 transition-all duration-300",
                unlockedAt
                  ? "border-purple/25 bg-brand-soft/30"
                  : "border-border bg-surface-2/40 opacity-50 grayscale",
              ].join(" ")}
            >
              <span className="text-2xl">{achievement.icon}</span>
              <span className="min-w-0">
                <span className="block font-medium">
                  {(t.achievements as Record<string, { title: string; description: string } | undefined>)[achievement.id]?.title ?? achievement.title}
                </span>
                <span className="block text-sm text-muted">
                  {(t.achievements as Record<string, { title: string; description: string } | undefined>)[achievement.id]?.description ?? achievement.description}
                </span>
                {unlockedAt ? (
                  <Badge tone="success" className="mt-1.5">
                    {new Date(unlockedAt).toLocaleDateString(locale === "ar" ? "ar-MA" : "en-GB")}
                  </Badge>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card lift p-4">
      <div className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 ring-1 ring-inset ring-border-strong">
          {icon}
        </span>
        <span className="text-[11px] font-medium tracking-[0.09em] text-dim uppercase">{label}</span>
      </div>
      <p className="mt-2.5 text-xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-dim">{hint}</p> : null}
    </div>
  );
}

function nextLevelLabel(progress: UserProgress) {
  const order = ["beginner", "elementary", "intermediate", "upper-intermediate", "advanced"] as const;
  const index = order.indexOf(progress.level);
  return order[Math.min(index + 1, order.length - 1)] ?? progress.level;
}
