"use client";

import { useState } from "react";
import { Clock, Play, Target } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDuration, useI18n } from "@/i18n/provider";
import { missionIndexFor } from "@/lib/learning/hydrate";


import type { DailySession } from "@/types";
import { SessionRunner } from "./session-runner";

/** Plan overview → runner. The overview exists so the learner knows the shape
 *  of the next 20 minutes before committing to them. */
export function LearnView({ session }: { session: DailySession }) {
  const { state } = useAppState();
  const { t, fmt } = useI18n();
  const duration = useDuration();
  const [started, setStarted] = useState(false);
  const goal = t.content.goals[session.goal];
  const alreadyDone = session.status === "completed";

  if (started) return <SessionRunner session={session} />;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-on-brand">{t.learn.todayPlan}</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
          {t.content.missions[session.goal][missionIndexFor(session)] ?? session.mission}
        </h1>
        <p className="mt-2 text-muted">
          {fmt(t.learn.builtFrom, {
            goal: goal.label,
            minutes: duration(state.profile.dailyMinutes),
          })}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge tone="brand">
          <Target className="size-3.5" />
          {goal.label}
        </Badge>
        <Badge tone="neutral">
          <Clock className="size-3.5" />
          {duration(session.totalMinutes)}
        </Badge>
        <Badge tone="accent">
          {t.dashboard.challengeLevel} {session.challengeLevel} —{" "}
          {t.content.challenge[session.challengeLevel].label}
        </Badge>
        {alreadyDone ? <Badge tone="success">{t.learn.completedToday}</Badge> : null}
      </div>

      <Card>
        <ol className="space-y-3">
          {session.blocks.map((block, index) => (
            <li key={block.id} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-sm font-medium text-on-brand">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">{t.content.blocks[block.kind].title}</p>
                  <p className="text-sm text-muted">{duration(block.minutes)}</p>
                </div>
                <p className="mt-0.5 text-sm text-muted">{t.content.blocks[block.kind].description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button size="xl" onClick={() => setStarted(true)}>
          <Play className="size-5" />
          {alreadyDone ? t.learn.runAgain : t.learn.startPractice}
        </Button>
        <p className="text-sm text-muted">
          {alreadyDone ? t.learn.alreadyDone : t.learn.stopAnytime}
        </p>
      </div>
    </div>
  );
}
