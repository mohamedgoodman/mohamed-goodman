import { formatMADParts } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Price as PriceValue } from "@/lib/shop/types";

/**
 * A price, safe inside Arabic copy.
 *
 * The numeral is wrapped in `<bdi dir="ltr">` so the bidi algorithm treats it
 * as one left-to-right run: "450 درهم" always reads 4-5-0, never 0-5-4, and a
 * price sitting next to other numbers or punctuation can't be reordered.
 */
export function Price({
  amount,
  locale,
  className,
  compareAt,
}: {
  amount: PriceValue;
  locale: string;
  className?: string;
  /** Struck-through original, when the item is discounted. */
  compareAt?: PriceValue;
}) {
  const { digits, unit } = formatMADParts(amount, { locale });

  return (
    <span className={cn("whitespace-nowrap tabular-nums", className)}>
      <bdi dir="ltr">{digits}</bdi>&nbsp;{unit}
      {compareAt != null && compareAt > amount ? (
        <s className="text-muted-foreground ms-2 font-normal">
          <bdi dir="ltr">{formatMADParts(compareAt, { locale }).digits}</bdi>
          &nbsp;{unit}
        </s>
      ) : null}
    </span>
  );
}
