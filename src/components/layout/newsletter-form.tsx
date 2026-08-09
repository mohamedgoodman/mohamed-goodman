"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * WhatsApp-first signup.
 *
 * Email capture assumes an audience that lives in its inbox. Here the phone
 * number is the primary field and the channel is WhatsApp; email stays as an
 * optional extra rather than the thing we ask for first.
 */

/** Moroccan mobile: 06/07 + 8 digits, or the +212 international form. */
const MOROCCAN_MOBILE = /^(?:\+212|00212|0)([67])\d{8}$/;

function normalisePhone(value: string): string {
  return value.replace(/[\s.\-()]/g, "");
}

export function isMoroccanMobile(value: string): boolean {
  return MOROCCAN_MOBILE.test(normalisePhone(value));
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterForm() {
  const t = useTranslations("footer.newsletter");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<"phone" | "email" | null>(null);
  const [done, setDone] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!isMoroccanMobile(phone)) {
      setError("phone");
      return;
    }
    if (email.trim() && !EMAIL.test(email.trim())) {
      setError("email");
      return;
    }

    // TODO: POST to the WhatsApp list provider once one is chosen.
    setError(null);
    setDone(true);
    setPhone("");
    setEmail("");
  }

  return (
    <div>
      <h3 className="text-h5 font-display">{t("title")}</h3>
      <p className="text-muted-foreground mt-2 text-sm">{t("body")}</p>

      <form onSubmit={submit} noValidate className="mt-4 space-y-4">
        <div>
          <label htmlFor="signup-phone" className="text-sm font-medium">
            {t("phoneLabel")}
          </label>
          <div className="border-input focus-within:border-foreground mt-1 flex items-center border-b transition-colors">
            {/* A phone number is a left-to-right sequence in every language,
                so the field stays LTR even inside the Arabic RTL layout. */}
            <input
              id="signup-phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              name="phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error === "phone") setError(null);
              }}
              placeholder={t("phonePlaceholder")}
              autoComplete="tel"
              aria-invalid={error === "phone"}
              aria-describedby="signup-status"
              className="text-md placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent py-2 text-start tabular-nums outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="text-muted-foreground text-sm"
          >
            {t("emailLabel")}
          </label>
          <div className="border-input focus-within:border-foreground mt-1 flex items-center border-b transition-colors">
            <input
              id="signup-email"
              type="email"
              dir="ltr"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error === "email") setError(null);
              }}
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
              aria-invalid={error === "email"}
              aria-describedby="signup-status"
              className="text-md placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent py-2 text-start outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-foreground text-background inline-flex h-11 items-center gap-2 rounded-sm px-6 text-sm font-medium transition-opacity hover:opacity-90"
        >
          {done ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
          {t("submit")}
        </button>

        <p id="signup-status" role="status" className="text-2xs min-h-4">
          {done ? <span className="text-success">{t("success")}</span> : null}
          {error === "phone" ? (
            <span className="text-destructive">{t("errorPhone")}</span>
          ) : null}
          {error === "email" ? (
            <span className="text-destructive">{t("errorEmail")}</span>
          ) : null}
        </p>
      </form>
    </div>
  );
}
