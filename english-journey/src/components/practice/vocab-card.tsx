"use client";

import { useState } from "react";
import { Check, Volume2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { RealEnglishPhrase, VocabularyWord } from "@/types";

const REGISTER_TONE = {
  formal: "brand",
  neutral: "neutral",
  casual: "accent",
  slang: "danger",
} as const;

export function RegisterBadge({ register }: { register: VocabularyWord["register"] }) {
  const help: Record<VocabularyWord["register"], string> = {
    formal: "Formal — email, official settings, people you don't know",
    neutral: "Neutral — safe almost anywhere",
    casual: "Casual — friends, relaxed colleagues",
    slang: "Slang — only where you're sure of the relationship",
  };
  return (
    <Badge tone={REGISTER_TONE[register]} className="capitalize" >
      <span title={help[register]}>{register}</span>
    </Badge>
  );
}

/** Multiple-choice warm-up card for one word. */
export function VocabChoiceCard({
  word,
  options,
  onAnswer,
}: {
  word: VocabularyWord;
  options: string[];
  onAnswer?: (correct: boolean) => void;
}) {
  const { speak, speaking } = useSpeech();
  const [chosen, setChosen] = useState<string | null>(null);
  const answered = chosen !== null;
  const correct = chosen === word.definition;

  function choose(option: string) {
    if (answered) return;
    setChosen(option);
    onAnswer?.(option === word.definition);
  }

  return (
    <div className="space-y-5">
      {/* The word is the hero of this screen. */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h3 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          {word.term}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="font-mono text-sm text-muted">{word.phonetic}</span>
          <RegisterBadge register={word.register} />
        </div>
        <AudioButton
          label={`Hear ${word.term}`}
          active={speaking}
          onClick={() => speak(word.term)}
        />
      </div>

      <p className="text-center text-sm text-muted">What does it mean?</p>

      <div className="grid gap-2.5">
        {options.map((option, index) => {
          const isAnswer = option === word.definition;
          const selected = chosen === option;
          return (
            <OptionButton
              key={option}
              index={index}
              label={option}
              state={
                !answered
                  ? "idle"
                  : isAnswer
                    ? "correct"
                    : selected
                      ? "wrong"
                      : "dimmed"
              }
              onClick={() => choose(option)}
            />
          );
        })}
      </div>

      {answered ? <AnswerFeedback correct={correct} word={word} /> : null}
    </div>
  );
}

/** A circular, tactile audio control — the main interactive affordance here. */
export function AudioButton({
  label,
  onClick,
  active,
  size = "md",
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "press group relative grid shrink-0 place-items-center rounded-full text-white",
        "[background:var(--grad-brand)] shadow-[0_6px_20px_rgba(124,58,237,0.4),inset_0_1px_0_rgba(255,255,255,0.28)]",
        "transition-transform duration-250 hover:scale-105",
        size === "sm" ? "size-10" : "size-12",
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full ring-2 ring-cyan/60"
          style={{ animation: "ring-pulse 1.4s ease-out infinite" }}
        />
      ) : null}
      <Volume2 className={size === "sm" ? "size-4" : "size-5"} />
    </button>
  );
}

type OptionState = "idle" | "correct" | "wrong" | "dimmed";

/** Premium 3D answer option: raised while idle, lit green or shaken red after. */
function OptionButton({
  label,
  index,
  state,
  onClick,
}: {
  label: string;
  index: number;
  state: OptionState;
  onClick: () => void;
}) {
  const letter = String.fromCharCode(65 + index);
  return (
    <button
      type="button"
      disabled={state !== "idle"}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm",
        "transition-[transform,box-shadow,border-color,background] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "disabled:cursor-default",
        state === "idle" &&
          "border-border-strong bg-surface-2/70 shadow-[var(--shadow-sm),var(--inner-highlight)] backdrop-blur hover:-translate-y-0.5 hover:border-purple/50 hover:bg-surface-3/80 hover:shadow-[var(--shadow-md),0_8px_22px_rgba(124,58,237,0.22)] active:scale-[0.99]",
        state === "correct" && "glow-success animate-correct border-success/60 bg-success-soft",
        state === "wrong" && "glow-danger animate-shake border-danger/60 bg-danger-soft",
        state === "dimmed" && "border-border bg-surface-2/40 opacity-55",
      )}
    >
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-lg text-xs font-semibold transition-colors",
          state === "correct"
            ? "bg-success text-white"
            : state === "wrong"
              ? "bg-danger text-white"
              : "bg-surface-3 text-dim group-hover:text-text",
        )}
        aria-hidden
      >
        {state === "correct" ? (
          <Check className="size-4" strokeWidth={3} />
        ) : state === "wrong" ? (
          <X className="size-4" strokeWidth={3} />
        ) : (
          letter
        )}
      </span>
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  );
}

/**
 * Feedback is a hierarchy, not a paragraph: verdict → why → example →
 * how it's really used. Each level gets its own weight and colour.
 */
