"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Audio without an audio CDN.
 *
 * Listening, vocabulary and pronunciation all need spoken English. Rather than
 * ship (or invent) an external TTS dependency, we use the browser's built-in
 * SpeechSynthesis, which is available in every modern browser and lets us vary
 * rate and accent per exercise. Everything degrades gracefully: if speech is
 * unavailable the transcript is simply shown instead.
 */

const ACCENT_LOCALES: Record<string, string> = {
  usa: "en-US",
  canada: "en-CA",
  uk: "en-GB",
  australia: "en-AU",
  ireland: "en-IE",
};

export interface SpeakOptions {
  rate?: number;
  accent?: keyof typeof ACCENT_LOCALES | string;
  pitch?: number;
  onEnd?: () => void;
}

/** Capability checks are external state, so they're read, not stored. */
const neverChanges = () => () => {};

export function useSpeech() {
  const supported = useSyncExternalStore(
    neverChanges,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false,
  );
  const [speaking, setSpeaking] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  const pickVoice = useCallback((locale: string) => {
    const voices = voicesRef.current;
    return (
      voices.find((v) => v.lang.replace("_", "-") === locale) ??
      voices.find((v) => v.lang.startsWith(locale.slice(0, 2))) ??
      null
    );
  }, []);

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        options.onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const locale = ACCENT_LOCALES[options.accent ?? "usa"] ?? "en-US";
      utterance.lang = locale;
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      const voice = pickVoice(locale);
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        options.onEnd?.();
      };
      utterance.onerror = () => {
        setSpeaking(false);
        options.onEnd?.();
      };
      window.speechSynthesis.speak(utterance);
    },
    [pickVoice],
  );

  /** Speak a list of lines in order, e.g. a dialogue. */
  const speakSequence = useCallback(
    (
      lines: { text: string; rate?: number }[],
      options: SpeakOptions & { onLine?: (index: number) => void } = {},
    ) => {
      let index = 0;
      const next = () => {
        if (index >= lines.length) {
          options.onEnd?.();
          return;
        }
        const line = lines[index]!;
        options.onLine?.(index);
        index += 1;
        speak(line.text, {
          ...options,
          rate: (line.rate ?? 1) * (options.rate ?? 1),
          onEnd: next,
        });
      };
      next();
    },
    [speak],
  );

  return { supported, speaking, speak, speakSequence, cancel };
}

/* -------------------------------------------------------------------------- */
/* Speech recognition (optional — Chrome/Edge/Safari)                          */
/* -------------------------------------------------------------------------- */

interface RecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}

interface RecognitionEventLike {
  resultIndex: number;
  results: { length: number; [index: number]: RecognitionResultLike };
}

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => RecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition(locale = "en-US") {
  const supported = useSyncExternalStore(
    neverChanges,
    () => getRecognitionCtor() !== null,
    () => false,
  );
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [failed, setFailed] = useState(false);
  const recognitionRef = useRef<RecognitionLike | null>(null);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = locale;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i]?.[0].transcript ?? "";
      }
      setTranscript(text.trim());
    };
    recognition.onerror = () => {
      // Permission denied, no microphone, or an engine error — either way the
      // caller needs to offer a path that doesn't depend on the mic.
      setFailed(true);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setTranscript("");
    setFailed(false);
    setListening(true);
    try {
      recognition.start();
    } catch {
      setFailed(true);
      setListening(false);
    }
  }, [locale]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, transcript, failed, start, stop, setTranscript };
}
