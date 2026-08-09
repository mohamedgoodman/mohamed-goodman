import { BanknoteIcon, MapPinIcon, StoreIcon, TruckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { brand } from "@/data/brand";
import { buildWhatsAppContactLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * Trust strip — directly under the hero, not in the footer.
 *
 * Every claim here is one the shop can actually keep: delivery is Ben Guerir
 * only and same-day, payment is cash to the driver, and there is a real shop
 * you can walk into. The previous version promised 48h to Casablanca, Rabat
 * and Marrakech, which was simply untrue for this business.
 *
 * Two of the four are links, because "there's a real shop" and "there's a real
 * person on WhatsApp" are only reassuring if you can check them.
 */
export function TrustStrip({ className }: { className?: string }) {
  const t = useTranslations("trust");

  return (
    <section
      aria-label={t("cod.title")}
      className={cn("border-border border-y", className)}
    >
      <ul className="container-editorial grid grid-cols-2 md:grid-cols-4">
        <li className="border-border flex items-start gap-2.5 py-4 pe-4 md:border-e md:py-5 md:pe-6">
          <BanknoteIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm leading-snug font-medium">{t("cod.title")}</p>
            <p className="text-muted-foreground mt-1 text-xs md:text-sm">
              {t("cod.body")}
            </p>
          </div>
        </li>

        <li className="border-border flex items-start gap-2.5 py-4 pe-4 md:border-e md:py-5 md:ps-6 md:pe-6">
          <TruckIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm leading-snug font-medium">
              {t("delivery.title")}
            </p>
            <p className="text-muted-foreground mt-1 text-xs md:text-sm">
              {t("delivery.body")}
            </p>
          </div>
        </li>

        <li className="border-border flex items-start gap-2.5 py-4 pe-4 md:border-e md:py-5 md:ps-6 md:pe-6">
          <StoreIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm leading-snug font-medium">
              {t("store.title")}
            </p>
            <a
              href={brand.store.mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="link-underline mt-1 inline-flex items-center gap-1 text-xs md:text-sm"
            >
              <MapPinIcon className="size-3.5 shrink-0" aria-hidden="true" />
              {t("store.body")}
            </a>
          </div>
        </li>

        <li className="flex items-start gap-2.5 py-4 pe-4 md:py-5 md:ps-6">
          <WhatsAppGlyph className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm leading-snug font-medium">
              {t("whatsapp.title")}
            </p>
            <a
              href={buildWhatsAppContactLink()}
              target="_blank"
              rel="noreferrer noopener"
              className="link-underline mt-1 block text-xs tabular-nums md:text-sm"
              dir="ltr"
            >
              {brand.phoneDisplay}
            </a>
          </div>
        </li>
      </ul>
    </section>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.25 8.23zm4.43-5.77c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z" />
    </svg>
  );
}
