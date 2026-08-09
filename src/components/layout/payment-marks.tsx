import { BanknoteIcon, CreditCardIcon } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Accepted payment methods.
 *
 * Deliberately generic marks rather than card-network logos: dropping in real
 * Visa/Mastercard/CMI artwork is a licensing decision, and inventing lookalike
 * logos would misrepresent them. Swap these for the official assets once the
 * payment provider is signed.
 *
 * Cash on delivery leads, because that is how most orders will be paid.
 */
export function PaymentMarks() {
  const t = useTranslations("footer");

  const marks = [
    { icon: BanknoteIcon, label: t("cod") },
    { icon: CreditCardIcon, label: "CMI" },
  ];

  return (
    <ul
      aria-label={t("payments")}
      className="flex flex-wrap items-center gap-2"
    >
      {marks.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="border-border text-muted-foreground flex items-center gap-1.5 rounded-xs border px-2 py-1"
        >
          <Icon className="size-3.5" aria-hidden="true" />
          <span className="text-2xs">{label}</span>
        </li>
      ))}
    </ul>
  );
}
