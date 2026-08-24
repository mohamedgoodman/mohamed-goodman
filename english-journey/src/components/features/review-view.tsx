"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, Volume2 } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { TabBar } from "@/components/ui/tabs";
import { GRAMMAR_BY_ID, LISTENING_BY_ID, PRONUNCIATION_BY_ID, VOCABULARY_BY_ID } from "@/content";
import { useSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { ReviewItem, ReviewItemKind, VocabularyProgress } from "@/types";

type Tab = "due" | "forgot" | "learning" | "mastered" | ReviewItemKind;

const KIND_LABEL: Record<ReviewItemKind, string> = {
  vocabulary: "Vocabulary",
  pronunciation: "Pronunciation",
  grammar: "Grammar",
  listening: "Listening",
  expression: "Expressions",
};

/**
 * The Review Centre. Every item here came from a mistake the learner actually
 * made — nothing is seeded, and sessions are generated from the queue.
 */
export interface ReviewData {
  items: ReviewItem[];
  vocabulary: VocabularyProgress[];
  today: string;
}

export function ReviewView({ initialData }: { initialData: ReviewData }) {
  const { refresh } = useAppState();
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<Tab>("due");
  const [session, setSession] = useState<ReviewItem[] | null>(null);
  const { items, vocabulary, today } = data;

  // Only ever called from an event handler, after the queue has changed.
  const load = useCallback(async () => {
    const response = await fetch("/api/review", { cache: "no-store" });
    if (response.ok) setData((await response.json()) as ReviewData);
  }, []);

  const open = useMemo(() => items.filter((i) => !i.resolved), [items]);
  const due = useMemo(() => open.filter((i) => i.dueAt <= today), [open, today]);
  const forgot = useMemo(
    () => vocabulary.filter((v) => v.stage === "forgotten"),
    [vocabulary],
  );
  const learning = useMemo(
    () => vocabulary.filter((v) => v.stage === "learning" || v.stage === "familiar"),
    [vocabulary],
  );
  const mastered = useMemo(() => vocabulary.filter((v) => v.stage === "mastered"), [vocabulary]);

  if (session) {
    return (
      <ReviewSession
        items={session}
        onDone={async () => {
          setSession(null);
          await load();
          await refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Review centre</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Everything you got wrong, organised and scheduled. Sessions are generated from your own
          mistakes — the ones you repeat come back fastest.
        </p>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Due right now</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{due.length}</p>
        </div>
        <Button size="lg" disabled={due.length === 0} onClick={() => setSession(due.slice(0, 12))}>
          <RotateCcw className="size-4" />
          {due.length ? `Review ${Math.min(due.length, 12)} items` : "Nothing due"}
        </Button>
      </Card>

      <TabBar
        tabs={[
          { id: "due" as Tab, label: "Due now", count: due.length },
          { id: "forgot" as Tab, label: "Words I forgot", count: forgot.length },
          { id: "learning" as Tab, label: "Words I'm learning", count: learning.length },
          { id: "mastered" as Tab, label: "Words I mastered", count: mastered.length },
          { id: "pronunciation" as Tab, label: "Pronunciation", count: countKind(open, "pronunciation") },
          { id: "grammar" as Tab, label: "Grammar", count: countKind(open, "grammar") },
          { id: "listening" as Tab, label: "Listening", count: countKind(open, "listening") },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "forgot" || tab === "learning" || tab === "mastered" ? (
        <WordList
          progress={tab === "forgot" ? forgot : tab === "learning" ? learning : mastered}
          emptyMessage={
            tab === "mastered"
              ? "No mastered words yet. A word is mastered after five correct reviews spread over three weeks."
              : tab === "forgot"
                ? "Nothing forgotten — that's the goal."
                : "No words in progress yet. Complete a session to start the queue."
          }
        />
      ) : (
        <ItemList
          items={tab === "due" ? due : open.filter((i) => i.kind === tab)}
          emptyMessage={
            tab === "due"
              ? "Nothing due right now. Come back after your next session."
              : `No ${KIND_LABEL[tab as ReviewItemKind].toLowerCase()} mistakes recorded. `
          }
        />
      )}
    </div>
  );
}

function countKind(items: ReviewItem[], kind: ReviewItemKind): number {
  return items.filter((i) => i.kind === kind).length;
}

function ItemList({ items, emptyMessage }: { items: ReviewItem[]; emptyMessage: string }) {
  const { speak } = useSpeech();
  if (!items.length) {
    return (
      <Card>
        <p className="text-muted">{emptyMessage}</p>
      </Card>
    );
  }
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <Card key={item.id} className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => speak(item.label)}
                className="flex items-center gap-1.5 font-medium hover:text-brand"
              >
                <Volume2 className="size-3.5" />
                {item.label}
              </button>
              <Badge tone="neutral">{KIND_LABEL[item.kind]}</Badge>
              {item.misses >= 3 ? <Badge tone="danger">Missed {item.misses}×</Badge> : null}
            </div>
            <p className="mt-1.5 text-sm text-muted">{item.detail}</p>
          </div>
          <span className="shrink-0 text-xs text-muted">due {item.dueAt}</span>
        </Card>
      ))}
    </div>
  );
}

