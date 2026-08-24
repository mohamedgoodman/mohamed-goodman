"use client";

import { useCallback, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { VocabDetail } from "@/components/practice/vocab-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { TabBar } from "@/components/ui/tabs";
import { todayISO } from "@/lib/learning/dates";
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
        <h1 className="text-2xl font-semibold sm:text-3xl">Vocabulary</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Words in context, with collocations, similar and opposite terms, and a real-life example.
          Spaced repetition decides what comes back and when — what you keep missing returns soonest.
        </p>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Due for review today</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{due.length}</p>
        </div>
        <Button size="lg" onClick={() => setStudying(true)} disabled={due.length === 0}>
          <Sparkles className="size-4" />
          {due.length ? `Study ${Math.min(due.length, 10)} words` : "Nothing due"}
        </Button>
      </Card>

      <div className="space-y-3">
        <TabBar
          tabs={[
            { id: "due" as Tab, label: "Due", count: due.length },
            {
              id: "learning" as Tab,
              label: "Learning",
              count: progress.filter((p) => p.stage !== "mastered" && p.stage !== "new").length,
            },
            {
              id: "mastered" as Tab,
              label: "Mastered",
              count: progress.filter((p) => p.stage === "mastered").length,
            },
            { id: "all" as Tab, label: "All", count: words.length },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search words, meanings, topics…"
            className="pl-10"
            aria-label="Search vocabulary"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <p className="text-muted">Nothing here yet. Complete a session and words will start collecting.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((word) => {
            const p = progressByWord.get(word.id);
            const open = openId === word.id;
            return (
              <Card key={word.id} className={cn("min-w-0 transition-all", open ? "ring-1 ring-brand/30" : "")}>
                <button
                  className="flex w-full items-start justify-between gap-3 text-left"
                  onClick={() => setOpenId(open ? null : word.id)}
                  aria-expanded={open}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{word.term}</span>
                    <span className="mt-0.5 block truncate text-sm text-muted">{word.definition}</span>
                  </span>
                  <Badge tone={STAGE_TONE[p?.stage ?? "new"]}>{p?.stage ?? "new"}</Badge>
                </button>
                {open ? (
                  <div className="mt-4 border-t border-border pt-4">
                    <VocabDetail word={word} />
                    {p ? (
                      <p className="mt-3 text-xs text-muted">
                        Seen {p.correct + p.incorrect} times · next review {p.dueAt} · ease{" "}
                        {p.ease.toFixed(2)}
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
        <p>Nothing left to study right now.</p>
        <Button className="mt-4" onClick={onDone}>
          Back to vocabulary
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Study session</h1>
        <span className="text-sm text-muted tabular-nums">
          {index + 1} / {words.length}
        </span>
      </div>

      <Card>
        {revealed ? (
          <VocabDetail word={word} />
        ) : (
          <div className="py-10 text-center">
            <p className="text-2xl font-semibold">{word.term}</p>
            <p className="mt-2 font-mono text-sm text-muted">{word.phonetic}</p>
            <p className="mt-6 text-sm text-muted">Say the meaning out loud, then reveal.</p>
            <Button className="mt-4" onClick={() => setRevealed(true)}>
              Reveal
            </Button>
          </div>
        )}
      </Card>

      {revealed ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button variant="danger" onClick={() => answer(0)} loading={saving}>
            Forgot
          </Button>
          <Button variant="outline" onClick={() => answer(1)} loading={saving}>
            Hard
          </Button>
          <Button variant="secondary" onClick={() => answer(2)} loading={saving}>
            Good
          </Button>
          <Button variant="success" onClick={() => answer(3)} loading={saving}>
            Easy
          </Button>
        </div>
      ) : null}

      <Button variant="ghost" onClick={onDone}>
        End session
      </Button>
    </div>
  );
}
