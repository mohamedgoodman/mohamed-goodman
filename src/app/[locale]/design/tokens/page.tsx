import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PreviewControls } from "@/components/design/preview-controls";
import { TokenValue } from "@/components/design/token-value";
import {
  brandPalette,
  motionTokens,
  radiusScale,
  semanticColors,
  shadowScale,
  spaceScale,
  typeScale,
} from "@/lib/design-tokens";
import { formatMAD } from "@/lib/money";
import { routing } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Design tokens",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border reveal border-t py-(--space-12)">
      <h2 className="text-h3">{title}</h2>
      {intro ? (
        <p className="text-subtle-foreground text-md mt-2 max-w-prose">
          {intro}
        </p>
      ) : null}
      <div className="mt-(--space-8)">{children}</div>
    </section>
  );
}

function Swatch({ name, usage }: { name: string; usage?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="border-border size-12 shrink-0 rounded-sm border"
        style={{ background: `var(${name})` }}
      />
      <div className="min-w-0">
        <p className="font-mono text-xs">{name}</p>
        {usage ? (
          <p className="text-muted-foreground text-xs">{usage}</p>
        ) : null}
        <TokenValue name={name} />
      </div>
    </div>
  );
}

export default async function TokensPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tokens");

  return (
    <div className="container-narrow py-(--space-16)">
      <header className="mb-(--space-12)">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="text-h1 mt-3">{t("title")}</h1>
        <p className="text-subtle-foreground text-md mt-4 max-w-prose">
          {t("intro")}
        </p>
        <div className="mt-(--space-6)">
          <PreviewControls />
        </div>
      </header>

      <Section title={t("colorTitle")} intro={t("colorIntro")}>
        <h3 className="eyebrow">{t("brandPalette")}</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brandPalette.tokens.map((token) => (
            <Swatch key={token.name} {...token} />
          ))}
        </div>

        <h3 className="eyebrow mt-(--space-12)">{t("semantic")}</h3>
        <div className="mt-4 space-y-(--space-8)">
          {semanticColors.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-medium">{group.title}</p>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.tokens.map((token) => (
                  <Swatch key={token.name} {...token} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("typeTitle")} intro={t("typeIntro")}>
        <div className="divide-border divide-y">
          {typeScale.map((item) => (
            <div
              key={item.name}
              className="flex flex-col gap-2 py-5 md:flex-row md:items-baseline md:gap-8"
            >
              <div className="md:w-40 md:shrink-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-muted-foreground text-2xs font-mono">
                  {item.name}
                </p>
              </div>
              <p
                className={item.display ? "font-display" : "font-sans"}
                style={{
                  fontSize: `var(${item.name})`,
                  lineHeight: item.display
                    ? "var(--leading-snug)"
                    : "var(--leading-normal)",
                  letterSpacing: item.display
                    ? "var(--tracking-display)"
                    : "var(--tracking-normal)",
                }}
              >
                {item.sample}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-surface border-border mt-(--space-12) rounded-sm border p-(--space-8)">
          <h3 className="text-h4">{t("sample")}</h3>
          <p className="text-subtle-foreground text-md mt-4 max-w-prose leading-relaxed">
            {t("sampleBody")}
          </p>
        </div>
      </Section>

      <Section title={t("spaceTitle")}>
        <ul className="space-y-3">
          {spaceScale.map((name) => (
            <li key={name} className="flex items-center gap-4">
              <code className="text-muted-foreground w-40 shrink-0 font-mono text-xs">
                {name}
              </code>
              <span
                className="bg-foreground h-3 rounded-xs"
                style={{ width: `var(${name})` }}
              />
              <TokenValue name={name} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t("radiusTitle")}>
        <div className="flex flex-wrap gap-6">
          {radiusScale.map((name) => (
            <div key={name} className="text-center">
              <div
                className="bg-surface-2 border-border size-20 border"
                style={{ borderRadius: `var(${name})` }}
              />
              <code className="text-muted-foreground text-2xs mt-2 block font-mono">
                {name.replace("--radius-", "")}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("shadowTitle")}>
        <div className="flex flex-wrap gap-8">
          {shadowScale.map((name) => (
            <div key={name} className="text-center">
              <div
                className="bg-surface size-24 rounded-sm"
                style={{ boxShadow: `var(${name})` }}
              />
              <code className="text-muted-foreground text-2xs mt-3 block font-mono">
                {name.replace("--shadow-", "")}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("motionTitle")}>
        <div className="grid gap-8 sm:grid-cols-2">
          <ul className="space-y-2">
            {motionTokens.durations.map((name) => (
              <li
                key={name}
                className="flex items-baseline justify-between gap-4"
              >
                <code className="font-mono text-xs">{name}</code>
                <TokenValue name={name} />
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            {motionTokens.easings.map((name) => (
              <li
                key={name}
                className="flex items-baseline justify-between gap-4"
              >
                <code className="font-mono text-xs">{name}</code>
                <TokenValue name={name} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title={t("priceTitle")} intro={t("priceIntro")}>
        <ul className="flex flex-wrap gap-x-10 gap-y-4">
          {[390, 450, 1890, 4900].map((amount) => (
            <li key={amount}>
              <span className="text-h5 font-sans">
                {formatMAD(amount, { locale })}
              </span>
            </li>
          ))}
          <li className="flex items-baseline gap-3">
            <span className="text-sale text-h5 font-sans">
              {formatMAD(340, { locale })}
            </span>
            <s className="text-muted-foreground text-md">
              {formatMAD(420, { locale })}
            </s>
          </li>
        </ul>
      </Section>

      <Section title={t("componentsTitle")}>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="bg-foreground text-background h-12 rounded-sm px-8 text-sm font-medium transition-colors hover:opacity-90"
          >
            Ajouter au panier
          </button>
          <button
            type="button"
            className="border-foreground text-foreground hover:bg-foreground hover:text-background h-12 rounded-sm border px-8 text-sm font-medium transition-colors"
          >
            Aperçu rapide
          </button>
          <span className="bg-sale text-sale-foreground text-2xs rounded-xs px-2 py-1 font-medium tracking-wide uppercase">
            Nouveauté
          </span>
          <span className="bg-surface-2 text-subtle-foreground text-2xs rounded-xs px-2 py-1 font-medium tracking-wide uppercase">
            Essentiel
          </span>
          <span className="text-muted-foreground text-sm">3 couleurs</span>
        </div>

        <div className="mt-(--space-8) grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-[3/4] w-full rounded-sm" />
              <div className="skeleton h-3 w-2/3 rounded-xs" />
              <div className="skeleton h-3 w-1/3 rounded-xs" />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
