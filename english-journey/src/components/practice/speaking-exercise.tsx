"use client";

import { useState } from "react";
import { Lightbulb, Mic, MicOff, Send, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { ProgressBar } from "@/components/ui/progress";
import { useSpeech, useSpeechRecognition } from "@/lib/speech";
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

  const text = recognition.listening ? recognition.transcript : answer;

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

      <div className="rounded-2xl bg-brand-soft/50 p-4">
        <p className="flex items-start gap-2 font-medium">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand" />
          {scenario.prompt}
        </p>
        <p className="mt-2 text-sm text-muted">Grammar in focus: {scenario.focus}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => speak(scenario.prompt)}
          aria-label="Hear the task"
        >
          <Volume2 className="size-4" />
          Hear the task
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={recognition.listening ? "danger" : "secondary"}
            onClick={toggleMic}
            disabled={!recognition.supported}
            title={recognition.supported ? undefined : "Speech recognition isn't available in this browser"}
          >
            {recognition.listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            {recognition.listening ? "Stop recording" : "Answer out loud"}
          </Button>
          <span className="text-sm text-muted">
            {recognition.supported
              ? "Speak your answer — or type it below. Say it out loud either way."
              : "Speech recognition isn't supported here. Say your answer out loud, then type it."}
          </span>
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

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        {showModel ? (
          <div className="rounded-xl bg-surface-2 p-4 text-sm">
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

export function SpeakingFeedbackPanel({ feedback }: { feedback: SpeakingFeedbackShape }) {
  return (
    <div className="animate-in-up card space-y-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Overall</p>
          <p className="text-2xl font-semibold tabular-nums">{feedback.score}%</p>
        </div>
        <p className="max-w-md text-sm text-muted">{feedback.summary}</p>
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
        <div className="rounded-xl bg-success-soft p-4">
          <p className="text-sm font-semibold text-success">What worked</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {feedback.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-accent-soft p-4">
          <p className="text-sm font-semibold text-accent">What to change next time</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {feedback.improvements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {feedback.suggestedPhrases.length ? (
        <div>
          <p className="text-sm font-medium">Try folding these in</p>
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
