"use client";

import { useEffect, useRef, useState } from "react";
import { Lightbulb, Mic, Send, Square, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { ProgressBar, RingProgress } from "@/components/ui/progress";
import { useSpeech, useSpeechRecognition } from "@/lib/speech";
import { cn } from "@/lib/utils";
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
        setError(data.error ?? "Could not evaluate that answer.");
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
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">{scenario.situation}</h3>
          <Badge tone="brand">{scenario.level.replace("-", " ")}</Badge>
        </div>
        <p className="mt-2 text-sm text-muted">{scenario.context}</p>
      </div>

      <div className="rounded-2xl border border-purple/25 bg-brand-soft/40 p-4 backdrop-blur">
        <p className="flex items-start gap-2.5 font-medium">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-on-brand" />
          {scenario.prompt}
        </p>
        <p className="mt-2 text-sm text-muted">Grammar in focus: {scenario.focus}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 -ml-2"
          onClick={() => speak(scenario.prompt)}
          aria-label="Hear the task"
        >
          <Volume2 className="size-4" />
          Hear the task
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
            aria-label={recognition.listening ? "Stop recording" : "Answer out loud"}
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
                  Recording
                  <span className="font-mono text-sm text-muted tabular-nums">
                    {formatClock(seconds)}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted">
                  Speak naturally — press stop when you&apos;ve finished your answer.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">
                  {recognition.supported ? "Answer out loud" : "Say it out loud, then type it"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {recognition.failed
                    ? "The microphone isn't available — type your answer below and you'll still get full feedback."
                    : recognition.supported
                      ? "Tap the microphone, or type your answer below. Either way, say it aloud."
                      : "Speech recognition isn't supported in this browser — typing still gets you full feedback."}
                </p>
              </>
            )}
          </div>
        </div>

        <Textarea
          rows={4}
          value={text}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Type what you said…"
          aria-label="Your answer"
          disabled={recognition.listening}
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={submit} loading={loading} disabled={!text.trim()}>
            <Send className="size-4" />
            Get feedback
          </Button>
          <Button variant="ghost" onClick={() => setShowModel((v) => !v)}>
            {showModel ? "Hide model answer" : "Show a model answer"}
          </Button>
        </div>

        {error ? <p className="text-sm text-on-danger">{error}</p> : null}

        {showModel ? (
          <div className="animate-in-up rounded-xl border border-border bg-surface-2/60 p-4 text-sm">
            <p className="font-medium">One natural way to answer</p>
            <p className="mt-1.5 text-muted">{scenario.modelAnswer}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => speak(scenario.modelAnswer)}
            >
              <Volume2 className="size-4" />
              Listen
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
          <p className="text-[11px] font-semibold tracking-[0.09em] text-dim uppercase">Overall</p>
          <p className="mt-1 text-sm text-muted">{feedback.summary}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["Vocabulary", feedback.vocabulary],
          ["Grammar", feedback.grammar],
          ["Naturalness", feedback.naturalness],
          ["Communication", feedback.communication],
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
            What worked
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {feedback.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-accent/30 bg-accent-soft/40 p-4">
          <p className="text-[11px] font-semibold tracking-[0.09em] text-on-accent uppercase">
            What to change next time
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {feedback.improvements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {feedback.suggestedPhrases.length ? (
        <div>
          <p className="text-[11px] font-semibold tracking-[0.09em] text-dim uppercase">
            Try folding these in
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {feedback.suggestedPhrases.map((phrase) => (
              <Badge key={phrase} tone="brand">
                {phrase}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
