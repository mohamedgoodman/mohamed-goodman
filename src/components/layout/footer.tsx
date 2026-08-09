import { MapPinIcon, PhoneIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { PaymentMarks } from "@/components/layout/payment-marks";
import {
  brand,
  hasAddress,
  hasInstagram,
  hasMapsUrl,
  hasTiktok,
  shop,
  shopLinks,
} from "@/config/shop";
import { footerNav } from "@/data/navigation";

/**
 * Site footer.
 *
 * Every block here is conditional on the config actually holding a value —
 * an address block reading "à compléter" or a social icon linking nowhere
 * damages trust more than the missing block would.
 */
export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const year = new Date().getFullYear();

  const socials = [
    hasInstagram ? { href: shopLinks.instagram, label: "Instagram" } : null,
    hasTiktok ? { href: shopLinks.tiktok, label: "TikTok" } : null,
  ].filter((s): s is { href: string; label: string } => s !== null);

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
                        className="text-muted-foreground hover:text-foreground text-base transition-colors"
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

        <div className="border-border mt-(--space-12) grid gap-6 border-t pt-8 sm:grid-cols-2">
          {/* The store block only appears once there's a real address. */}
          {hasAddress ? (
            <div>
              <h3 className="eyebrow">{t("store.title")}</h3>
              <address className="mt-3 text-sm not-italic">
                {/* A Latin address inside RTL copy gets reordered by the bidi
                    algorithm, so each line is isolated. */}
                <bdi>{shop.ADDRESS}</bdi>
                <br />
                <span className="text-muted-foreground">
                  {t("store.hours", { hours: brand.hours })}
                </span>
              </address>
              {hasMapsUrl ? (
                <a
                  href={shop.MAPS_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline mt-3 inline-flex items-center gap-1.5 text-sm"
                >
                  <MapPinIcon className="size-4" aria-hidden="true" />
                  {t("store.directions")}
                </a>
              ) : null}
            </div>
          ) : null}

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
          {socials.length > 0 ? (
            <ul aria-label={t("followUs")} className="flex flex-wrap gap-4">
              {socials.map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <PaymentMarks />
            <LocaleSwitcher className="lg:hidden" />
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
