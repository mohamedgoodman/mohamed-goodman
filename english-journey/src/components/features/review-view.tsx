"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, Volume2 } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { AnimatedNumber } from "@/components/visual/animated-number";
import { TabBar } from "@/components/ui/tabs";
import { GRAMMAR_BY_ID, LISTENING_BY_ID, PRONUNCIATION_BY_ID, VOCABULARY_BY_ID } from "@/content";
import { useSpeech } from "@/lib/speech";
import { EmptyStateIllustration } from "@/components/visual/illustrations";
import { useI18n, useT } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import type { ReviewItem, ReviewItemKind, VocabularyProgress } from "@/types";

type Tab = "due" | "forgot" | "learning" | "mastered" | ReviewItemKind;

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
  const { t, fmt } = useI18n();
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
        <h1 className="text-2xl font-semibold sm:text-3xl">{t.review.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t.review.subtitle}</p>
      </div>

      <Card elevated glow className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.09em] text-dim uppercase">
            {t.review.dueNow}
          </p>
          <p className="mt-1 text-3xl font-semibold">
            <AnimatedNumber value={due.length} />
          </p>
        </div>
        <Button size="lg" disabled={due.length === 0} onClick={() => setSession(due.slice(0, 12))}>
          <RotateCcw className="size-4" />
          {due.length ? fmt(t.review.reviewItems, { count: Math.min(due.length, 12) }) : t.review.nothingDue}
        </Button>
      </Card>

      {/* Priority strip: what you struggle with most, ordered by weight. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(
          [
            ["vocabulary", t.review.wordsToReview, forgot.length + countKind(open, "vocabulary")],
            ["pronunciation", t.review.kinds.pronunciation, countKind(open, "pronunciation")],
            ["listening", t.review.kinds.listening, countKind(open, "listening")],
            ["grammar", t.review.kinds.grammar, countKind(open, "grammar")],
          ] as [ReviewItemKind, string, number][]
        )
          .sort((a, b) => b[2] - a[2])
          .map(([kind, label, count]) => (
            <button
              key={kind}
              onClick={() => setTab(kind === "vocabulary" ? "forgot" : kind)}
              className={cn(
                "card lift p-4 text-start",
                count > 0 && "border-purple/30",
              )}
            >
              <p className="text-[11px] font-semibold tracking-[0.09em] text-dim uppercase">
                {label}
              </p>
              <p
                className={cn(
                  "mt-2 text-2xl font-semibold",
                  count > 0 ? "text-on-brand" : "text-dim",
                )}
              >
                <AnimatedNumber value={count} />
              </p>
              <ProgressBar
                className="mt-2.5"
                size="sm"
                value={count === 0 ? 0 : Math.min(count * 12, 100)}
                tone={count >= 5 ? "danger" : count > 0 ? "accent" : "brand"}
              />
            </button>
          ))}
      </div>

      <TabBar
        tabs={[
          { id: "due" as Tab, label: t.review.tabs.due, count: due.length },
          { id: "forgot" as Tab, label: t.review.tabs.forgot, count: forgot.length },
          { id: "learning" as Tab, label: t.review.tabs.learning, count: learning.length },
          { id: "mastered" as Tab, label: t.review.tabs.mastered, count: mastered.length },
          { id: "pronunciation" as Tab, label: t.review.kinds.pronunciation, count: countKind(open, "pronunciation") },
          { id: "grammar" as Tab, label: t.review.kinds.grammar, count: countKind(open, "grammar") },
          { id: "listening" as Tab, label: t.review.kinds.listening, count: countKind(open, "listening") },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "forgot" || tab === "learning" || tab === "mastered" ? (
        <WordList
          progress={tab === "forgot" ? forgot : tab === "learning" ? learning : mastered}
          emptyMessage={
            tab === "mastered"
              ? t.review.emptyMastered
              : tab === "forgot"
                ? t.review.emptyForgot
                : t.review.emptyLearning
          }
        />
      ) : (
        <ItemList
          items={tab === "due" ? due : open.filter((i) => i.kind === tab)}
          emptyMessage={
            tab === "due"
              ? t.review.emptyDue
              : fmt(t.review.emptyKind, { kind: t.review.kinds[tab as ReviewItemKind] })
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
  const { t, fmt } = useI18n();
  if (!items.length) {
    return (
      <Card className="flex flex-col items-center gap-4 py-10 text-center">
        <EmptyStateIllustration className="w-40" />
        <p className="max-w-sm text-muted">{emptyMessage}</p>
      </Card>
    );
  }
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <Card key={item.id} interactive className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => speak(item.label)}
                className="flex items-center gap-1.5 font-medium hover:text-on-brand"
              >
                <Volume2 className="size-3.5" />
                {item.label}
              </button>
              <Badge tone="neutral">{t.review.kinds[item.kind]}</Badge>
              {item.misses >= 3 ? (
                <Badge tone="danger">{fmt(t.review.missedTimes, { count: item.misses })}</Badge>
              ) : null}
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
  const { t, fmt, locale } = useI18n();
  if (!progress.length) {
    return (
      <Card className="flex flex-col items-center gap-4 py-10 text-center">
        <EmptyStateIllustration className="w-40" />
        <p className="max-w-sm text-muted">{emptyMessage}</p>
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
          <Card key={entry.wordId} interactive tilt>
            <div className="flex items-start justify-between gap-3">
              <button onClick={() => speak(word.term)} className="text-start font-medium hover:text-on-brand">
                {word.term}
              </button>
              <Badge
                tone={entry.stage === "mastered" ? "success" : entry.stage === "forgotten" ? "danger" : "brand"}
              >
                {accuracy}%
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted">{locale === "ar" ? word.darija : word.definition}</p>
            <p className="mt-2 text-xs text-muted">
              {fmt(t.review.nextReview, { date: entry.dueAt })} ·{" "}
              {fmt(t.review.rightWrong, { right: entry.correct, wrong: entry.incorrect })}
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
  const { t, fmt } = useI18n();
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
        <p>{t.review.queueFinished}</p>
        <Button className="mt-4" onClick={onDone}>
          {t.review.backToReview}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t.review.reviewSession}</h1>
        <span className="text-sm text-muted tabular-nums">
          {index + 1} / {items.length}
        </span>
      </div>

      <Card>
        <CardHeader
          title={t.review.kinds[item.kind]}
          subtitle={fmt(t.review.missedSoFar, { count: item.misses })}
        />
        <div className="py-6 text-center">
          <p className="text-2xl font-semibold">{item.label}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => speak(item.label)}>
            <Volume2 className="size-4" />
            {t.common.listen}
          </Button>
          {revealed ? (
            <div className="animate-in-up mt-6 space-y-3 text-start">
              <p className="rounded-xl bg-surface-2/60 p-4 text-sm">{item.detail}</p>
              <Context refId={item.refId} kind={item.kind} />
            </div>
          ) : (
            <div className="mt-6">
              <Button onClick={() => setRevealed(true)}>{t.vocabulary.reveal}</Button>
            </div>
          )}
        </div>
      </Card>

      {revealed ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="danger" onClick={() => answer(false)} loading={saving}>
            <RotateCcw className="size-4" />
            {t.review.stillHard}
          </Button>
          <Button variant="success" onClick={() => answer(true)} loading={saving}>
            <CheckCircle2 className="size-4" />
            {t.review.gotIt}
          </Button>
        </div>
      ) : null}

      <Button variant="ghost" onClick={onDone}>
        {t.vocabulary.endSession}
      </Button>
    </div>
  );
}

/** Extra context for the card, pulled from the content library. */
function Context({ refId, kind }: { refId: string; kind: ReviewItemKind }) {
  const t = useT();
  const word = VOCABULARY_BY_ID.get(refId);
  if (word) {
    return (
      <div className={cn("rounded-xl border border-border p-4 text-sm")}>
        <p>
          <span className="font-medium">{t.common.example}: </span>
          <span className="text-muted">{word.example}</span>
        </p>
        <p className="mt-1.5">
          <span className="font-medium">{t.common.realLife}: </span>
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
            <span className="font-medium text-on-success">{t.exercise.grammarNatural}: </span>
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
