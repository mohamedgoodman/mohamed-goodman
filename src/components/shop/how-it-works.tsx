import { useTranslations } from "next-intl";

/**
 * Four steps, on a surface band.
 *
 * Ordering online from a small local shop is an act of trust, and most of the
 * doubt is procedural: who calls me, when does it come, when do I pay. Saying
 * it plainly up front removes more hesitation than any guarantee badge.
 */
export function HowItWorks() {
  const t = useTranslations("howItWorks");
  const steps = t.raw("steps") as Array<{ title: string; body: string }>;

  return (
    <section id="comment-ca-marche" className="bg-surface">
      <div className="container-editorial section-y">
        <h2 className="text-h3">{t("title")}</h2>

        <ol className="mt-(--space-8) grid gap-(--space-6) sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="border-foreground border-t pt-4">
              <span
                aria-hidden="true"
                className="text-muted-foreground text-sm tabular-nums"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 font-medium">{step.title}</p>
              <p className="text-muted-foreground mt-1 text-sm">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
