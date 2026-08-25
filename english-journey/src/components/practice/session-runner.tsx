"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Flame,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { useDays, useI18n, useInsightText, useT } from "@/i18n/provider";
import { En } from "@/components/ui/en";
import { AnimatedNumber } from "@/components/visual/animated-number";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar, RingProgress } from "@/components/ui/progress";

import { cn, formatMinutes } from "@/lib/utils";
import type {
  DailySession,
  Exercise,
  GrammarPoint,
  ListeningExercise,
  PronunciationExercise,
  RealEnglishPhrase,
  SessionBlock,
  SessionResult,
  SessionSummary,
  SpeakingExercise,
  VocabularyWord,
} from "@/types";
import { ListeningExerciseCard } from "./listening-exercise";
import { PronunciationExerciseCard } from "./pronunciation-exercise";
import { SpeakingExerciseCard } from "./speaking-exercise";
import { PhraseCard, VocabChoiceCard } from "./vocab-card";

/** Payload shapes produced by the planner, narrowed on the client. */
type Payload =
  | { type: "vocab-choice"; word: VocabularyWord; options: VocabOption[] }
  | { type: "listening"; exercise: ListeningExercise; speed: number }
  | { type: "phrase-context"; phrase: RealEnglishPhrase }
  | { type: "grammar-point"; point: GrammarPoint }
  | { type: "speaking"; scenario: SpeakingExercise }
  | { type: "pronunciation"; drill: PronunciationExercise };

export interface VocabOption {
  id: string;
  definition: string;
  darija: string;
}

interface Step {
  block: SessionBlock;
  exercise: Exercise;
  indexInBlock: number;
  blockSize: number;
}

