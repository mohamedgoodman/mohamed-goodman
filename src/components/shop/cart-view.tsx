"use client";

import { MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Price } from "@/components/ui/price";
import { useCart } from "@/lib/cart/use-cart";
import { buildWhatsAppCartLink } from "@/lib/whatsapp";
import { pick, type Product } from "@/lib/shop/types";

/**
 * Cart page.
 *
 * Checkout isn't built yet, so the basket hands off to WhatsApp with the whole
 * order written out. That's the flow the shop already runs on, and it beats a
 * checkout button that goes nowhere.
 */
export function CartView({ catalogue }: { catalogue: Product[] }) {
  const locale = useLocale();
  const t = useTranslations("cart");
  const { lines, setQuantity, remove } = useCart();

  const resolved = lines
    .map((line) => ({
      line,
      product: catalogue.find((p) => p.slug === line.slug),
    }))
    .filter((entry): entry is { line: typeof entry.line; product: Product } =>
      Boolean(entry.product),
    );

  const subtotal = resolved.reduce(
    (total, { line, product }) => total + product.price * line.quantity,
    0,
  );

  if (resolved.length === 0) {
    return (
      <div className="container-narrow py-(--space-section)">
        <h1 className="text-h1">{t("title")}</h1>
        <p className="text-muted-foreground mt-4">{t("empty")}</p>
        <Link
          href="/collections/nouveautes"
          className="bg-foreground text-background mt-(--space-8) inline-flex h-12 items-center rounded-sm px-8 text-sm font-medium transition-opacity hover:opacity-90"
        >
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-narrow py-(--space-section)">
      <h1 className="text-h1">{t("title")}</h1>

      <ul className="border-border divide-border mt-(--space-8) divide-y border-y">
        {resolved.map(({ line, product }) => (
          <li key={line.variantId} className="flex gap-4 py-5">
            <div className="bg-surface size-20 shrink-0" />

            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${product.slug}`}
                className="text-base hover:opacity-70"
              >
                {pick(product.name, locale)}
              </Link>
              <p className="text-muted-foreground mt-1 text-xs">
                {t("size")}: {line.size} · {t("color")}: {line.color}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="border-border flex items-center border">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(line.variantId, line.quantity - 1)
                    }
                    aria-label={`${t("quantity")} −`}
                    className="grid size-8 place-items-center transition-opacity hover:opacity-70"
                  >
                    <MinusIcon className="size-3.5" aria-hidden="true" />
                  </button>
                  <span className="w-8 text-center text-sm tabular-nums">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(line.variantId, line.quantity + 1)
                    }
                    aria-label={`${t("quantity")} +`}
                    className="grid size-8 place-items-center transition-opacity hover:opacity-70"
                  >
                    <PlusIcon className="size-3.5" aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => remove(line.variantId)}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
                >
                  <XIcon className="size-3.5" aria-hidden="true" />
                  {t("remove")}
                </button>
              </div>
            </div>

            <Price
              amount={product.price * line.quantity}
              locale={locale}
              className="text-sm"
            />
          </li>
        ))}
      </ul>

      <div className="mt-(--space-8) flex items-baseline justify-between">
        <span className="font-medium">{t("subtotal")}</span>
        <Price amount={subtotal} locale={locale} className="text-h5" />
      </div>

      <p className="text-muted-foreground mt-2 text-sm">{t("deliveryNote")}</p>

      <div className="mt-(--space-8) flex flex-col gap-3 sm:flex-row">
        <a
          href={buildWhatsAppCartLink(
            resolved.map(({ line, product }) => ({
              name: pick(product.name, locale),
              ref: product.ref,
              size: line.size,
              color: line.color,
              quantity: line.quantity,
              price: product.price,
            })),
            subtotal,
            locale,
          )}
          target="_blank"
          rel="noreferrer noopener"
          className="bg-foreground text-background inline-flex h-12 flex-1 items-center justify-center rounded-sm px-8 text-sm font-medium transition-opacity hover:opacity-90"
        >
          {t("checkoutWhatsapp")}
        </a>
        <Link
          href="/collections/nouveautes"
          className="border-foreground hover:bg-foreground hover:text-background inline-flex h-12 flex-1 items-center justify-center rounded-sm border px-8 text-sm font-medium transition-colors"
        >
          {t("continue")}
        </Link>
      </div>
    </div>
  );
}
