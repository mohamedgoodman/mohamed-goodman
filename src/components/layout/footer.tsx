import { MapPinIcon, PhoneIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { PaymentMarks } from "@/components/layout/payment-marks";
import { brand } from "@/data/brand";
import { footerNav } from "@/data/navigation";

const socials: Array<{ key: keyof typeof brand.social; label: string }> = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
];

/**
 * Site footer: three link columns plus the newsletter, then a bottom rule with
 * socials, payment marks and the language switcher.
 *
 * On mobile the columns stack; the newsletter comes first there because it's
 * the only thing in the footer a phone visitor is likely to act on.
 */
export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-border mt-(--space-section) border-t">
      <div className="container-editorial py-(--space-section)">
        <div className="grid gap-(--space-12) lg:grid-cols-12">
          <div className="lg:order-last lg:col-span-5">
            <NewsletterForm />
          </div>

          <nav
            aria-label={t("columns.shop")}
            className="grid grid-cols-2 gap-(--space-8) sm:grid-cols-3 lg:col-span-7"
          >
            {footerNav.map((column) => (
              <div key={column.key}>
                <h3 className="eyebrow">{t(`columns.${column.key}`)}</h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.key}-${link.key}`}>
                      <Link
                        href={link.href}
                        className="text-subtle-foreground hover:text-foreground text-base transition-colors"
                      >
                        {tNav(`links.${link.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Where the shop physically is, and how to reach a person. Both are
            reasons a first-time buyer decides the store is real. */}
        <div className="border-border mt-(--space-12) grid gap-6 border-t pt-8 sm:grid-cols-2">
          <div>
            <h3 className="eyebrow">{t("store.title")}</h3>
            {/* A Latin street address inside RTL copy gets reordered by the
                bidi algorithm ("12, rue…" comes out "rue…, 12"). Each line is
                isolated so it keeps its own reading order. */}
            <address className="mt-3 text-sm not-italic">
              <bdi>{brand.store.line1}</bdi>
              <br />
              <bdi>
                {brand.store.district}, {brand.store.city}
              </bdi>
              <br />
              <span className="text-muted-foreground">
                {t("store.hours", { hours: brand.store.hours })}
              </span>
            </address>
            <a
              href={brand.store.mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="link-underline mt-3 inline-flex items-center gap-1.5 text-sm"
            >
              <MapPinIcon className="size-4" aria-hidden="true" />
              {t("store.directions")}
            </a>
          </div>

          <div>
            <h3 className="eyebrow">{t("callUs")}</h3>
            <a
              href={`tel:${brand.phone}`}
              dir="ltr"
              className="text-h5 font-display mt-3 inline-flex items-center gap-2 tabular-nums transition-opacity hover:opacity-70"
            >
              <PhoneIcon className="size-4 shrink-0" aria-hidden="true" />
              {brand.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="border-border mt-(--space-12) flex flex-col gap-6 border-t pt-8 lg:flex-row lg:items-center lg:justify-between">
          <ul aria-label={t("followUs")} className="flex flex-wrap gap-4">
            {socials.map(({ key, label }) => (
              <li key={key}>
                <a
                  href={brand.social[key]}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <PaymentMarks />
            <LocaleSwitcher className="xl:hidden" />
          </div>
        </div>

        <p className="text-muted-foreground text-2xs mt-8">
          <bdi>
            © {year} {brand.name}.
          </bdi>{" "}
          {t("rights")}
        </p>
      </div>
    </footer>
  );
}