export function SessionRunner({ session }: { session: DailySession }) {
  const { refresh } = useAppState();
  const { t } = useI18n();
  const steps = useMemo<Step[]>(
    () =>
      session.blocks.flatMap((block) =>
        block.exercises.map((exercise, index) => ({
          block,
          exercise,
          indexInBlock: index,
          blockSize: block.exercises.length,
        })),
      ),
    [session],
  );

  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [answered, setAnswered] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = steps[index];
  const progress = (index / Math.max(steps.length, 1)) * 100;

  function record(partial: { score: number; correct: boolean; answer?: string; feedback?: string }) {
    if (!step) return;
    setAnswered(true);
    setResults((prev) => [
      ...prev.filter((r) => r.exerciseId !== step.exercise.id),
      {
        exerciseId: step.exercise.id,
        blockKind: step.block.kind,
        skill: step.exercise.skill,
        correct: partial.correct,
        score: Math.round(partial.score),
        refId: step.exercise.refId,
        answer: partial.answer,
        feedback: partial.feedback,
        at: new Date().toISOString(),
      },
    ]);
  }

  async function next() {
    if (index < steps.length - 1) {
      setIndex((i) => i + 1);
      setAnswered(false);
      return;
    }
    await finish();
  }

  async function finish() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/session/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, results }),
      });
      const data = (await response.json()) as SessionSummary & { error?: string };
      if (!response.ok) {
        setError(data.error ?? t.session.saveError);
        return;
      }
      setSummary(data);
      await refresh();
    } catch {
      setError(t.common.networkError);
    } finally {
      setSaving(false);
    }
  }

  if (summary) return <SessionSummaryView summary={summary} />;
  if (!step) return null;

  const payload = step.exercise.payload as Payload;
  const informational = payload.type === "phrase-context" || payload.type === "grammar-point";

  return (
    <div className="space-y-5">
      {/* Progress header --------------------------------------------------- */}
      <div className="sticky top-14 z-30 -mx-4 border-b border-border bg-bg/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-16">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-baseline gap-2.5">
            <span className="text-[11px] font-semibold tracking-[0.14em] text-on-brand uppercase">
              {t.content.blocks[step.block.kind].title}
            </span>
            <span className="text-sm font-medium text-muted tabular-nums">
              {step.indexInBlock + 1} / {step.blockSize}
            </span>
          </span>
          <span className="text-xs text-dim tabular-nums">
            {index + 1} {t.common.of} {steps.length}
          </span>
        </div>
        <ProgressBar className="mt-2.5" value={progress} size="sm" />
        {/* One pip per exercise, so the shape of the session stays visible. */}
        <div className="mt-2 flex gap-1" aria-hidden>
          {steps.map((s, i) => (
            <span
              key={s.exercise.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500",
                i < index
                  ? "[background:var(--grad-progress)] opacity-90"
                  : i === index
                    ? "bg-cyan shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                    : "bg-surface-3",
              )}
            />
          ))}
        </div>
      </div>

      <Card elevated className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 size-72 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.22), rgba(124,58,237,0) 70%)" }}
        />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge tone="brand">{t.content.blocks[step.block.kind].title}</Badge>
          <Badge tone="neutral">{formatMinutes(step.block.minutes, t)}</Badge>
          {step.block.kind === "challenge" ? <Badge tone="accent">{t.session.aboveLevel}</Badge> : null}
        </div>
        <p className="mb-5 text-sm text-muted">{t.content.blocks[step.block.kind].description}</p>

        {payload.type === "vocab-choice" ? (
          <VocabChoiceCard
            key={step.exercise.id}
            word={payload.word}
            options={payload.options}
            onAnswer={(correct) => record({ score: correct ? 100 : 0, correct })}
          />
        ) : null}

        {payload.type === "listening" ? (
          <ListeningExerciseCard
            key={step.exercise.id}
            exercise={payload.exercise}
            speed={payload.speed}
            onComplete={({ score, correct }) => record({ score, correct })}
          />
        ) : null}

        {payload.type === "phrase-context" ? (
          <PhraseCard key={step.exercise.id} phrase={payload.phrase} />
        ) : null}

        {payload.type === "grammar-point" ? (
          <GrammarPointCard key={step.exercise.id} point={payload.point} />
        ) : null}

        {payload.type === "speaking" ? (
          <SpeakingExerciseCard
            key={step.exercise.id}
            scenario={payload.scenario}
            onComplete={({ score, correct, answer, feedback }) =>
              record({ score, correct, answer, feedback })
            }
          />
        ) : null}

        {payload.type === "pronunciation" ? (
          <PronunciationExerciseCard
            key={step.exercise.id}
            drill={payload.drill}
            onComplete={({ score, correct, answer }) => record({ score, correct, answer })}
          />
        ) : null}
      </Card>

      {error ? (
        <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-on-danger">
          {error}
        </p>
      ) : null}

      <div className="sticky bottom-20 z-20 flex items-center justify-between gap-3 rounded-2xl border border-border-strong bg-surface/95 p-3 shadow-[var(--shadow-lg)] backdrop-blur-xl lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <p className="hidden text-sm text-muted sm:block">
          {informational
            ? t.session.readIt
            : answered
              ? t.session.recorded
              : t.session.answerToContinue}
        </p>
        <Button
          size="lg"
          onClick={next}
          loading={saving}
          disabled={!informational && !answered}
          className="w-full sm:w-auto"
        >
          {index === steps.length - 1 ? t.session.finishSession : t.common.next}
          <ChevronRight className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}

function GrammarPointCard({ point }: { point: GrammarPoint }) {
  const t = useT();
  return (
    <div className="space-y-4">
      <En as="h3" className="text-lg font-semibold">
        {point.title}
      </En>
      <En as="p" className="text-muted">
        {point.explanation}
      </En>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-success/30 bg-success-soft/60 p-4 text-sm">
          <p className="text-[11px] font-semibold tracking-[0.09em] text-on-success uppercase">
            {t.exercise.grammarNatural}
          </p>
          <En as="p" className="mt-1.5">
            {point.natural}
          </En>
        </div>
        <div className="rounded-xl border border-danger/30 bg-danger-soft/50 p-4 text-sm">
          <p className="text-[11px] font-semibold tracking-[0.09em] text-on-danger uppercase">
            {t.exercise.grammarAvoid}
          </p>
          <En as="p" className="mt-1.5">
            {point.avoid}
          </En>
        </div>
      </div>
    </div>
  );
}