function WordList({
  progress,
  emptyMessage,
}: {
  progress: VocabularyProgress[];
  emptyMessage: string;
}) {
  const { speak } = useSpeech();
  if (!progress.length) {
    return (
      <Card>
        <p className="text-muted">{emptyMessage}</p>
      </Card>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {progress.map((entry) => {
        const word = VOCABULARY_BY_ID.get(entry.wordId);
        if (!word) return null;
        const accuracy = entry.correct + entry.incorrect
          ? Math.round((entry.correct / (entry.correct + entry.incorrect)) * 100)
          : 0;
        return (
          <Card key={entry.wordId}>
            <div className="flex items-start justify-between gap-3">
              <button onClick={() => speak(word.term)} className="text-left font-medium hover:text-brand">
                {word.term}
              </button>
              <Badge
                tone={entry.stage === "mastered" ? "success" : entry.stage === "forgotten" ? "danger" : "brand"}
              >
                {accuracy}%
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted">{word.definition}</p>
            <p className="mt-2 text-xs text-muted">
              Next review {entry.dueAt} · {entry.correct} right / {entry.incorrect} wrong
            </p>
          </Card>
        );
      })}
    </div>
  );
}

/** Flash-card style pass over the due queue. */
function ReviewSession({ items, onDone }: { items: ReviewItem[]; onDone: () => void }) {
  const { speak } = useSpeech();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const item = items[index];

  async function answer(correct: boolean) {
    if (!item) return;
    setSaving(true);
    try {
      await fetch("/api/review/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemId: item.id, correct }),
      });
      if (index + 1 >= items.length) {
        onDone();
        return;
      }
      setIndex((i) => i + 1);
      setRevealed(false);
    } finally {
      setSaving(false);
    }
  }

  if (!item) {
    return (
      <Card>
        <p>Queue finished.</p>
        <Button className="mt-4" onClick={onDone}>
          Back to review centre
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Review session</h1>
        <span className="text-sm text-muted tabular-nums">
          {index + 1} / {items.length}
        </span>
      </div>

      <Card>
        <CardHeader title={KIND_LABEL[item.kind]} subtitle={`Missed ${item.misses}× so far`} />
        <div className="py-6 text-center">
          <p className="text-2xl font-semibold">{item.label}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => speak(item.label)}>
            <Volume2 className="size-4" />
            Listen
          </Button>
          {revealed ? (
            <div className="animate-in-up mt-6 space-y-3 text-left">
              <p className="rounded-xl bg-surface-2 p-4 text-sm">{item.detail}</p>
              <Context refId={item.refId} kind={item.kind} />
            </div>
          ) : (
            <div className="mt-6">
              <Button onClick={() => setRevealed(true)}>Reveal</Button>
            </div>
          )}
        </div>
      </Card>

      {revealed ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="danger" onClick={() => answer(false)} loading={saving}>
            <RotateCcw className="size-4" />
            Still hard
          </Button>
          <Button variant="success" onClick={() => answer(true)} loading={saving}>
            <CheckCircle2 className="size-4" />
            Got it
          </Button>
        </div>
      ) : null}

      <Button variant="ghost" onClick={onDone}>
        End session
      </Button>
    </div>
  );
}

/** Extra context for the card, pulled from the content library. */
function Context({ refId, kind }: { refId: string; kind: ReviewItemKind }) {
  const word = VOCABULARY_BY_ID.get(refId);
  if (word) {
    return (
      <div className={cn("rounded-xl border border-border p-4 text-sm")}>
        <p>
          <span className="font-medium">Example: </span>
          <span className="text-muted">{word.example}</span>
        </p>
        <p className="mt-1.5">
          <span className="font-medium">In real life: </span>
          <span className="text-muted">{word.realLifeExample}</span>
        </p>
      </div>
    );
  }
  if (kind === "grammar") {
    const point = GRAMMAR_BY_ID.get(refId);
    if (point) {
      return (
        <div className="rounded-xl border border-border p-4 text-sm">
          <p className="text-muted">{point.explanation}</p>
          <p className="mt-2">
            <span className="font-medium text-success">Natural: </span>
            {point.natural}
          </p>
        </div>
      );
    }
  }
  if (kind === "pronunciation") {
    const drill = PRONUNCIATION_BY_ID.get(refId);
    if (drill) {
      return (
        <div className="rounded-xl border border-border p-4 text-sm">
          <p className="font-medium">{drill.target}</p>
          <p className="mt-1 font-mono text-muted">{drill.phonetic}</p>
          <p className="mt-2 text-muted">{drill.tip}</p>
        </div>
      );
    }
  }
  if (kind === "listening") {
    const exercise = LISTENING_BY_ID.get(refId);
    if (exercise) {
      return (
        <div className="rounded-xl border border-border p-4 text-sm">
          <p className="font-medium">{exercise.title}</p>
          <ul className="mt-2 space-y-1 text-muted">
            {exercise.hardExpressions.map((e) => (
              <li key={e.phrase}>
                “{e.phrase}” — {e.meaning}
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }
  return null;
}
