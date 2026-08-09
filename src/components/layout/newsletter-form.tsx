"use client";

import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Footer newsletter capture.
 *
 * There's no backend yet, so this validates and confirms locally — the submit
 * handler is the single place to wire a real endpoint later.
 */
export function NewsletterForm() {
  const t = useTranslations("footer.newsletter");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "done" | "error">("idle");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    if (!valid) {
      setState("error");
      return;
    }
    // TODO: POST to the newsletter provider once one is chosen.
    setState("done");
    setEmail("");
  }

  return (
    <div>
      <h3 className="text-h5 font-serif">{t("title")}</h3>
      <p className="text-muted-foreground mt-2 text-sm">{t("body")}</p>

      <form onSubmit={submit} noValidate className="mt-4">
        <label htmlFor="newsletter-email" className="sr-only">
          {t("placeholder")}
        </label>
        <div className="border-input focus-within:border-foreground flex items-center border-b transition-colors">
          <input
            id="newsletter-email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") setState("idle");
            }}
            placeholder={t("placeholder")}
            autoComplete="email"
            aria-invalid={state === "error"}
            aria-describedby="newsletter-status"
            className="text-md placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent py-2 outline-none"
          />
          <button
            type="submit"
            className="grid size-9 shrink-0 place-items-center transition-opacity hover:opacity-70"
            aria-label={t("submit")}
          >
            {state === "done" ? (
              <CheckIcon className="size-4" aria-hidden="true" />
            ) : (
              <ArrowRightIcon
                className="size-4 rtl:-scale-x-100"
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        <p
          id="newsletter-status"
          role="status"
          className="text-2xs mt-2 min-h-4"
          data-state={state}
        >
          {state === "done" ? (
            <span className="text-success">{t("success")}</span>
          ) : state === "error" ? (
            <span className="text-destructive">{t("error")}</span>
          ) : null}
        </p>
      </form>
    </div>
  );
}
