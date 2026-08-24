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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar, RingProgress } from "@/components/ui/progress";
import { CHALLENGE_META } from "@/lib/learning/levels";
import { formatMinutes } from "@/lib/utils";
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
      <div className="sticky top-14 z-30 -mx-4 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 font-medium">
            {step.block.title}
            <span className="text-muted">
              {step.indexInBlock + 1}/{step.blockSize}
            </span>
          </span>
          <span className="text-muted tabular-nums">
            {index + 1} of {steps.length}
          </span>
        </div>
        <ProgressBar className="mt-2" value={progress} />
      </div>

      <Card>
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
        <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
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
        <div className="rounded-xl bg-success-soft p-4 text-sm">
          <p className="font-medium text-success">Natural</p>
          <p className="mt-1">{point.natural}</p>
        </div>
        <div className="rounded-xl bg-danger-soft p-4 text-sm">
          <p className="font-medium text-danger">Avoid</p>
          <p className="mt-1">{point.avoid}</p>
        </div>
      </div>
    </div>
  );
}

export function SessionSummaryView({ summary }: { summary: SessionSummary }) {
  return (
    <div className="animate-in-up space-y-5">
      <Card className="text-center">
        <RingProgress value={summary.score} size={132} stroke={11}>
          <span className="text-3xl font-semibold tabular-nums">{summary.score}%</span>
          <span className="text-xs text-muted">session score</span>
        </RingProgress>
        <h1 className="mt-4 text-2xl font-semibold">Session complete</h1>
        <p className="mt-1 text-muted">
          {formatMinutes(summary.minutes)} of practice · {summary.streak} day streak
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Badge tone="brand">
            <Zap className="size-3.5" />+{summary.xpEarned} XP
          </Badge>
          <Badge tone="accent">
            <Flame className="size-3.5" />
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
          <p className="flex items-center gap-2 font-medium text-success">
            <Trophy className="size-5" />
            Your level moved up. That took sustained work, not one good session.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <Check className="size-4 text-success" />
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
              <div key={achievement.id} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
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
        <Link href="/dashboard">
          <Button size="lg">
            Back to dashboard
            <ArrowRight className="size-4" />
          </Button>
        </Link>
        <Link href="/review">
          <Button size="lg" variant="outline">
            Review my mistakes
          </Button>
        </Link>
      </div>
    </div>
  );
}
