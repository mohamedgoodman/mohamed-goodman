"use client";

import { useMemo, useState } from "react";
import { Check, Headphones, RotateCcw, Volume2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RingProgress } from "@/components/ui/progress";
import { useSpeech } from "@/lib/speech";
import { useI18n } from "@/i18n/provider";
import { En } from "@/components/ui/en";
import { AudioPlayer } from "./audio-player";
import { cn } from "@/lib/utils";
import type { ListeningExercise as Exercise } from "@/types";

const TIER_TONE: Record<Exercise["tier"], "success" | "brand" | "accent" | "danger"> = {
  easy: "success",
  normal: "brand",
  challenging: "accent",
  native: "danger",
};

/**
 * The listening flow the product specifies: listen first, answer, and only
 * then see the transcript. Difficult expressions are surfaced afterwards, and
 * any line can be replayed on its own.
 */
export function ListeningExerciseCard({
  exercise,
  speed = 1,
  onComplete,
  showTierBadge = true,
}: {
  exercise: Exercise;
  speed?: number;
  onComplete?: (result: { score: number; correct: boolean; missed: string[] }) => void;
  showTierBadge?: boolean;
}) {
  const { speak } = useSpeech();
  const { t, fmt } = useI18n();
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [plays, setPlays] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(exercise.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const score = useMemo(() => {
    const correct = answers.filter((a, i) => a === exercise.questions[i]?.answerIndex).length;
    return Math.round((correct / exercise.questions.length) * 100);
  }, [answers, exercise.questions]);

  const allAnswered = answers.every((a) => a !== null);

  function submit() {
    setSubmitted(true);
    setShowTranscript(true);
    const missed = exercise.questions
      .filter((q, i) => answers[i] !== q.answerIndex)
      .map((q) => q.prompt);
    onComplete?.({ score, correct: score >= 60, missed });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <En as="h3" className="text-lg font-semibold">
            {exercise.title}
          </En>
          <p className="mt-0.5 text-sm text-muted">
            ~{exercise.seconds}s · {exercise.lines.length} {t.exercise.line} ·{" "}
            {t.content.destinations[exercise.accent]}
          </p>
        </div>
        {showTierBadge ? (
          <Badge tone={TIER_TONE[exercise.tier]}>{t.listening.tiers[exercise.tier]}</Badge>
        ) : null}
      </div>

      <AudioPlayer
        lines={exercise.lines}
        accent={exercise.accent}
        baseRate={speed}
        transcriptOpen={showTranscript}
        onToggleTranscript={submitted ? () => setShowTranscript((v) => !v) : undefined}
        onPlay={() => setPlays((n) => n + 1)}
        onLineChange={setPlayingIndex}
      />
      {plays > 0 && !submitted ? (
        <p className="text-xs text-dim">
          {fmt(t.exercise.playedTimes, { count: plays })}
        </p>
      ) : null}

      {/* Questions ---------------------------------------------------------- */}
      <div className="space-y-4">
        {exercise.questions.map((question, qIndex) => {
          const chosen = answers[qIndex];
          const isCorrect = chosen === question.answerIndex;
          return (
            <div
              key={question.id}
              className="rounded-2xl border border-border bg-surface-2/40 p-4 backdrop-blur sm:p-5"
            >
              <p className="flex items-start gap-2 font-medium">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-surface-3 text-[11px] font-semibold text-dim">
                  {qIndex + 1}
                </span>
                <En>{question.prompt}</En>
              </p>
              <div className="mt-3 grid gap-2">
                {question.options.map((option, oIndex) => {
                  const selected = chosen === oIndex;
                  const revealCorrect = submitted && oIndex === question.answerIndex;
                  const revealWrong = submitted && selected && !isCorrect;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={submitted}
                      onClick={() =>
                        setAnswers((prev) => prev.map((a, i) => (i === qIndex ? oIndex : a)))
                      }
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-start text-sm",
                        "transition-[transform,box-shadow,border-color,background] duration-250",
                        "disabled:cursor-default",
                        revealCorrect
                          ? "glow-success animate-correct border-success/60 bg-success-soft"
                          : revealWrong
                            ? "glow-danger animate-shake border-danger/60 bg-danger-soft"
                            : selected
                              ? "border-purple/60 bg-brand-soft shadow-[0_4px_16px_rgba(124,58,237,0.25)]"
                              : "border-border-strong bg-surface-2/60 hover:-translate-y-0.5 hover:border-purple/40 hover:bg-surface-3/70",
                      )}
                    >
                      <En>{option}</En>
                      {revealCorrect ? <Check className="size-4 shrink-0 text-on-success" /> : null}
                      {revealWrong ? <X className="size-4 shrink-0 text-on-danger" /> : null}
                    </button>
                  );
                })}
              </div>
              {submitted ? (
                <div className="mt-3 rounded-xl border border-border bg-surface-3/50 px-3.5 py-2.5">
                  <p className="text-[11px] font-semibold tracking-[0.09em] text-dim uppercase">{t.common.why}</p>
                  <En as="p" className="mt-1 text-sm text-muted">
                    {question.explanation}
                  </En>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <Button size="lg" onClick={submit} disabled={!allAnswered} className="w-full sm:w-auto">
          <Check className="size-4" />
          {t.exercise.checkAnswers}
        </Button>
      ) : (
        <div className="space-y-4">
          <div
            className={cn(
              "flex items-center gap-4 rounded-2xl border p-4",
              score >= 80
                ? "border-success/35 bg-success-soft/50"
                : score >= 50
                  ? "border-accent/35 bg-accent-soft/40"
                  : "border-danger/35 bg-danger-soft/40",
            )}
          >
            <RingProgress
              value={score}
              size={64}
              stroke={7}
              tone={score >= 80 ? "success" : score >= 50 ? "amber" : "brand"}
            >
              <span className="text-sm font-semibold tabular-nums">{score}%</span>
            </RingProgress>
            <div className="min-w-0">
              <p className="font-semibold">{t.exercise.listeningScore}</p>
              <p className="mt-0.5 text-sm text-muted">
                {score >= 80
                  ? t.exercise.scoreHigh
                  : score >= 50
                    ? t.exercise.scoreMid
                    : t.exercise.scoreLow}
              </p>
            </div>
          </div>

          {/* Transcript + replay by line ------------------------------------ */}
          <div className="rounded-2xl border border-border bg-surface-2/40 p-4 backdrop-blur sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="flex items-center gap-2 font-semibold">
                <Headphones className="size-4 text-on-cyan" />
                {t.exercise.transcript}
              </h4>
              <Button variant="ghost" size="sm" onClick={() => setShowTranscript((v) => !v)}>
                {showTranscript ? t.common.hide : t.common.show}
              </Button>
            </div>
            {showTranscript ? (
              <ul className="space-y-2">
                {exercise.lines.map((line, index) => (
                  <li
                    key={`${line.speaker}-${index}`}
                    className={cn(
                      "flex items-start gap-3 rounded-xl px-3 py-2 transition-colors",
                      playingIndex === index
                        ? "bg-brand-soft ring-1 ring-purple/30"
                        : "hover:bg-surface-3/40",
                    )}
                  >
                    <button
                      type="button"
                      aria-label={`${t.common.replay} ${index + 1}`}
                      onClick={() =>
                        speak(line.text, { accent: exercise.accent, rate: (line.rate ?? 1) * speed })
                      }
                      className="press mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-surface-3 text-dim transition-colors hover:text-on-cyan"
                    >
                      <RotateCcw className="size-3.5" />
                    </button>
                    <En className="min-w-0 text-sm">
                      <span className="font-medium">{line.speaker}: </span>
                      <span className="text-muted">{line.text}</span>
                    </En>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {exercise.hardExpressions.length ? (
            <div className="rounded-2xl border border-purple/25 bg-brand-soft/30 p-4 backdrop-blur sm:p-5">
              <h4 className="text-[11px] font-semibold tracking-[0.09em] text-on-brand uppercase">
                {t.exercise.keepExpressions}
              </h4>
              <ul className="mt-3 space-y-2.5">
                {exercise.hardExpressions.map((item) => (
                  <li key={item.phrase} className="flex items-start gap-2.5 text-sm">
                    <button
                      type="button"
                      aria-label={fmt(t.exercise.hearWord, { word: item.phrase })}
                      onClick={() => speak(item.phrase, { accent: exercise.accent })}
                      className="press mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-surface-2 text-dim transition-colors hover:text-on-brand"
                    >
                      <Volume2 className="size-3" />
                    </button>
                    <En>
                      <span className="font-medium">{item.phrase}</span>
                      <span className="text-muted"> — {item.meaning}</span>
                    </En>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}


