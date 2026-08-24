"use client";

import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { ListeningExerciseCard } from "@/components/practice/listening-exercise";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { TabBar } from "@/components/ui/tabs";
import { LISTENING } from "@/content";
import { speedForChallenge, tierForChallenge } from "@/lib/learning/difficulty";
import { formatMinutes } from "@/lib/utils";
import { LISTENING_TIERS, type ListeningTier } from "@/types";

const TIER_COPY: Record<ListeningTier, string> = {
  easy: "Slow, clear speech. Short sentences, no idioms.",
  normal: "Everyday speed with contractions and common expressions.",
  challenging: "Fast, idiomatic speech with fewer repetitions.",
  native: "Unmodified native speed — slang, reductions, overlapping ideas.",
};

/** Standalone listening lab. The tier ladder mirrors the daily session. */
export function ListeningView() {
  const { state, refresh } = useAppState();
  const currentTier = tierForChallenge(state.profile.challengeLevel);
  const [tier, setTier] = useState<ListeningTier>(currentTier);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});

  const exercises = useMemo(() => LISTENING.filter((l) => l.tier === tier), [tier]);
  const active = exercises.find((e) => e.id === activeId) ?? null;
  const tierIndex = LISTENING_TIERS.indexOf(tier);
  const currentIndex = LISTENING_TIERS.indexOf(currentTier);

  async function onComplete(id: string, score: number) {
    setScores((prev) => ({ ...prev, [id]: score }));
    await refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Listening</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Listen, answer, then read the transcript. Difficulty is a ladder — once a tier stops
          challenging you, move up. Staying comfortable is the one thing that doesn&apos;t work.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Where you are"
          subtitle={`Your daily sessions currently use the "${currentTier}" tier.`}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <ProgressBar
              label="Listening skill"
              value={state.progress.skills.listening}
              showValue
              tone={state.progress.skills.listening >= 75 ? "success" : "brand"}
            />
            <p className="mt-2 text-sm text-muted">
              {formatMinutes(state.progress.listeningMinutes)} of listening logged.
            </p>
          </div>
          <div className="rounded-xl bg-surface-2 p-3.5 text-sm text-muted">
            Score 80%+ twice in a row and the daily session moves you up a tier automatically.
          </div>
        </div>
      </Card>

      <TabBar
        tabs={LISTENING_TIERS.map((id) => ({
          id,
          label: id === "native" ? "Native speed" : id[0]!.toUpperCase() + id.slice(1),
          count: LISTENING.filter((l) => l.tier === id).length,
        }))}
        value={tier}
        onChange={(next) => {
          setTier(next);
          setActiveId(null);
        }}
      />
      <p className="text-sm text-muted">{TIER_COPY[tier]}</p>

      {tierIndex > currentIndex + 1 ? (
        <div className="flex items-start gap-3 rounded-xl bg-accent-soft p-4 text-sm">
          <Lock className="mt-0.5 size-4 shrink-0 text-on-accent" />
          <p>
            This is well above your current tier. You can absolutely try it — expect to catch fragments,
            and treat that as normal rather than as failure.
          </p>
        </div>
      ) : null}

      {active ? (
        <Card>
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => setActiveId(null)}>
            ← All {tier} exercises
          </Button>
          <ListeningExerciseCard
            exercise={active}
            speed={speedForChallenge(state.profile.challengeLevel)}
            onComplete={({ score }) => onComplete(active.id, score)}
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {exercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => setActiveId(exercise.id)}
              className="card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{exercise.title}</h3>
                {scores[exercise.id] !== undefined ? (
                  <Badge tone={scores[exercise.id]! >= 80 ? "success" : "accent"}>
                    {scores[exercise.id]}%
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted">
                ~{exercise.seconds}s · {exercise.questions.length} questions · {exercise.accent.toUpperCase()}
              </p>
              <p className="mt-3 text-sm text-muted">
                {exercise.hardExpressions
                  .slice(0, 2)
                  .map((e) => `“${e.phrase}”`)
                  .join(" · ")}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
