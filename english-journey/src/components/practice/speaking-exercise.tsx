"use client";

import { useEffect, useRef, useState } from "react";
import { Lightbulb, Mic, Send, Square, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { ProgressBar, RingProgress } from "@/components/ui/progress";
import { useSpeech, useSpeechRecognition } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { useI18n, useT } from "@/i18n/provider";
import { En } from "@/components/ui/en";
import type { SpeakingExercise as Scenario } from "@/types";

export interface SpeakingFeedbackShape {
  score: number;
  vocabulary: number;
  grammar: number;
  naturalness: number;
  communication: number;
  strengths: string[];
  improvements: string[];
  suggestedPhrases: string[];
  summary: string;
}

/**
 * Speaking practice. The learner speaks (browser speech recognition when
 * available) or types, and receives coaching — never a bare "wrong".
 */
export function SpeakingExerciseCard({
  scenario,
  onComplete,
}: {
  scenario: Scenario;
  onComplete?: (result: { score: number; correct: boolean; answer: string; feedback: string }) => void;
}) {
  const { speak } = useSpeech();
  const { t, fmt } = useI18n();
  const recognition = useSpeechRecognition();
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<SpeakingFeedbackShape | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModel, setShowModel] = useState(false);
  const [now, setNow] = useState(0);
  const startedAt = useRef(0);

  const text = recognition.listening ? recognition.transcript : answer;
  const seconds = recognition.listening ? now : 0;

  // A visible recording timer — people speak longer when they can see the clock.
  useEffect(() => {
    if (!recognition.listening) return;
    const began = Date.now();
    startedAt.current = began;
    const id = setInterval(() => setNow(Math.floor((Date.now() - began) / 1000)), 500);
    return () => clearInterval(id);
  }, [recognition.listening]);

  function toggleMic() {
    if (recognition.listening) {
      recognition.stop();
      setAnswer((prev) => (recognition.transcript ? recognition.transcript : prev));
    } else {
      recognition.start();
    }
  }

  async function submit() {
    const value = (recognition.listening ? recognition.transcript : answer).trim();
    if (!value) return;
    if (recognition.listening) recognition.stop();
    setAnswer(value);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/speaking/grade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenarioId: scenario.id, answer: value }),
      });
      const data = (await response.json()) as { feedback?: SpeakingFeedbackShape; error?: string };
      if (!response.ok || !data.feedback) {
        setError(data.error ?? t.speaking.sayFirst);
        return;
      }
      setFeedback(data.feedback);
      onComplete?.({
        score: data.feedback.score,
        correct: data.feedback.score >= 60,
        answer: value,
        feedback: data.feedback.summary,
      });
    } catch {
      setError(t.common.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <En as="h3" className="text-lg font-semibold">
            {scenario.situation}
          </En>
          <Badge tone="brand">{scenario.level.replace("-", " ")}</Badge>
        </div>
        <En as="p" className="mt-2 text-sm text-muted">
          {scenario.context}
        </En>
      </div>

      <div className="rounded-2xl border border-purple/25 bg-brand-soft/40 p-4 backdrop-blur">
        <p className="flex items-start gap-2.5 font-medium">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-on-brand" />
          <En>{scenario.prompt}</En>
        </p>
        <p className="mt-2 text-sm text-muted">
          {t.speaking.grammarFocus}: <En>{scenario.focus}</En>
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 -ms-2"
          onClick={() => speak(scenario.prompt)}
          aria-label={t.speaking.hearTask}
        >
          <Volume2 className="size-4" />
          {t.speaking.hearTask}
        </Button>
      </div>

      <div className="space-y-3">
        {/* The microphone is the centrepiece: a lit ring that pulses while it
            listens, with a running timer beside it. */}
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-strong bg-surface-2/50 p-5 backdrop-blur sm:flex-row sm:items-center sm:gap-5">
          <button
            type="button"
            onClick={toggleMic}
            disabled={!recognition.supported || recognition.failed}
            aria-label={recognition.listening ? t.speaking.stopRecording : t.speaking.answerOutLoud}
            title={recognition.supported ? undefined : "Speech recognition isn't available in this browser"}
            className={cn(
              "press relative grid size-16 shrink-0 place-items-center rounded-full text-white transition-transform duration-250",
              "hover:scale-105 disabled:opacity-50 disabled:hover:scale-100",
              recognition.listening
                ? "[background:linear-gradient(135deg,#f43f5e,#be123c)] shadow-[0_8px_26px_rgba(244,63,94,0.45),inset_0_1px_0_rgba(255,255,255,0.3)]"
                : "[background:linear-gradient(135deg,#22d3ee,#7c3aed)] shadow-[0_8px_26px_rgba(34,211,238,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]",
            )}
          >
            {recognition.listening ? (
              <>
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full ring-2 ring-danger/60"
                  style={{ animation: "ring-pulse 1.5s ease-out infinite" }}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full ring-2 ring-danger/40"
                  style={{ animation: "ring-pulse 1.5s ease-out 0.6s infinite" }}
                />
                <Square className="size-5 fill-current" />
              </>
            ) : (
              <Mic className="size-6" />
            )}
          </button>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            {recognition.listening ? (
              <>
                <p className="flex items-center justify-center gap-2 font-semibold sm:justify-start">
                  <span className="size-2 animate-pulse rounded-full bg-danger" aria-hidden />
                  {t.speaking.recording}
                  <span className="font-mono text-sm text-muted tabular-nums">
                    {formatClock(seconds)}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted">
                  {t.speaking.speakNaturally}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">
                  {recognition.supported ? t.speaking.answerOutLoud : t.speaking.sayThenType}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {recognition.failed
                    ? t.speaking.micUnavailable
                    : recognition.supported
                      ? t.speaking.tapMic
                      : t.speaking.noRecognition}
                </p>
              </>
            )}
          </div>
        </div>

        <Textarea
          rows={4}
          value={text}
          onChange={(event) => setAnswer(event.target.value)}
          dir="ltr"
          placeholder={t.speaking.typePlaceholder}
          aria-label={t.speaking.yourAnswer}
          disabled={recognition.listening}
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={submit} loading={loading} disabled={!text.trim()}>
            <Send className="size-4" />
            {t.speaking.getFeedback}
          </Button>
          <Button variant="ghost" onClick={() => setShowModel((v) => !v)}>
            {showModel ? t.speaking.hideModel : t.speaking.showModel}
          </Button>
        </div>

        {error ? <p className="text-sm text-on-danger">{error}</p> : null}

        {showModel ? (
          <div className="animate-in-up rounded-xl border border-border bg-surface-2/60 p-4 text-sm">
            <p className="font-medium">{t.speaking.modelAnswer}</p>
            <En as="p" className="mt-1.5 text-muted">
              {scenario.modelAnswer}
            </En>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => speak(scenario.modelAnswer)}
            >
              <Volume2 className="size-4" />
              {t.common.listen}
            </Button>
          </div>
        ) : null}
      </div>

      {feedback ? <SpeakingFeedbackPanel feedback={feedback} /> : null}
    </div>
  );
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${`${seconds}`.padStart(2, "0")}`;
}

export function SpeakingFeedbackPanel({ feedback }: { feedback: SpeakingFeedbackShape }) {
  const t = useT();
  return (
    <div className="animate-in-up card card-elevated space-y-5 p-5">
      <div className="flex flex-wrap items-center gap-4">
        <RingProgress
          value={feedback.score}
          size={76}
          stroke={8}
          tone={feedback.score >= 80 ? "success" : feedback.score >= 60 ? "brand" : "amber"}
        >
          <span className="text-base font-semibold tabular-nums">{feedback.score}%</span>
        </RingProgress>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.09em] text-dim uppercase">
            {t.speaking.overall}
          </p>
          <p className="mt-1 text-sm text-muted">{feedback.summary}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          [t.speaking.vocabulary, feedback.vocabulary],
          [t.speaking.grammar, feedback.grammar],
          [t.speaking.naturalness, feedback.naturalness],
          [t.speaking.communication, feedback.communication],
        ].map(([label, value]) => (
          <ProgressBar
            key={label as string}
            label={label as string}
            value={value as number}
            showValue
            tone={(value as number) >= 75 ? "success" : (value as number) >= 50 ? "brand" : "accent"}
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-success/30 bg-success-soft/50 p-4">
          <p className="text-[11px] font-semibold tracking-[0.09em] text-on-success uppercase">
            {t.speaking.whatWorked}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {feedback.strengths.map((item) => (
              <En as="li" key={item}>
                {item}
              </En>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-accent/30 bg-accent-soft/40 p-4">
          <p className="text-[11px] font-semibold tracking-[0.09em] text-on-accent uppercase">
            {t.speaking.whatToChange}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {feedback.improvements.map((item) => (
              <En as="li" key={item}>
                {item}
              </En>
            ))}
          </ul>
        </div>
      </div>

      {feedback.suggestedPhrases.length ? (
        <div>
          <p className="text-[11px] font-semibold tracking-[0.09em] text-dim uppercase">
            {t.speaking.tryPhrases}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {feedback.suggestedPhrases.map((phrase) => (
              <Badge key={phrase} tone="brand">
                <En>{phrase}</En>
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
