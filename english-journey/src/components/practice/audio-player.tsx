"use client";

import { useCallback, useState } from "react";
import { Gauge, Pause, Play, RotateCcw, ScrollText } from "lucide-react";
import { useSpeech } from "@/lib/speech";
import { useT } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import type { ListeningLine } from "@/types";

const SPEEDS = [0.75, 1, 1.25] as const;

/** Bar heights for the waveform. Fixed pattern, animated only while playing. */
const BARS = [0.35, 0.6, 0.85, 0.5, 1, 0.7, 0.45, 0.9, 0.6, 0.8, 0.4, 0.95, 0.55, 0.75, 0.35, 0.65,
  0.9, 0.5, 0.7, 0.4, 0.85, 0.6, 0.45, 0.8, 0.5, 0.95, 0.65, 0.4, 0.75, 0.55];

/**
 * The listening transport.
 *
 * Speech synthesis has no seekable timeline, so progress is tracked by line:
 * the waveform animates while a line is being spoken and the bar fills as
 * lines complete. Everything the spec asks for is here — circular play,
 * waveform, progress, speed, replay, transcript toggle — with no audio files
 * and no external player library.
 */
export function AudioPlayer({
  lines,
  accent,
  baseRate = 1,
  transcriptOpen,
  onToggleTranscript,
  onPlay,
  onLineChange,
}: {
  lines: ListeningLine[];
  accent?: string;
  baseRate?: number;
  transcriptOpen?: boolean;
  onToggleTranscript?: () => void;
  onPlay?: () => void;
  onLineChange?: (index: number | null) => void;
}) {
  const { supported, speaking, speakSequence, cancel } = useSpeech();
  const t = useT();
  const [speedIndex, setSpeedIndex] = useState(1);
  const [line, setLine] = useState<number | null>(null);
  const [plays, setPlays] = useState(0);
  const [finished, setFinished] = useState(false);

  const speed = SPEEDS[speedIndex] ?? 1;
  const played = line === null ? (finished ? 100 : 0) : ((line + 1) / lines.length) * 100;

  const start = useCallback(() => {
    setFinished(false);
    setPlays((n) => n + 1);
    onPlay?.();
    speakSequence(lines, {
      accent,
      rate: baseRate * speed,
      onLine: (index) => {
        setLine(index);
        onLineChange?.(index);
      },
      onEnd: () => {
        setFinished(true);
        setLine(null);
        onLineChange?.(null);
      },
    });
  }, [accent, baseRate, lines, onLineChange, onPlay, speakSequence, speed]);

  const toggle = useCallback(() => {
    if (speaking) {
      cancel();
      setLine(null);
      onLineChange?.(null);
      return;
    }
    start();
  }, [cancel, onLineChange, speaking, start]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-surface-2/60 p-4 backdrop-blur sm:p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-20 h-40 opacity-70"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 100%, rgba(34,211,238,0.18), rgba(34,211,238,0) 70%)",
        }}
      />
      <div className="relative flex items-center gap-4">
        {/* Circular transport */}
        <button
          type="button"
          onClick={toggle}
          aria-label={speaking ? t.immersion.stop : t.immersion.play}
          className={cn(
            "press relative grid size-14 shrink-0 place-items-center rounded-full text-white sm:size-16",
            "[background:var(--grad-brand)] shadow-[0_8px_26px_rgba(124,58,237,0.45),inset_0_1px_0_rgba(255,255,255,0.3)]",
            "transition-transform duration-250 hover:scale-105",
          )}
        >
          {speaking ? (
            <span
              aria-hidden
              className="absolute inset-0 rounded-full ring-2 ring-cyan/50"
              style={{ animation: "ring-pulse 1.6s ease-out infinite" }}
            />
          ) : null}
          {speaking ? <Pause className="size-6" /> : <Play className="size-6 translate-x-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          {/* Waveform */}
          <div className="flex h-10 items-center justify-between gap-[2px]" aria-hidden>
            {BARS.map((height, index) => {
              // A bar lights up once playback has passed its position.
              const reached = played > 0 && ((index + 1) / BARS.length) * 100 <= played;
              return (
                <span
                  key={index}
                  className={cn(
                    "w-[2px] rounded-full transition-colors duration-300 sm:w-[3px]",
                    reached ? "bg-cyan" : "bg-surface-3",
                  )}
                  style={{
                    height: `${Math.max(height * 100, 16)}%`,
                    animation: speaking
                      ? `wave ${700 + (index % 5) * 120}ms ease-in-out ${index * 22}ms infinite`
                      : undefined,
                    boxShadow: reached ? "0 0 6px rgba(34,211,238,0.55)" : undefined,
                  }}
                />
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-dim">
            <span className="tabular-nums">
              {line === null
                ? finished
                  ? t.exercise.finished
                  : plays === 0
                    ? t.exercise.notPlayed
                    : t.exercise.ready
                : `${t.exercise.line} ${line + 1} ${t.common.of} ${lines.length}`}
            </span>
            <span className="tabular-nums">
              {plays > 0 ? `${plays} ${plays === 1 ? t.exercise.play : t.exercise.plays}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={start}
          disabled={!supported}
          className="press inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-strong bg-surface/70 px-3 text-xs font-medium text-muted transition-colors hover:text-text disabled:opacity-50"
        >
          <RotateCcw className="size-3.5" />
          {t.common.replay}
        </button>

        <button
          type="button"
          onClick={() => setSpeedIndex((i) => (i + 1) % SPEEDS.length)}
          aria-label={`${t.exercise.speed} ${speed}×`}
          className="press inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-strong bg-surface/70 px-3 text-xs font-medium text-muted transition-colors hover:text-text"
        >
          <Gauge className="size-3.5" />
          {speed}×
        </button>

        {onToggleTranscript ? (
          <button
            type="button"
            onClick={onToggleTranscript}
            className={cn(
              "press ms-auto inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors",
              transcriptOpen
                ? "border-cyan/40 bg-cyan-soft text-on-cyan"
                : "border-border-strong bg-surface/70 text-muted hover:text-text",
            )}
          >
            <ScrollText className="size-3.5" />
            {transcriptOpen ? `${t.common.hide} ${t.exercise.transcript}` : t.exercise.transcript}
          </button>
        ) : null}
      </div>

      {!supported ? (
        <p className="relative mt-3 text-xs text-dim">
          {t.exercise.noSpeech}
        </p>
      ) : null}
    </div>
  );
}