export function SessionSummaryView({ summary }: { summary: SessionSummary }) {
  const t = useT();
  const days = useDays();
  const insightText = useInsightText();

  return (
    <div className="animate-in-up space-y-5">
      <Card elevated glow className="relative overflow-hidden text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 left-1/2 size-80 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.3), rgba(124,58,237,0) 70%)" }}
        />
        <RingProgress
          value={summary.score}
          size={140}
          stroke={12}
          tone={summary.score >= 80 ? "success" : "brand"}
        >
          <AnimatedNumber
            value={summary.score}
            className="text-3xl font-semibold"
            format={(n) => `${n}%`}
          />
          <span className="text-[11px] tracking-wide text-dim">{t.session.sessionScore}</span>
        </RingProgress>
        <h1 className="mt-4 text-2xl font-semibold">{t.session.complete}</h1>
        <p className="mt-1 text-muted">
          {formatMinutes(summary.minutes, t)} {t.session.ofPractice} · {days(summary.streak)}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Badge tone="accent">
            <Zap className="size-3.5" />+
            <AnimatedNumber value={summary.xpEarned} /> XP
          </Badge>
          <Badge tone="accent">
            <Flame className="size-3.5 animate-flame" />
            {days(summary.streak)}
          </Badge>
          <Badge tone={summary.challengeChanged === "up" ? "success" : summary.challengeChanged === "down" ? "warning" : "neutral"}>
            {summary.challengeChanged === "up" ? (
              <TrendingUp className="size-3.5" />
            ) : summary.challengeChanged === "down" ? (
              <TrendingDown className="size-3.5" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            {t.dashboard.level} {summary.challengeLevel} — {t.content.challenge[summary.challengeLevel].label}
          </Badge>
        </div>
      </Card>

      {summary.levelledUp ? (
        <Card className="border-success/40 bg-success-soft/50">
          <p className="flex items-center gap-2 font-medium text-on-success">
            <Trophy className="size-5" />
            {t.session.levelUp}
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <Check className="size-4 text-on-success" />
            {t.session.whatImproved}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {summary.improved.map((item, index) => (
              <li key={`${item.id}-${index}`}>{insightText(item)}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-semibold">{t.session.whatToWork}</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {summary.struggled.length ? (
              summary.struggled.map((item, index) => (
                <li key={`${item.id}-${index}`}>{insightText(item)}</li>
              ))
            ) : (
              <li>{t.session.nothingWeak}</li>
            )}
          </ul>
        </Card>
      </div>

      <Card className="bg-brand-soft/40">
        <h2 className="font-semibold">{t.session.tomorrow}</h2>
        <p className="mt-2 text-sm">{insightText(summary.tomorrow)}</p>
      </Card>

      {summary.unlockedAchievements.length ? (
        <Card>
          <h2 className="font-semibold">{t.session.unlocked}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {summary.unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="animate-pop flex items-center gap-3 rounded-xl border border-purple/25 bg-brand-soft/40 p-3"
              >
                <span className="text-2xl">{achievement.icon}</span>
                <span>
                  <span className="block font-medium">
                    {(t.achievements as Record<string, { title: string; description: string } | undefined>)[achievement.id]?.title ?? achievement.title}
                  </span>
                  <span className="block text-sm text-muted">
                    {(t.achievements as Record<string, { title: string; description: string } | undefined>)[achievement.id]?.description ?? achievement.description}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard" className="inline-flex">
          <Button size="lg">
            {t.session.backToDashboard}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Button>
        </Link>
        <Link href="/review" className="inline-flex">
          <Button size="lg" variant="outline">
            {t.session.reviewMistakes}
          </Button>
        </Link>
      </div>
    </div>
  );
}
