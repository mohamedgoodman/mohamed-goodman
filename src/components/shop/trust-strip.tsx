import {
  BanknoteIcon,
  PhoneIcon,
  RotateCcwIcon,
  TruckIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { brand } from "@/data/brand";
import { cn } from "@/lib/utils";

/**
 * Trust strip — sits directly under the hero, not in the footer.
 *
 * For a first-time Moroccan buyer this is the whole decision: can I pay when
 * it arrives, when does it arrive, can I send it back, and is there a human on
 * the end of a phone. Burying that at the bottom of the page loses the sale
 * before they ever reach it.
 *
 * On phones it's a 2×2 grid, not a scroller: these four facts are the ones a
 * hesitant buyer needs together, and a scroller both hides half of them and
 * clips the visible half mid-word.
 */
export function TrustStrip({ className }: { className?: string }) {
  const t = useTranslations("trust");

  const items = [
    { key: "cod", icon: BanknoteIcon },
    { key: "delivery", icon: TruckIcon },
    { key: "returns", icon: RotateCcwIcon },
  ] as const;

  return (
    <section
      aria-label={t("cod.title")}
      className={cn("border-border border-y", className)}
    >
      <ul className="container-editorial grid grid-cols-2 md:grid-cols-4">
        {items.map(({ key, icon: Icon }) => (
          <li
            key={key}
            className="border-border flex items-start gap-2.5 py-4 pe-4 md:border-e md:py-5 md:ps-6 md:pe-6 md:first:ps-0"
          >
            <Icon
              className="text-brand mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm leading-snug font-medium">
                {t(`${key}.title`)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs md:text-sm">
                {t(`${key}.body`)}
              </p>
            </div>
          </li>
        ))}

        {/* The phone number is a real tel: link — on a phone it should dial. */}
        <li className="flex items-start gap-2.5 py-4 pe-4 md:py-5 md:ps-6">
          <PhoneIcon
            className="text-brand mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm leading-snug font-medium">
              {t("phone.title")}
            </p>
            <a
              href={`tel:${brand.phone}`}
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
