"use client";

import { useState } from "react";
import { Check, Play, Volume2 } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { IMMERSION, IMMERSION_LIST } from "@/content";
import { useSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { DestinationId } from "@/types";

export function ImmersionView() {
  const { state, refresh } = useAppState();
  const [destination, setDestination] = useState<DestinationId>(state.profile.destination ?? "usa");
  const [saving, setSaving] = useState(false);
  const { speak, speakSequence, speaking, cancel } = useSpeech();
  const pack = IMMERSION[destination];

  async function setAsMine() {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ destination }),
      });
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  const isMine = state.profile.destination === destination;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Immersion Mode</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Pick an environment and the content adapts to it: local expressions, vocabulary differences,
          accent notes, cultural context and a real conversation.
        </p>
      </div>

      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
        {IMMERSION_LIST.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              cancel();
              setDestination(item.id);
            }}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
              destination === item.id
                ? "border-brand bg-brand-soft text-brand-strong"
                : "border-border bg-surface hover:bg-surface-2",
            )}
          >
            <span className="text-lg">{item.flag}</span>
            {item.country}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">
              {pack.flag} {pack.country}
            </h2>
            <p className="mt-1 max-w-xl text-muted">{pack.blurb}</p>
          </div>
          <Button variant={isMine ? "secondary" : "primary"} onClick={setAsMine} loading={saving} disabled={isMine}>
            {isMine ? <Check className="size-4" /> : null}
            {isMine ? "Your destination" : "Make this my destination"}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Local expressions" subtitle="Tap any phrase to hear it in the local accent." />
          <ul className="space-y-2.5">
            {pack.expressions.map((item) => (
              <li key={item.phrase} className="text-sm">
                <button
                  onClick={() => speak(item.phrase, { accent: pack.id })}
                  className="font-medium text-brand hover:underline"
                >
                  “{item.phrase}”
                </button>
                <span className="text-muted"> — {item.meaning}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Vocabulary that differs" subtitle="Same idea, different word." />
          <ul className="space-y-3">
            {pack.vocabulary.map((item) => (
              <li key={item.local} className="text-sm">
                <p>
                  <span className="font-medium">{item.local}</span>
                  <span className="text-muted"> = {item.neutral}</span>
                </p>
                <p className="text-muted">{item.note}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Accent notes" subtitle="What to expect when you hear it." />
          <ul className="space-y-2 text-sm text-muted">
            {pack.accentNotes.map((note) => (
              <li key={note} className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                {note}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Cultural context" subtitle="How communication actually works there." />
          <ul className="space-y-2 text-sm text-muted">
            {pack.culture.map((note) => (
              <li key={note} className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {note}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="A real conversation"
          subtitle="An ordinary exchange you'd have in your first week."
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                speaking ? cancel() : speakSequence(pack.conversation, { accent: pack.id })
              }
            >
              {speaking ? <Volume2 className="size-4" /> : <Play className="size-4" />}
              {speaking ? "Stop" : "Play"}
            </Button>
          }
        />
        <ul className="space-y-2">
          {pack.conversation.map((line, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <button
                onClick={() => speak(line.text, { accent: pack.id, rate: line.rate })}
                aria-label="Replay line"
                className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted hover:text-brand"
              >
                <Volume2 className="size-3.5" />
              </button>
              <span>
                <span className="font-medium">{line.speaker}: </span>
                <span className="text-muted">{line.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Where to get more input" subtitle="Real content made for locals, not for learners." />
        <div className="grid gap-3 sm:grid-cols-3">
          {pack.creators.map((creator) => (
            <div key={creator.name} className="rounded-xl bg-surface-2 p-4">
              <Badge tone="neutral">{creator.kind}</Badge>
              <p className="mt-2 font-medium">{creator.name}</p>
              <p className="mt-1 text-sm text-muted">{creator.why}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
