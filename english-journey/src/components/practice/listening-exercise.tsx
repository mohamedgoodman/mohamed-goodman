"use client";

import { useMemo, useState } from "react";
import { Check, Eye, Headphones, Pause, Play, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { ListeningExercise as Exercise } from "@/types";

const TIER_LABEL: Record<Exercise["tier"], { label: string; tone: "success" | "brand" | "accent" | "danger" }> = {
  easy: { label: "Easy", tone: "success" },
  normal: { label: "Normal", tone: "brand" },
  challenging: { label: "Challenging", tone: "accent" },
  native: { label: "Native speed", tone: "danger" },
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
  const { supported, speaking, speakSequence, speak, cancel } = useSpeech();
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

  function play() {
    if (speaking) {
      cancel();
      setPlayingIndex(null);
      return;
    }
    setPlays((n) => n + 1);
    speakSequence(exercise.lines, {
      accent: exercise.accent,
      rate: speed,
      onLine: setPlayingIndex,
      onEnd: () => setPlayingIndex(null),
    });
  }

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
          <h3 className="text-lg font-semibold">{exercise.title}</h3>
          <p className="mt-0.5 text-sm text-muted">
            ~{exercise.seconds}s · {exercise.lines.length} lines · {accentLabel(exercise.accent)} accent
          </p>
        </div>
        {showTierBadge ? (
          <Badge tone={TIER_LABEL[exercise.tier].tone}>{TIER_LABEL[exercise.tier].label}</Badge>
        ) : null}
      </div>

      <div className="rounded-2xl bg-surface-2 p-5 text-center">
        <Button size="lg" onClick={play} className="w-full sm:w-auto">
          {speaking ? <Pause className="size-5" /> : <Play className="size-5" />}
          {speaking ? "Stop" : plays === 0 ? "Play audio" : "Play again"}
        </Button>
        <p className="mt-3 text-sm text-muted">
          {supported
            ? plays === 0
              ? "Listen before you look at anything else."
              : `Played ${plays} time${plays === 1 ? "" : "s"}. Replaying is not cheating — replaying instead of thinking is.`
            : "Your browser can't play speech. The transcript is available below."}
        </p>
        {!supported ? (
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowTranscript(true)}>
            <Eye className="size-4" />
            Show transcript
          </Button>
        ) : null}
      </div>

      {/* Questions ---------------------------------------------------------- */}
      <div className="space-y-4">
        {exercise.questions.map((question, qIndex) => {
          const chosen = answers[qIndex];
          const isCorrect = chosen === question.answerIndex;
          return (
            <div key={question.id} className="card p-4 sm:p-5">
              <p className="font-medium">{question.prompt}</p>
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
                        "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all",
                        "disabled:cursor-default",
                        revealCorrect
                          ? "border-success bg-success-soft"
                          : revealWrong
                            ? "border-danger bg-danger-soft"
                            : selected
                              ? "border-brand bg-brand-soft/60"
                              : "border-border hover:bg-surface-2",
                      )}
                    >
                      <span>{option}</span>
                      {revealCorrect ? <Check className="size-4 shrink-0 text-success" /> : null}
                      {revealWrong ? <X className="size-4 shrink-0 text-danger" /> : null}
                    </button>
                  );
                })}
              </div>
              {submitted ? (
                <p className="mt-3 rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm text-muted">
                  {question.explanation}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <Button size="lg" onClick={submit} disabled={!allAnswered} className="w-full sm:w-auto">
          <Check className="size-4" />
          Check my answers
        </Button>
      ) : (
        <div className="space-y-4">
          <div
            className={cn(
              "rounded-2xl p-4",
              score >= 80 ? "bg-success-soft" : score >= 50 ? "bg-accent-soft" : "bg-danger-soft",
            )}
          >
            <p className="font-medium">
              Listening score: {score}%
              {score >= 80
                ? " — you're ready for a faster tier."
                : score >= 50
                  ? " — solid. Replay the lines you missed."
                  : " — this one was hard. That's information, not failure."}
            </p>
          </div>

          {/* Transcript + replay by line ------------------------------------ */}
          <div className="card p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="flex items-center gap-2 font-semibold">
                <Headphones className="size-4" />
                Transcript
              </h4>
              <Button variant="ghost" size="sm" onClick={() => setShowTranscript((v) => !v)}>
                {showTranscript ? "Hide" : "Show"}
              </Button>
            </div>
            {showTranscript ? (
              <ul className="space-y-2">
                {exercise.lines.map((line, index) => (
                  <li
                    key={`${line.speaker}-${index}`}
                    className={cn(
                      "flex items-start gap-3 rounded-xl px-3 py-2 transition-colors",
                      playingIndex === index ? "bg-brand-soft" : "",
                    )}
                  >
                    <button
                      type="button"
                      aria-label={`Replay line ${index + 1}`}
                      onClick={() =>
                        speak(line.text, { accent: exercise.accent, rate: (line.rate ?? 1) * speed })
                      }
                      className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted transition-colors hover:text-brand"
                    >
                      <RotateCcw className="size-3.5" />
                    </button>
                    <span className="min-w-0 text-sm">
                      <span className="font-medium">{line.speaker}: </span>
                      <span className="text-muted">{line.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {exercise.hardExpressions.length ? (
            <div className="card p-4 sm:p-5">
              <h4 className="font-semibold">Expressions worth keeping</h4>
              <ul className="mt-3 space-y-2.5">
                {exercise.hardExpressions.map((item) => (
                  <li key={item.phrase} className="text-sm">
                    <button
                      type="button"
                      onClick={() => speak(item.phrase, { accent: exercise.accent })}
                      className="font-medium text-brand hover:underline"
                    >
                      {item.phrase}
                    </button>
                    <span className="text-muted"> — {item.meaning}</span>
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

function accentLabel(accent: string): string {
  const map: Record<string, string> = {
    usa: "American",
    uk: "British",
    canada: "Canadian",
    australia: "Australian",
    ireland: "Irish",
  };
  return map[accent] ?? accent;
}