function AnswerFeedback({ correct, word }: { correct: boolean; word: VocabularyWord }) {
  const { speak } = useSpeech();
  return (
    <div
      className={cn(
        "animate-in-up overflow-hidden rounded-2xl border",
        correct ? "border-success/35 bg-success-soft/50" : "border-danger/35 bg-danger-soft/40",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-3",
          correct ? "bg-success/12" : "bg-danger/12",
        )}
      >
        <span
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-full text-white",
            correct ? "bg-success" : "bg-danger",
          )}
        >
          {correct ? <Check className="size-4" strokeWidth={3} /> : <X className="size-4" strokeWidth={3} />}
        </span>
        <span className={cn("font-semibold", correct ? "text-on-success" : "text-on-danger")}>
          {correct ? "Correct" : "Not quite"}
        </span>
        <span className="ml-auto font-mono text-xs text-dim">{word.phonetic}</span>
      </div>

      <div className="space-y-3.5 p-4">
        <FeedbackRow label="Why">
          <p className="text-[15px] text-text">{word.definition}</p>
        </FeedbackRow>

        <FeedbackRow label="Example">
          <button
            onClick={() => speak(word.example)}
            className="-mx-2 rounded-lg px-2 py-1 text-left text-[15px] text-muted transition-colors hover:bg-surface-2/60 hover:text-on-brand"
          >
            “{word.example}”
          </button>
        </FeedbackRow>

        <FeedbackRow label="Real life">
          <p className="text-sm text-muted">{word.realLifeExample}</p>
        </FeedbackRow>

        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {word.collocations.map((collocation) => (
            <span
              key={collocation}
              className="rounded-lg bg-surface-2/80 px-2 py-1 text-xs text-dim ring-1 ring-inset ring-border"
            >
              {collocation}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedbackRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[5.5rem_1fr] sm:gap-3">
      <span className="pt-0.5 text-[11px] font-medium tracking-[0.09em] text-dim uppercase">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Full detail view of a vocabulary word. */
export function VocabDetail({ word }: { word: VocabularyWord }) {
  const { speak } = useSpeech();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <AudioButton label={`Hear ${word.term}`} size="sm" onClick={() => speak(word.term)} />
        <h3 className="text-lg font-semibold">{word.term}</h3>
        <span className="font-mono text-sm text-dim">{word.phonetic}</span>
        <RegisterBadge register={word.register} />
        <Badge tone="neutral">{word.partOfSpeech}</Badge>
      </div>

      <p>{word.definition}</p>

      <div className="space-y-2 rounded-xl border border-border bg-surface-2/60 p-4 text-sm">
        <p>
          <span className="font-medium">Example: </span>
          <button
            className="-mx-2 rounded-lg px-2 py-1 text-left text-muted transition-colors hover:bg-surface-2/60 hover:text-on-brand"
            onClick={() => speak(word.example)}
          >
            {word.example}
          </button>
        </p>
        <p>
          <span className="font-medium">In real life: </span>
          <span className="text-muted">{word.realLifeExample}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ListBlock title="Collocations" items={word.collocations} />
        <ListBlock title="Similar" items={word.similar} />
        <ListBlock title="Opposites" items={word.opposites} />
      </div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-1.5 space-y-1 text-sm text-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** Real-English phrase card: meaning, usage, register alternatives. */
export function PhraseCard({ phrase }: { phrase: RealEnglishPhrase }) {
  const { speak } = useSpeech();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <AudioButton
          label="Hear the phrase"
          size="sm"
          onClick={() => speak(phrase.phrase, { accent: phrase.regions[0] ?? "usa" })}
        />
        <h3 className="text-lg font-semibold">“{phrase.phrase}”</h3>
        <RegisterBadge register={phrase.register} />
      </div>

      <p className="text-muted">{phrase.meaning}</p>

      <div className="rounded-xl border border-purple/25 bg-brand-soft/40 p-4 text-sm">
        <p className="text-[11px] font-medium tracking-[0.09em] text-dim uppercase">Natural example</p>
        <button
          className="-mx-2 mt-0.5 rounded-lg px-2 py-1.5 text-left text-[15px] transition-colors hover:bg-surface-2/60 hover:text-on-brand"
          onClick={() => speak(phrase.naturalExample, { accent: phrase.regions[0] ?? "usa" })}
        >
          “{phrase.naturalExample}”
        </button>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        {[
          ["When to use it", phrase.whenToUse],
          ["Why it sounds native", phrase.note],
          ["More formal", `“${phrase.formalAlternative}”`],
          ["More informal", `“${phrase.informalAlternative}”`],
        ].map(([label, body]) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-surface-2/50 p-3.5 transition-colors hover:border-border-strong"
          >
            <p className="text-[11px] font-medium tracking-[0.09em] text-dim uppercase">{label}</p>
            <p className="mt-1.5 text-muted">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
