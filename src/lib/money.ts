import type { Price } from "@/lib/shop/types";

/**
 * Every price in the store is in Moroccan dirhams and is displayed as
 * "450 DH" — never "MAD 450,00" and never with decimals, which is how
 * prices are actually written locally.
 *
 * The thin space before "DH" is a narrow no-break space (U+202F) so the
 * amount and the unit never wrap apart.
 */
const NBSP_THIN = " ";

export function formatMAD(
  amount: Price,
  { locale = "fr" }: { locale?: string } = {},
): string {
  // Arabic uses Western digits here on purpose: Moroccan e-commerce prices
  // are read in Latin numerals even in Arabic copy.
  // Grouping is deliberately pinned to fr-FR (thin space) rather than the
  // active locale: "1 890 DH" is how prices are written on Moroccan
  // storefronts, whereas fr-MA groups with a dot and reads like a date.
  const digits = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(amount);

  const unit = locale === "ar" ? "درهم" : "DH";
  return `${digits}${NBSP_THIN}${unit}`;
}

/** Percentage off, rounded down — only shown when a compareAtPrice exists. */
export function discountPercent(
  price: Price,
  compareAt?: Price,
): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.floor(((compareAt - price) / compareAt) * 100);
}
