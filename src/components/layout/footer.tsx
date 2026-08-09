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
  { key: "facebook", label: "Facebook" },
  { key: "pinterest", label: "Pinterest" },
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
      <div className="container-editorial py-(--space-16)">
        <div className="grid gap-(--space-12) lg:grid-cols-12">
          <div className="lg:order-last lg:col-span-4">
            <NewsletterForm />
          </div>

          <nav
            aria-label={t("columns.wardrobe")}
            className="grid grid-cols-2 gap-(--space-8) sm:grid-cols-4 lg:col-span-8"
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

        <div className="border-border mt-(--space-16) flex flex-col gap-6 border-t pt-8 lg:flex-row lg:items-center lg:justify-between">
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
          © {year} {brand.name}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
