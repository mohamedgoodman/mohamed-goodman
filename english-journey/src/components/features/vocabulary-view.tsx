"use client";

import { useCallback, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { VocabDetail } from "@/components/practice/vocab-card";
import { EmptyStateIllustration } from "@/components/visual/illustrations";
import { Badge } from "@/components/ui/badge";
import { AnimatedNumber } from "@/components/visual/animated-number";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { TabBar } from "@/components/ui/tabs";
import { todayISO } from "@/lib/learning/dates";
import { useI18n, useT } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import type { MasteryStage, VocabularyProgress, VocabularyWord } from "@/types";

type Tab = "due" | "learning" | "mastered" | "all";

const STAGE_TONE: Record<MasteryStage, "neutral" | "brand" | "success" | "danger" | "accent"> = {
  new: "neutral",
  learning: "brand",
  familiar: "accent",
  mastered: "success",
  forgotten: "danger",
};

export interface VocabularyData {
  words: VocabularyWord[];
  progress: VocabularyProgress[];
}

export function VocabularyView({ initialData }: { initialData: VocabularyData }) {
  const { t, fmt, locale } = useI18n();
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<Tab>("due");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [studying, setStudying] = useState(false);
  const { words, progress } = data;

  // Refetched after a study session, never on mount — the server already sent
  // the first payload.
  const load = useCallback(async () => {
    const response = await fetch("/api/vocabulary", { cache: "no-store" });
    if (response.ok) setData((await response.json()) as VocabularyData);
  }, []);

  const progressByWord = useMemo(
    () => new Map(progress.map((p) => [p.wordId, p])),
    [progress],
  );

  const today = todayISO();
  const due = useMemo(
    () =>
      words.filter((word) => {
        const p = progressByWord.get(word.id);
        return !p || p.dueAt <= today;
      }),
    [words, progressByWord, today],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const base =
      tab === "due"
        ? due
        : tab === "learning"
          ? words.filter((w) => {
              const stage = progressByWord.get(w.id)?.stage;
              return stage === "learning" || stage === "familiar" || stage === "forgotten";
            })
          : tab === "mastered"
            ? words.filter((w) => progressByWord.get(w.id)?.stage === "mastered")
            : words;
    if (!needle) return base;
    return base.filter(
      (w) =>
        w.term.toLowerCase().includes(needle) ||
        w.definition.toLowerCase().includes(needle) ||
        w.topics.some((t) => t.includes(needle)),
    );
  }, [tab, due, words, progressByWord, query]);

  if (studying) {
    return (
      <StudySession
        words={due.slice(0, 10)}
        onDone={async () => {
          setStudying(false);
          await load();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{t.vocabulary.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t.vocabulary.subtitle}</p>
      </div>

      <Card elevated glow className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.09em] text-dim uppercase">
            {t.vocabulary.dueToday}
          </p>
          <p className="mt-1 text-3xl font-semibold">
            <AnimatedNumber value={due.length} />
          </p>
        </div>
        <Button size="lg" onClick={() => setStudying(true)} disabled={due.length === 0}>
          <Sparkles className="size-4" />
          {due.length ? fmt(t.vocabulary.studyWords, { count: Math.min(due.length, 10) }) : t.vocabulary.nothingDue}
        </Button>
      </Card>

      <div className="space-y-3">
        <TabBar
          tabs={[
            { id: "due" as Tab, label: t.vocabulary.tabs.due, count: due.length },
            {
              id: "learning" as Tab,
              label: t.vocabulary.tabs.learning,
              count: progress.filter((p) => p.stage !== "mastered" && p.stage !== "new").length,
            },
            {
              id: "mastered" as Tab,
              label: t.vocabulary.tabs.mastered,
              count: progress.filter((p) => p.stage === "mastered").length,
            },
            { id: "all" as Tab, label: t.vocabulary.tabs.all, count: words.length },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.vocabulary.searchPlaceholder}
            className="ps-10"
            aria-label={t.common.search}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 py-10 text-center">
          <EmptyStateIllustration className="w-44" />
          <p className="max-w-sm text-muted">{t.vocabulary.empty}</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((word) => {
            const p = progressByWord.get(word.id);
            const open = openId === word.id;
            return (
              <Card
                key={word.id}
                interactive={!open}
                tilt={!open}
                className={cn("min-w-0", open && "card-elevated ring-1 ring-purple/30")}
              >
                <button
                  className="flex w-full items-start justify-between gap-3 text-start"
                  onClick={() => setOpenId(open ? null : word.id)}
                  aria-expanded={open}
                >
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block font-medium",
                        p?.stage === "forgotten" && "text-on-danger",
                        p?.stage === "mastered" && "text-on-success",
                      )}
                    >
                      <span className="ltr inline-block">{word.term}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-muted">
                      {locale === "ar" ? word.darija : word.definition}
                    </span>
                  </span>
                  <Badge tone={STAGE_TONE[p?.stage ?? "new"]}>
                    {t.vocabulary.stages[p?.stage ?? "new"]}
                  </Badge>
                </button>
                {open ? (
                  <div className="mt-4 border-t border-border pt-4">
                    <VocabDetail word={word} />
                    {p ? (
                      <p className="mt-3 text-xs text-muted">
                        {fmt(t.vocabulary.seenTimes, {
                          count: p.correct + p.incorrect,
                          date: p.dueAt,
                        })}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** A quick spaced-repetition drill over the due queue. */
function StudySession({ words, onDone }: { words: VocabularyWord[]; onDone: () => void }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const word = words[index];

  async function answer(quality: 0 | 1 | 2 | 3) {
    if (!word) return;
    setSaving(true);
    try {
      await fetch("/api/vocabulary/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wordId: word.id, quality }),
      });
      if (index + 1 >= words.length) {
        onDone();
        return;
      }
      setIndex((i) => i + 1);
      setRevealed(false);
    } finally {
      setSaving(false);
    }
  }

  if (!word) {
    return (
      <Card>
        <p>{t.vocabulary.nothingLeft}</p>
        <Button className="mt-4" onClick={onDone}>
          {t.vocabulary.backToVocabulary}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t.vocabulary.studySession}</h1>
        <span className="text-sm text-muted tabular-nums">
          {index + 1} / {words.length}
        </span>
      </div>

      <Card elevated className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.25), rgba(124,58,237,0) 70%)" }}
        />
        {revealed ? (
          <VocabDetail word={word} />
        ) : (
          <div className="relative py-12 text-center">
            <p className="text-3xl font-semibold tracking-tight">{word.term}</p>
            <p className="mt-2 font-mono text-sm text-muted">{word.phonetic}</p>
            <p className="mt-7 text-sm text-dim">{t.vocabulary.sayThenReveal}</p>
            <Button size="lg" className="mt-4" onClick={() => setRevealed(true)}>
              {t.vocabulary.reveal}
            </Button>
          </div>
        )}
      </Card>

      {revealed ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button variant="danger" onClick={() => answer(0)} loading={saving}>
            {t.vocabulary.forgot}
          </Button>
          <Button variant="outline" onClick={() => answer(1)} loading={saving}>
            {t.vocabulary.hard}
          </Button>
          <Button variant="secondary" onClick={() => answer(2)} loading={saving}>
            {t.vocabulary.good}
          </Button>
          <Button variant="success" onClick={() => answer(3)} loading={saving}>
            {t.vocabulary.easy}
          </Button>
        </div>
      ) : null}

      <Button variant="ghost" onClick={onDone}>
        {t.vocabulary.endSession}
      </Button>
    </div>
  );
}
