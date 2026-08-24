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
  const { speak } = useSpeech();
  const [chosen, setChosen] = useState<string | null>(null);
  const answered = chosen !== null;
  const correct = chosen === word.definition;

  function choose(option: string) {
    if (answered) return;
    setChosen(option);
    onAnswer?.(option === word.definition);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-semibold">{word.term}</h3>
        <button
          type="button"
          onClick={() => speak(word.term)}
          aria-label={`Hear ${word.term}`}
          className="grid size-8 place-items-center rounded-lg bg-surface-2 text-muted hover:text-brand"
        >
          <Volume2 className="size-4" />
        </button>
        <RegisterBadge register={word.register} />
        <span className="font-mono text-sm text-muted">{word.phonetic}</span>
      </div>

      <p className="text-sm text-muted">What does it mean?</p>
      <div className="grid gap-2">
        {options.map((option) => {
          const isAnswer = option === word.definition;
          const selected = chosen === option;
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => choose(option)}
              className={cn(
                "flex items-start justify-between gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-all disabled:cursor-default",
                answered && isAnswer
                  ? "border-success bg-success-soft"
                  : answered && selected
                    ? "border-danger bg-danger-soft"
                    : "border-border hover:bg-surface-2",
              )}
            >
              <span>{option}</span>
              {answered && isAnswer ? <Check className="size-4 shrink-0 text-success" /> : null}
              {answered && selected && !isAnswer ? <X className="size-4 shrink-0 text-danger" /> : null}
            </button>
          );
        })}
      </div>

      {answered ? (
        <div className="animate-in-up space-y-3 rounded-2xl bg-surface-2 p-4 text-sm">
          <p className={cn("font-medium", correct ? "text-success" : "text-accent")}>
            {correct ? "Right — and here's the context." : "Not quite. Here's how it's really used."}
          </p>
          <p>
            <span className="font-medium">Example: </span>
            <span className="text-muted">{word.example}</span>
          </p>
          <p>
            <span className="font-medium">In real life: </span>
            <span className="text-muted">{word.realLifeExample}</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {word.collocations.map((c) => (
              <span key={c} className="rounded-lg bg-surface px-2 py-1 text-xs text-muted">
                {c}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Full detail view of a vocabulary word. */
export function VocabDetail({ word }: { word: VocabularyWord }) {
  const { speak } = useSpeech();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{word.term}</h3>
        <button
          type="button"
          onClick={() => speak(word.term)}
          aria-label={`Hear ${word.term}`}
          className="grid size-8 place-items-center rounded-lg bg-surface-2 text-muted hover:text-brand"
        >
          <Volume2 className="size-4" />
        </button>
        <span className="font-mono text-sm text-muted">{word.phonetic}</span>
        <RegisterBadge register={word.register} />
        <Badge tone="neutral">{word.partOfSpeech}</Badge>
      </div>

      <p>{word.definition}</p>

      <div className="space-y-2 rounded-xl bg-surface-2 p-4 text-sm">
        <p>
          <span className="font-medium">Example: </span>
          <button className="text-left text-muted hover:text-brand" onClick={() => speak(word.example)}>
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
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">“{phrase.phrase}”</h3>
        <button
          type="button"
          onClick={() => speak(phrase.phrase, { accent: phrase.regions[0] ?? "usa" })}
          aria-label="Hear the phrase"
          className="grid size-8 place-items-center rounded-lg bg-surface-2 text-muted hover:text-brand"
        >
          <Volume2 className="size-4" />
        </button>
        <RegisterBadge register={phrase.register} />
      </div>

      <p className="text-muted">{phrase.meaning}</p>

      <div className="rounded-xl bg-surface-2 p-4 text-sm">
        <p className="font-medium">Natural example</p>
        <button
          className="mt-1 text-left text-muted hover:text-brand"
          onClick={() => speak(phrase.naturalExample, { accent: phrase.regions[0] ?? "usa" })}
        >
          “{phrase.naturalExample}”
        </button>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-border p-3.5">
          <p className="font-medium">When to use it</p>
          <p className="mt-1 text-muted">{phrase.whenToUse}</p>
        </div>
        <div className="rounded-xl border border-border p-3.5">
          <p className="font-medium">Why it sounds native</p>
          <p className="mt-1 text-muted">{phrase.note}</p>
        </div>
        <div className="rounded-xl border border-border p-3.5">
          <p className="font-medium">More formal</p>
          <p className="mt-1 text-muted">“{phrase.formalAlternative}”</p>
        </div>
        <div className="rounded-xl border border-border p-3.5">
          <p className="font-medium">More informal</p>
          <p className="mt-1 text-muted">“{phrase.informalAlternative}”</p>
        </div>
      </div>
    </div>
  );
}
