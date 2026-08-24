"use client";

import { useState } from "react";
import { Check, Mic, MicOff, RotateCcw, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSpeech, useSpeechRecognition } from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { PronunciationExercise as Drill } from "@/types";

const KIND_LABEL: Record<Drill["kind"], string> = {
  sound: "Sound",
  stress: "Word stress",
  rhythm: "Rhythm",
  "connected-speech": "Connected speech",
  "common-mistake": "Common mistake",
};

/**
 * Listen → repeat → compare → try again.
 *
 * Where the browser supports speech recognition we compare what was heard with
 * the target and give a similarity score; where it doesn't, the learner
 * self-rates. Both paths keep the same message: the goal is clarity, not an
 * accent transplant.
 */
export function PronunciationExerciseCard({
  drill,
  accent = "usa",
  onComplete,
}: {
  drill: Drill;
  accent?: string;
  onComplete?: (result: { score: number; correct: boolean; answer?: string }) => void;
}) {
  const { speak, speaking } = useSpeech();
  const recognition = useSpeechRecognition(accent === "uk" ? "en-GB" : "en-US");
  const [attempt, setAttempt] = useState<{ heard: string; score: number } | null>(null);

  function record() {
    if (recognition.listening) {
      recognition.stop();
      const heard = recognition.transcript.trim();
      const score = similarity(heard, drill.target);
      setAttempt({ heard, score });
      onComplete?.({ score, correct: score >= 60, answer: heard });
      return;
    }
    setAttempt(null);
    recognition.start();
  }

  function selfRate(score: number) {
    setAttempt({ heard: "", score });
    onComplete?.({ score, correct: score >= 60 });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">{drill.focus}</h3>
          <p className="mt-1 text-sm text-muted">{drill.explanation}</p>
        </div>
        <Badge tone="brand">{KIND_LABEL[drill.kind]}</Badge>
      </div>

      <div className="rounded-2xl bg-surface-2 p-5">
        <p className="text-lg font-medium">{drill.target}</p>
        <p className="mt-1 font-mono text-sm text-muted">{drill.phonetic}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => speak(drill.target, { accent, rate: 0.85 })} disabled={speaking}>
            <Volume2 className="size-4" />
            Listen slowly
          </Button>
          <Button variant="secondary" onClick={() => speak(drill.target, { accent, rate: 1 })} disabled={speaking}>
            <Volume2 className="size-4" />
            Normal speed
          </Button>
          <Button
            variant={recognition.listening ? "danger" : "outline"}
            onClick={record}
            disabled={!recognition.supported}
            title={recognition.supported ? undefined : "Speech recognition isn't available in this browser"}
          >
            {recognition.listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            {recognition.listening ? "Stop & compare" : "Repeat it"}
          </Button>
        </div>
        {recognition.listening ? (
          <p className="mt-3 text-sm text-muted">Listening… say the sentence, then press stop.</p>
        ) : null}
      </div>

      {attempt ? (
        <div
          className={cn(
            "animate-in-up rounded-2xl p-4",
            attempt.score >= 75 ? "bg-success-soft" : attempt.score >= 50 ? "bg-accent-soft" : "bg-danger-soft",
          )}
        >
          <p className="font-medium">
            {attempt.score >= 75
              ? "Clear — a listener would have no trouble."
              : attempt.score >= 50
                ? "Understandable. Tighten the highlighted sounds."
                : "Hard to catch. Slow down and exaggerate the target sound."}
          </p>
          {attempt.heard ? (
            <p className="mt-1.5 text-sm text-muted">
              We heard: <span className="italic">“{attempt.heard}”</span> · match {attempt.score}%
            </p>
          ) : null}
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setAttempt(null)}>
            <RotateCcw className="size-4" />
            Try again
          </Button>
        </div>
      ) : !recognition.supported ? (
        <div className="rounded-2xl bg-surface-2 p-4">
          <p className="text-sm font-medium">How close were you?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => selfRate(40)}>
              Not close
            </Button>
            <Button size="sm" variant="outline" onClick={() => selfRate(70)}>
              Getting there
            </Button>
            <Button size="sm" variant="success" onClick={() => selfRate(95)}>
              <Check className="size-4" />
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      {drill.minimalPairs.length ? (
        <div>
          <p className="text-sm font-medium">Where it changes the meaning</p>
          <ul className="mt-2 space-y-2">
            {drill.minimalPairs.map((pair) => (
              <li key={`${pair.a}-${pair.b}`} className="flex flex-wrap items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => speak(pair.a, { accent, rate: 0.9 })}
                  className="rounded-lg bg-surface-2 px-2.5 py-1 font-medium hover:text-brand"
                >
                  {pair.a}
                </button>
                <span className="text-muted">vs</span>
                <button
                  type="button"
                  onClick={() => speak(pair.b, { accent, rate: 0.9 })}
                  className="rounded-lg bg-surface-2 px-2.5 py-1 font-medium hover:text-brand"
                >
                  {pair.b}
                </button>
                <span className="text-muted">— {pair.note}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="rounded-xl bg-brand-soft/50 p-4 text-sm">
        <strong className="font-medium">Tip:</strong> {drill.tip}
      </p>
    </div>
  );
}

/** Rough word-overlap similarity — enough to tell "clear" from "not close". */
export function similarity(heard: string, target: string): number {
  const normalise = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z\s']/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  const a = normalise(heard);
  const b = normalise(target);
  if (!a.length || !b.length) return 0;
  const bag = new Map<string, number>();
  for (const word of b) bag.set(word, (bag.get(word) ?? 0) + 1);
  let matched = 0;
  for (const word of a) {
    const count = bag.get(word) ?? 0;
    if (count > 0) {
      matched += 1;
      bag.set(word, count - 1);
    }
  }
  return Math.round((matched / b.length) * 100);
}
