"use client";

import { useState } from "react";
import { ArrowDown, Check, Mic, RotateCcw, Square, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RingProgress } from "@/components/ui/progress";
import { useSpeech, useSpeechRecognition } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import { En } from "@/components/ui/en";
import type { PronunciationExercise as Drill } from "@/types";

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
  const t = useT();
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
          <En as="h3" className="text-lg font-semibold">
            {drill.focus}
          </En>
          <En as="p" className="mt-1 text-sm text-muted">
            {drill.explanation}
          </En>
        </div>
        <Badge tone="brand">{t.pronunciation.kinds[drill.kind]}</Badge>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-surface-2/50 p-5 backdrop-blur">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 h-48 opacity-60"
          style={{
            background:
              "radial-gradient(55% 100% at 50% 100%, rgba(124,58,237,0.22), rgba(124,58,237,0) 70%)",
          }}
        />
        <div className="relative text-center">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-dim uppercase">
            {t.pronunciation.word}
          </span>
          <En as="p" className="mt-1.5 text-2xl leading-snug font-semibold sm:text-3xl">
            {drill.target}
          </En>
          <p className="mt-1.5 font-mono text-sm text-muted">{drill.phonetic}</p>
          <SoundWave active={speaking || recognition.listening} tone={recognition.listening ? "cyan" : "purple"} />
        </div>

        {/* The three-step loop the method is built on. */}
        <div className="relative mt-4 grid gap-2.5 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          <StepButton
            label={t.pronunciation.listen}
            hint={t.pronunciation.listenHint}
            icon={<Volume2 className="size-4" />}
            onClick={() => speak(drill.target, { accent, rate: 0.85 })}
            disabled={speaking}
          />
          <StepArrow />
          <StepButton
            label={recognition.listening ? t.pronunciation.stop : t.pronunciation.repeat}
            hint={recognition.listening ? t.pronunciation.recordingHint : t.pronunciation.repeatHint}
            icon={recognition.listening ? <Square className="size-4 fill-current" /> : <Mic className="size-4" />}
            onClick={record}
            disabled={!recognition.supported || recognition.failed}
            tone={recognition.listening ? "danger" : "cyan"}
            title={recognition.supported ? undefined : "Speech recognition isn't available in this browser"}
          />
          <StepArrow />
          <StepButton
            label={t.pronunciation.compare}
            hint={t.pronunciation.compareHint}
            icon={<Volume2 className="size-4" />}
            onClick={() => speak(drill.target, { accent, rate: 1 })}
            disabled={speaking}
          />
        </div>
      </div>

      {attempt ? (
        <div
          className={cn(
            "animate-in-up flex items-center gap-4 rounded-2xl border p-4",
            attempt.score >= 75
              ? "border-success/35 bg-success-soft/50"
              : attempt.score >= 50
                ? "border-accent/35 bg-accent-soft/40"
                : "border-danger/35 bg-danger-soft/40",
          )}
        >
          <RingProgress
            value={attempt.score}
            size={68}
            stroke={7}
            tone={attempt.score >= 75 ? "success" : attempt.score >= 50 ? "amber" : "brand"}
          >
            <span className="text-sm font-semibold tabular-nums">{attempt.score}%</span>
          </RingProgress>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {attempt.score >= 75
                ? t.pronunciation.clear
                : attempt.score >= 50
                  ? t.pronunciation.understandable
                  : t.pronunciation.hardToCatch}
            </p>
            {attempt.heard ? (
              <p className="mt-1 text-sm text-muted">
                {t.pronunciation.heardYou} <span className="italic ltr">“{attempt.heard}”</span>
              </p>
            ) : null}
            <Button variant="ghost" size="sm" className="mt-1.5 -ms-2" onClick={() => setAttempt(null)}>
              <RotateCcw className="size-4" />
              {t.common.tryAgain}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface-2/50 p-4">
          <p className="text-[11px] font-semibold tracking-[0.09em] text-dim uppercase">
            {t.pronunciation.howClose}
          </p>
          <p className="mt-1 text-sm text-muted">
            {recognition.failed
              ? t.pronunciation.selfRateMic
              : recognition.supported
                ? t.pronunciation.selfRateChoice
                : t.pronunciation.selfRateUnsupported}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => selfRate(40)}>
              {t.pronunciation.notClose}
            </Button>
            <Button size="sm" variant="outline" onClick={() => selfRate(70)}>
              {t.pronunciation.gettingThere}
            </Button>
            <Button size="sm" variant="success" onClick={() => selfRate(95)}>
              <Check className="size-4" />
              {t.pronunciation.veryClear}
            </Button>
          </div>
        </div>
      )}

      {drill.minimalPairs.length ? (
        <div>
          <p className="text-[11px] font-semibold tracking-[0.09em] text-dim uppercase">
            {t.pronunciation.minimalPairs}
          </p>
          <ul className="mt-2 space-y-2">
            {drill.minimalPairs.map((pair) => (
              <li key={`${pair.a}-${pair.b}`} className="flex flex-wrap items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => speak(pair.a, { accent, rate: 0.9 })}
                  className="press rounded-lg border border-border bg-surface-2/70 px-2.5 py-1 font-medium transition-colors hover:border-purple/40 hover:text-on-brand"
                >
                  {pair.a}
                </button>
                <span className="text-muted">vs</span>
                <button
                  type="button"
                  onClick={() => speak(pair.b, { accent, rate: 0.9 })}
                  className="press rounded-lg border border-border bg-surface-2/70 px-2.5 py-1 font-medium transition-colors hover:border-cyan/40 hover:text-on-cyan"
                >
                  {pair.b}
                </button>
                <En className="text-muted">— {pair.note}</En>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="rounded-xl border border-purple/25 bg-brand-soft/35 p-4 text-sm">
        <strong className="font-medium text-on-brand">{t.pronunciation.tip}:</strong>{" "}
        <En>{drill.tip}</En>
      </p>
    </div>
  );
}

/** Animated sound wave — the visual anchor for listen and repeat. */
function SoundWave({ active, tone }: { active: boolean; tone: "purple" | "cyan" }) {
  const colour = tone === "cyan" ? "var(--cyan)" : "var(--purple-bright)";
  return (
    <div className="mt-4 flex h-8 items-center justify-center gap-1" aria-hidden>
      {Array.from({ length: 22 }).map((_, index) => (
        <span
          key={index}
          className="w-1 rounded-full transition-all duration-300"
          style={{
            height: `${20 + Math.abs(Math.sin(index * 0.7)) * 70}%`,
            background: active ? colour : "var(--surface-3)",
            boxShadow: active ? `0 0 8px ${colour}` : undefined,
            animation: active
              ? `wave ${620 + (index % 4) * 140}ms ease-in-out ${index * 30}ms infinite`
              : undefined,
          }}
        />
      ))}
    </div>
  );
}

function StepButton({
  label,
  hint,
  icon,
  onClick,
  disabled,
  tone = "neutral",
  title,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "neutral" | "cyan" | "danger";
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "press flex min-h-14 w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-start transition-all duration-250",
        "hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0",
        tone === "danger"
          ? "border-danger/50 bg-danger-soft"
          : tone === "cyan"
            ? "border-cyan/40 bg-cyan-soft hover:border-cyan/60"
            : "border-border-strong bg-surface/60 hover:border-purple/45",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg text-white",
          tone === "danger"
            ? "bg-danger"
            : tone === "cyan"
              ? "[background:linear-gradient(135deg,#22d3ee,#2563eb)]"
              : "[background:var(--grad-brand)]",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block truncate text-xs text-dim">{hint}</span>
      </span>
    </button>
  );
}

function StepArrow() {
  return (
    <span className="hidden justify-center text-dim sm:flex" aria-hidden>
      <ArrowDown className="size-4 -rotate-90" />
    </span>
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
