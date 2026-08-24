"use client";

import { useState } from "react";
import { Clock, Play, Target } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GOALS } from "@/content/goals";
import { CHALLENGE_META } from "@/lib/learning/levels";
import { formatMinutes } from "@/lib/utils";
import type { DailySession } from "@/types";
import { SessionRunner } from "./session-runner";

/** Plan overview → runner. The overview exists so the learner knows the shape
 *  of the next 20 minutes before committing to them. */
export function LearnView({ session }: { session: DailySession }) {
  const { state } = useAppState();
  const [started, setStarted] = useState(false);
  const goal = GOALS[session.goal];
  const alreadyDone = session.status === "completed";

  if (started) return <SessionRunner session={session} />;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-on-brand">Today&apos;s plan</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{session.mission}</h1>
        <p className="mt-2 text-muted">
          Built from your goal ({goal.label.toLowerCase()}), your level and the {formatMinutes(state.profile.dailyMinutes)} you
          said you have.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge tone="brand">
          <Target className="size-3.5" />
          {goal.label}
        </Badge>
        <Badge tone="neutral">
          <Clock className="size-3.5" />
          {formatMinutes(session.totalMinutes)}
        </Badge>
        <Badge tone="accent">
          Challenge {session.challengeLevel} — {CHALLENGE_META[session.challengeLevel].label}
        </Badge>
        {alreadyDone ? <Badge tone="success">Completed today</Badge> : null}
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
                  <p className="font-medium">{block.title}</p>
                  <p className="text-sm text-muted">{formatMinutes(block.minutes)}</p>
                </div>
                <p className="mt-0.5 text-sm text-muted">{block.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button size="xl" onClick={() => setStarted(true)}>
          <Play className="size-5" />
          {alreadyDone ? "Run the session again" : "Start today's practice"}
        </Button>
        <p className="text-sm text-muted">
          {alreadyDone
            ? "You already completed today — a second run still counts towards XP and review."
            : "You can stop at any block; only completed answers are scored."}
        </p>
      </div>
    </div>
  );
}
