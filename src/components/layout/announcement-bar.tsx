"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const DISMISS_KEY = "eh:announcement-dismissed";
const ROTATE_MS = 5000;

/**
 * Thin rotating announcement strip above the header.
 *
 * Rotation pauses on hover/focus and for users who prefer reduced motion, and
 * the live region is polite so a screen reader isn't interrupted by marketing.
 */
export function AnnouncementBar() {
  const t = useTranslations("announcement");

  // The delivery promise is the shop's whole positioning, so it leads the
  // rotation rather than waiting until checkout.
  const messages = t.raw("messages") as string[];

  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    // Deferred a frame so the stored preference is applied without a
    // synchronous cascading render on mount.
    const frame = requestAnimationFrame(() => {
      let stored = false;
      try {
        stored = window.localStorage.getItem(DISMISS_KEY) === "1";
      } catch {
        // Storage unavailable (private mode) — just show the bar.
      }
      setDismissed(stored);
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (dismissed || messages.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % messages.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [dismissed, messages.length]);

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Non-fatal: the bar just comes back next visit.
    }
  }

  // Render nothing until we know the stored preference, so a dismissed bar
  // never flashes in on load.
  if (dismissed || !mounted) return null;

  return (
    <div className="bg-foreground text-background relative">
      <div
        className="container-editorial flex h-(--announcement-h) items-center justify-center"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        onFocusCapture={() => (paused.current = true)}
        onBlurCapture={() => (paused.current = false)}
      >
        <p
          aria-live="polite"
          aria-atomic="true"
          className="text-2xs px-8 text-center tracking-wide"
        >
          {messages[index]}
        </p>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="absolute inset-y-0 end-2 grid w-8 place-items-center opacity-70 transition-opacity hover:opacity-100"
      >
        <XIcon className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
