"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { isMoroccanMobile } from "@/components/layout/newsletter-form";
import { buildWhatsAppContactLink } from "@/lib/whatsapp";

/**
 * Order lookup by phone number — there are no accounts, so the number the
 * customer gave when ordering is the only handle they have.
 *
 * There is no orders backend yet, so every valid lookup honestly reports "not
 * found" and hands over to WhatsApp, where a human can actually check. It does
 * not pretend to search.
 */
export function OrderTrackForm() {
  const t = useTranslations("tracking");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "invalid" | "notFound">("idle");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setState(isMoroccanMobile(phone) ? "notFound" : "invalid");
  }

  return (
    <>
      <form onSubmit={submit} noValidate className="max-w-sm">
        <label htmlFor="track-phone" className="text-sm font-medium">
          {t("phoneLabel")}
        </label>
        <div className="border-input focus-within:border-foreground mt-1 flex items-center border-b transition-colors">
          <input
            id="track-phone"
            type="tel"
            inputMode="tel"
            dir="ltr"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (state !== "idle") setState("idle");
            }}
            placeholder="06 12 34 56 78"
            autoComplete="tel"
            aria-invalid={state === "invalid"}
            aria-describedby="track-status"
            className="text-md placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent py-2 text-start tabular-nums outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-foreground text-background mt-5 inline-flex h-11 items-center rounded-sm px-6 text-sm font-medium transition-opacity hover:opacity-90"
        >
          {t("submit")}
        </button>
      </form>

      <div id="track-status" role="status" className="mt-6">
        {state === "invalid" ? (
          <p className="text-destructive text-sm">{t("invalid")}</p>
        ) : null}

        {state === "notFound" ? (
          <div className="border-border max-w-md border p-(--space-6)">
            <p className="font-medium">{t("notFoundTitle")}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              {t("notFoundBody")}
            </p>
            <a
              href={buildWhatsAppContactLink()}
              target="_blank"
              rel="noreferrer noopener"
              className="border-foreground hover:bg-foreground hover:text-background mt-4 inline-flex h-11 items-center rounded-sm border px-6 text-sm font-medium transition-colors"
            >
              {t("askWhatsapp")}
            </a>
          </div>
        ) : null}
      </div>
    </>
  );
}
