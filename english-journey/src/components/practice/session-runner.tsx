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
import { AnimatedNumber } from "@/components/visual/animated-number";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar, RingProgress } from "@/components/ui/progress";
import { CHALLENGE_META } from "@/lib/learning/levels";
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
  | { type: "vocab-choice"; word: VocabularyWord; options: string[] }
  | { type: "listening"; exercise: ListeningExercise; speed: number }
  | { type: "phrase-context"; phrase: RealEnglishPhrase }
  | { type: "grammar-point"; point: GrammarPoint }
  | { type: "speaking"; scenario: SpeakingExercise }
  | { type: "pronunciation"; drill: PronunciationExercise };

interface Step {
  block: SessionBlock;
  exercise: Exercise;
  indexInBlock: number;
  blockSize: number;
}

export function SessionRunner({ session }: { session: DailySession }) {
  const { refresh } = useAppState();
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
        setError(data.error ?? "Could not save this session.");
        return;
      }
      setSummary(data);
      await refresh();
    } catch {
      setError("Network error — your session wasn't saved. Try again.");
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
              {step.block.title}
            </span>
            <span className="text-sm font-medium text-muted tabular-nums">
              {step.indexInBlock + 1} / {step.blockSize}
            </span>
          </span>
          <span className="text-xs text-dim tabular-nums">
            {index + 1} of {steps.length}
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
          <Badge tone="brand">{step.block.title}</Badge>
          <Badge tone="neutral">{formatMinutes(step.block.minutes)}</Badge>
          {step.block.kind === "challenge" ? <Badge tone="accent">Above your level</Badge> : null}
        </div>
        <p className="mb-5 text-sm text-muted">{step.block.description}</p>

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
            ? "Read it, say it out loud once, then continue."
            : answered
              ? "Recorded. Keep going."
              : "Answer to continue."}
        </p>
        <Button
          size="lg"
          onClick={next}
          loading={saving}
          disabled={!informational && !answered}
          className="w-full sm:w-auto"
        >
          {index === steps.length - 1 ? "Finish session" : "Next"}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function GrammarPointCard({ point }: { point: GrammarPoint }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{point.title}</h3>
      <p className="text-muted">{point.explanation}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-success/30 bg-success-soft/60 p-4 text-sm">
          <p className="text-[11px] font-semibold tracking-[0.09em] text-on-success uppercase">Natural</p>
          <p className="mt-1.5">{point.natural}</p>
        </div>
        <div className="rounded-xl border border-danger/30 bg-danger-soft/50 p-4 text-sm">
          <p className="text-[11px] font-semibold tracking-[0.09em] text-on-danger uppercase">Avoid</p>
          <p className="mt-1.5">{point.avoid}</p>
        </div>
      </div>
    </div>
  );
}

export function SessionSummaryView({ summary }: { summary: SessionSummary }) {
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
          <span className="text-[11px] tracking-wide text-dim">session score</span>
        </RingProgress>
        <h1 className="mt-4 text-2xl font-semibold">Session complete</h1>
        <p className="mt-1 text-muted">
          {formatMinutes(summary.minutes)} of practice · {summary.streak} day streak
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Badge tone="accent">
            <Zap className="size-3.5" />+
            <AnimatedNumber value={summary.xpEarned} /> XP
          </Badge>
          <Badge tone="accent">
            <Flame className="size-3.5 animate-flame" />
            {summary.streak} days
          </Badge>
          <Badge tone={summary.challengeChanged === "up" ? "success" : summary.challengeChanged === "down" ? "warning" : "neutral"}>
            {summary.challengeChanged === "up" ? (
              <TrendingUp className="size-3.5" />
            ) : summary.challengeChanged === "down" ? (
              <TrendingDown className="size-3.5" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            Level {summary.challengeLevel} — {CHALLENGE_META[summary.challengeLevel].label}
          </Badge>
        </div>
      </Card>

      {summary.levelledUp ? (
        <Card className="border-success/40 bg-success-soft/50">
          <p className="flex items-center gap-2 font-medium text-on-success">
            <Trophy className="size-5" />
            Your level moved up. That took sustained work, not one good session.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <Check className="size-4 text-on-success" />
            What improved
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {summary.improved.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-semibold">What to work on</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {summary.struggled.length ? (
              summary.struggled.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>Nothing stood out as weak today — the difficulty will rise to find your edge.</li>
            )}
          </ul>
        </Card>
      </div>

      <Card className="bg-brand-soft/40">
        <h2 className="font-semibold">Tomorrow</h2>
        <p className="mt-2 text-sm">{summary.tomorrow}</p>
      </Card>

      {summary.unlockedAchievements.length ? (
        <Card>
          <h2 className="font-semibold">Unlocked</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {summary.unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="animate-pop flex items-center gap-3 rounded-xl border border-purple/25 bg-brand-soft/40 p-3"
              >
                <span className="text-2xl">{achievement.icon}</span>
                <span>
                  <span className="block font-medium">{achievement.title}</span>
                  <span className="block text-sm text-muted">{achievement.description}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard" className="inline-flex">
          <Button size="lg">
            Back to dashboard
            <ArrowRight className="size-4" />
          </Button>
        </Link>
        <Link href="/review" className="inline-flex">
          <Button size="lg" variant="outline">
            Review my mistakes
          </Button>
        </Link>
      </div>
    </div>
  );
}
