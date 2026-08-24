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

/** Ambient accent per destination — brand-family colours only. */
const DESTINATION_LIGHT: Record<DestinationId, string> = {
  usa: "rgba(37,99,235,0.4)",
  uk: "rgba(124,58,237,0.4)",
  canada: "rgba(244,63,94,0.28)",
  australia: "rgba(16,185,129,0.32)",
  ireland: "rgba(34,211,238,0.32)",
};

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

      {/* Destinations as places, not tabs. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {IMMERSION_LIST.map((item) => {
          const active = destination === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                cancel();
                setDestination(item.id);
              }}
              aria-pressed={active}
              className={cn(
                "group relative flex min-h-28 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border p-3",
                "transition-[transform,box-shadow,border-color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1",
                active
                  ? "border-purple/55 bg-brand-soft shadow-[0_12px_30px_rgba(124,58,237,0.32)]"
                  : "border-border-strong bg-surface/60 shadow-[var(--shadow-sm)] backdrop-blur hover:border-purple/40",
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -bottom-10 h-24 opacity-80 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(60% 100% at 50% 100%, ${DESTINATION_LIGHT[item.id]}, rgba(0,0,0,0) 70%)`,
                }}
              />
              <span className="relative text-3xl transition-transform duration-300 group-hover:scale-110 [text-shadow:0_8px_18px_rgba(0,0,0,0.5)]">
                {item.flag}
              </span>
              <span className="relative text-center text-sm font-medium">{item.country}</span>
            </button>
          );
        })}
      </div>

      <Card elevated glow className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${DESTINATION_LIGHT[pack.id]}, rgba(0,0,0,0) 70%)`,
          }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
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
                  className="-my-1 inline-block py-1 font-medium text-on-brand hover:underline"
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
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-purple shadow-[0_0_8px_rgba(124,58,237,0.7)]" aria-hidden />
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
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgba(245,158,11,0.6)]" aria-hidden />
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
                className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted hover:text-on-brand"
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
            <div
              key={creator.name}
              className="rounded-xl border border-border bg-surface-2/60 p-4 transition-colors hover:border-purple/35"
            >
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
