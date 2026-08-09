"use client";

import { useState } from "react";
import Image from "next/image";
import { StarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Price } from "@/components/ui/price";
import { FREE_SHIPPING_THRESHOLD } from "@/data/morocco";
import { pick, type Product } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

/**
 * The product card.
 *
 * Image swaps to the second photo on hover — but only when the sheet actually
 * listed a second image, otherwise hovering makes the card flicker to nothing.
 * Stars are hidden entirely when the sheet has no rating rather than showing
 * an empty five-star row, which reads as "rated zero".
 */
export function ProductCard({
  product,
  /** Hint for next/image; the carousel and the grid size cards differently. */
  sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 38vw, 70vw",
  priority = false,
  className,
}: {
  product: Product;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("product");
  const tBadges = useTranslations("badges");
  const [hovered, setHovered] = useState(false);

  const name = pick(product.name, locale);
  const primary = product.images[0];
  const secondary = product.images[1];
  const canSwap = Boolean(secondary?.present);
  const shown = hovered && canSwap ? secondary : primary;

  const freeShipping = product.price >= FREE_SHIPPING_THRESHOLD;

  return (
    <article
      className={cn("group/card flex flex-col", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={`/products/${product.slug}`}
        className="focus-visible:outline-ring block"
      >
        <div className="bg-surface-3 relative aspect-3/4 w-full overflow-hidden rounded-xs">
          {shown?.present ? (
            <Image
              src={shown.src}
              alt={name}
              fill
              sizes={sizes}
              priority={priority}
              className="ease-editorial object-cover transition-opacity duration-500"
            />
          ) : (
            // No usable photo yet: a calm placeholder, never a broken image.
            <div className="text-muted-foreground text-2xs absolute inset-0 grid place-items-center">
              {t("noImage")}
            </div>
          )}

          {product.badge ? (
            <span
              className={cn(
                "text-2xs absolute start-2 top-2 rounded-xs px-2 py-1 font-medium uppercase",
                product.badge === "sale"
                  ? "bg-sale text-sale-foreground"
                  : "bg-background/90 text-foreground",
              )}
            >
              {tBadges(product.badge)}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        {/* Swatches are indicative only — choosing a colour happens on the
            product page, so these are presentational and not focusable. */}
        {product.colors.length > 0 ? (
          <ul aria-hidden="true" className="mb-2 flex items-center gap-1.5">
            {product.colors.slice(0, 5).map((color) => (
              <li
                key={color.id}
                title={color.name}
                style={{ backgroundColor: color.hex }}
                className="border-border size-3 rounded-full border"
              />
            ))}
          </ul>
        ) : null}

        <h3 className="font-sans text-base leading-snug">
          <Link href={`/products/${product.slug}`} className="hover:opacity-70">
            {name}
          </Link>
        </h3>

        <p className="mt-1">
          <Price
            amount={product.price}
            compareAt={product.compareAtPrice}
            locale={locale}
            className={cn(
              "text-sm",
              product.compareAtPrice ? "text-sale font-medium" : "",
            )}
          />
        </p>

        <p className="text-muted-foreground mt-1 text-xs">
          {product.colors.length > 0
            ? t("colorCount", { count: product.colors.length })
            : null}
        </p>

        {product.rating ? (
          <p className="mt-1 flex items-center gap-1">
            <span className="flex" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <StarIcon
                  key={i}
                  className={cn(
                    "size-3",
                    i < Math.round(product.rating!.value)
                      ? "fill-current"
                      : "text-muted-foreground/40",
                  )}
                />
              ))}
            </span>
            <span className="text-muted-foreground text-2xs tabular-nums">
              <bdi dir="ltr">{product.rating.value.toFixed(1)}</bdi>
              {product.rating.count > 0 ? (
                <>
                  {" "}
                  (<bdi dir="ltr">{product.rating.count}</bdi>)
                </>
              ) : null}
            </span>
            <span className="sr-only">
              {t("ratingLabel", {
                value: product.rating.value,
                count: product.rating.count,
              })}
            </span>
          </p>
        ) : null}

        {/* Delivery cost belongs on the card, not only at checkout — it's the
            number that decides whether a hesitant buyer clicks through. */}
        {freeShipping ? (
          <p className="text-success text-2xs mt-2">{t("freeShipping")}</p>
        ) : null}
      </div>
    </article>
  );
}
