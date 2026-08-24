"use client";

import { useState } from "react";
import { useAppState } from "@/components/app-state-provider";
import { SpeakingExerciseCard } from "@/components/practice/speaking-exercise";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { SPEAKING } from "@/content";
import { LEVEL_META } from "@/lib/learning/levels";

export function SpeakingView() {
  const { state, refresh } = useAppState();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, number>>({});
  const active = SPEAKING.find((s) => s.id === activeId) ?? null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Speaking</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Real situations, not drills. Answer out loud — the feedback covers vocabulary, grammar,
          naturalness and whether your meaning actually landed. Nothing is simply marked wrong.
        </p>
      </div>

      <Card>
        <CardHeader title="Your speaking" subtitle={`${state.progress.speakingSessions} answers given so far.`} />
        <ProgressBar
          label="Speaking skill"
          value={state.progress.skills.speaking}
          showValue
          tone={state.progress.skills.speaking >= 75 ? "success" : "brand"}
        />
      </Card>

      {active ? (
        <Card>
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => setActiveId(null)}>
            ← All situations
          </Button>
          <SpeakingExerciseCard
            scenario={active}
            onComplete={async ({ score }) => {
              setDone((prev) => ({ ...prev, [active.id]: score }));
              await refresh();
            }}
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {SPEAKING.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setActiveId(scenario.id)}
              className="card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{scenario.situation}</h3>
                {done[scenario.id] !== undefined ? (
                  <Badge tone={done[scenario.id]! >= 70 ? "success" : "accent"}>{done[scenario.id]}%</Badge>
                ) : (
                  <Badge tone="neutral">{LEVEL_META[scenario.level].cefr}</Badge>
                )}
              </div>
              <p className="mt-1.5 text-sm text-muted">{scenario.context}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
