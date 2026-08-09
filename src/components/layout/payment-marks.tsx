import { BanknoteIcon } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Accepted payment methods.
 *
 * Cash on delivery only. A card mark here would promise a checkout the shop
 * can't honour yet — showing one and failing at payment costs more than not
 * offering it.
 */
export function PaymentMarks() {
  const t = useTranslations("footer");

  return (
    <ul
      aria-label={t("payments")}
      className="flex flex-wrap items-center gap-2"
    >
      <li className="border-border text-muted-foreground flex items-center gap-1.5 border px-2 py-1">
        <BanknoteIcon className="size-3.5" aria-hidden="true" />
        <span className="text-2xs">{t("cod")}</span>
      </li>
    </ul>
  );
}
