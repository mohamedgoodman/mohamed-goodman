"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Price } from "@/components/ui/price";
import { WhatsAppOrderButton } from "@/components/shop/whatsapp-button";
import { useCart } from "@/lib/cart/use-cart";
import { variantId } from "@/lib/cart/storage";
import { pick, type Product } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

/**
 * Product detail.
 *
 * Size is required before anything can be ordered — both "add to cart" and the
 * WhatsApp button. Sending "I'd like this hoodie" with no size just moves the
 * question to the shop owner, which is exactly the friction the WhatsApp flow
 * is supposed to remove.
 */
export function ProductDetail({ product }: { product: Product }) {
  const locale = useLocale();
  const t = useTranslations("pdp");
  const tProduct = useTranslations("product");
  const tBadges = useTranslations("badges");
  const { add } = useCart();

  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [added, setAdded] = useState(false);
  const [needsSize, setNeedsSize] = useState(false);

  const name = pick(product.name, locale);
  const image = product.images[0];

  function requireSize(): boolean {
    if (size) return true;
    setNeedsSize(true);
    document
      .getElementById("size-selector")
      ?.scrollIntoView({ block: "center" });
    return false;
  }

  function addToCart() {
    if (!requireSize()) return;
    add({
      variantId: variantId(product.slug, size!, color),
      slug: product.slug,
      size: size!,
      color,
      quantity: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="container-editorial py-(--space-section)">
      <div className="grid gap-(--space-8) lg:grid-cols-2 lg:gap-(--space-16)">
        <div className="bg-surface relative aspect-square w-full">
          {image?.present ? (
            <Image
              src={image.src}
              alt={name}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-contain p-6"
            />
          ) : (
            <span className="text-muted-foreground absolute inset-0 grid place-items-center text-sm">
              {tProduct("noImage")}
            </span>
          )}
          {product.badge ? (
            <span
              className={cn(
                "absolute start-3 top-3 px-2 py-1 text-[11px] leading-none font-medium uppercase",
                product.badge === "sale"
                  ? "bg-sale text-sale-foreground"
                  : "bg-foreground text-background",
              )}
            >
              {tBadges(product.badge)}
            </span>
          ) : null}
        </div>

        <div>
          <h1 className="text-h2">{name}</h1>
          <p className="text-muted-foreground mt-2 text-xs">
            {t("reference")} <bdi dir="ltr">{product.ref}</bdi>
          </p>

          <p className="mt-4">
            <Price
              amount={product.price}
              compareAt={product.compareAtPrice}
              locale={locale}
              className={cn(
                "text-h5",
                product.compareAtPrice && "text-sale font-medium",
              )}
            />
          </p>

          {product.colors.length > 0 ? (
            <fieldset className="mt-(--space-8)">
              <legend className="text-sm font-medium">
                {t("chooseColor")} — {color}
              </legend>
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setColor(c.name)}
                      aria-pressed={color === c.name}
                      aria-label={c.name}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className={cn(
                        "border-border size-8 rounded-full border",
                        color === c.name &&
                          "ring-foreground ring-1 ring-offset-2",
                      )}
                    />
                  </li>
                ))}
              </ul>
            </fieldset>
          ) : null}

          <fieldset id="size-selector" className="mt-(--space-8)">
            <legend className="text-sm font-medium">{t("chooseSize")}</legend>
            <ul className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const soldOut = product.soldOutSizes.includes(s);
                return (
                  <li key={s}>
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => {
                        setSize(s);
                        setNeedsSize(false);
                      }}
                      aria-pressed={size === s}
                      className={cn(
                        "min-w-12 border px-3 py-2 text-sm transition-colors",
                        soldOut
                          ? "border-border text-muted-foreground line-through"
                          : "border-foreground hover:bg-foreground hover:text-background",
                        size === s && "bg-foreground text-background",
                      )}
                    >
                      {s}
                      {soldOut ? (
                        <span className="sr-only"> — {t("soldOut")}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>

            {needsSize ? (
              <p role="alert" className="text-destructive mt-3 text-sm">
                {t("sizeRequired")}
              </p>
            ) : null}

            <Link
              href="/pages/size-guide"
              className="link-underline mt-3 inline-block text-sm"
            >
              {t("sizeGuide")}
            </Link>
          </fieldset>

          <div className="mt-(--space-8) flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={addToCart}
              className="bg-foreground text-background inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-sm px-8 text-sm font-medium transition-opacity hover:opacity-90"
            >
              {added ? (
                <CheckIcon className="size-4" aria-hidden="true" />
              ) : null}
              {added ? t("added") : t("addToCart")}
            </button>

            {/* Same gate as add-to-cart: no size, no message. */}
            <WhatsAppOrderButton
              className="flex-1"
              onBlocked={requireSize}
              blocked={!size}
              order={{
                product: {
                  name: product.name,
                  ref: product.ref,
                  price: product.price,
                },
                size: size ?? undefined,
                color,
              }}
            />
          </div>

          <dl className="divide-border border-border mt-(--space-12) divide-y border-t">
            {[
              ["description", product.description],
              ["material", product.material],
              ["care", product.care],
            ].map(([key, value]) => (
              <div key={key as string} className="py-4">
                <dt className="text-sm font-medium">{t(key as string)}</dt>
                <dd className="text-muted-foreground mt-1 text-sm">
                  {pick(value as never, locale)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
