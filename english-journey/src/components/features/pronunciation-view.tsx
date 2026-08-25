"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Info } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { PronunciationExerciseCard } from "@/components/practice/pronunciation-exercise";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { TabBar } from "@/components/ui/tabs";
import { PRONUNCIATION } from "@/content";
import { useT } from "@/i18n/provider";
import type { PronunciationExercise } from "@/types";

type Kind = PronunciationExercise["kind"] | "all";

export function PronunciationView() {
  const { state, refresh } = useAppState();
  const t = useT();
  const [kind, setKind] = useState<Kind>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const drills = useMemo(
    () => (kind === "all" ? PRONUNCIATION : PRONUNCIATION.filter((d) => d.kind === kind)),
    [kind],
  );
  const active = drills.find((d) => d.id === activeId) ?? null;
  const accent = state.profile.destination ?? "usa";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{t.pronunciation.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t.pronunciation.subtitle}</p>
      </div>

      <Card className="border-brand/30 bg-brand-soft/30">
        <p className="flex items-start gap-2.5 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-on-brand" />
          <span>
            <strong className="font-medium">{t.pronunciation.accentNote}</strong>{" "}
            {t.pronunciation.accentBody}
          </span>
        </p>
      </Card>

      <Card>
        <CardHeader title={t.pronunciation.scoreTitle} subtitle={t.pronunciation.scoreSubtitle} />
        <ProgressBar
          value={state.progress.pronunciationScore}
          showValue
          label={t.pronunciation.clarity}
          tone={state.progress.pronunciationScore >= 75 ? "success" : "brand"}
        />
      </Card>

      <TabBar
        tabs={[
          { id: "all" as Kind, label: t.common.all },
          { id: "sound" as Kind, label: t.pronunciation.kinds.sound },
          { id: "stress" as Kind, label: t.pronunciation.kinds.stress },
          { id: "rhythm" as Kind, label: t.pronunciation.kinds.rhythm },
          { id: "connected-speech" as Kind, label: t.pronunciation.kinds["connected-speech"] },
          { id: "common-mistake" as Kind, label: t.pronunciation.kinds["common-mistake"] },
        ]}
        value={kind}
        onChange={(next) => {
          setKind(next);
          setActiveId(null);
        }}
      />

      {active ? (
        <Card>
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => setActiveId(null)}>
            <ArrowLeft className="size-4 rtl:rotate-180" /> {t.pronunciation.allDrills}
          </Button>
          <PronunciationExerciseCard drill={active} accent={accent} onComplete={() => refresh()} />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {drills.map((drill) => (
            <button
              key={drill.id}
              onClick={() => setActiveId(drill.id)}
              className="card p-5 text-start transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <h3 className="font-semibold">{drill.focus}</h3>
              <p className="mt-1 font-mono text-sm text-muted">{drill.phonetic}</p>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{drill.explanation}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
