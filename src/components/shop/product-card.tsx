"use client";

import { useState } from "react";
import Image from "next/image";
import { HeartIcon, StarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Price } from "@/components/ui/price";
import { pick, type Product } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

/** How many swatches fit before we collapse the rest into "+N". */
const MAX_SWATCHES = 4;

/**
 * Product card.
 *
 * Two rules worth stating because they're easy to break later:
 *
 * 1. Ratings render only when the spreadsheet actually supplies them. There is
 *    no default, no placeholder, no "4.5 (0)". A fabricated review count is a
 *    lie about other customers.
 * 2. The image sits on --surface with object-contain, not cover. Product shots
 *    arrive at inconsistent crops and backgrounds; containing them on a shared
 *    grey makes the grid look deliberate instead of ragged.
 */
export function ProductCard({
  product,
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
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [wished, setWished] = useState(false);

  const name = pick(product.name, locale);

  // A colour "has its own photo" when the sheet listed more images than the
  // primary + hover pair; index them in colour order.
  const colorIndex = activeColor
    ? product.colors.findIndex((c) => c.id === activeColor)
    : -1;
  const colorImage =
    colorIndex > 0 ? product.images[colorIndex + 1] : undefined;

  const primary = colorImage ?? product.images[0];
  const hoverImage = product.images[1];
  const canSwap = Boolean(hoverImage?.present) && !colorImage;
  const shown = hovered && canSwap ? hoverImage : primary;

  const extraSwatches = product.colors.length - MAX_SWATCHES;

  return (
    <article
      className={cn("group/card flex flex-col", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="bg-surface relative aspect-square w-full overflow-hidden">
        <Link
          href={`/products/${product.slug}`}
          className="focus-visible:outline-ring absolute inset-0"
        >
          <span className="sr-only">{name}</span>
          {shown?.present ? (
            <Image
              src={shown.src}
              alt={name}
              fill
              sizes={sizes}
              priority={priority}
              className="object-contain p-4 transition-opacity duration-300"
            />
          ) : (
            <span className="text-muted-foreground text-2xs absolute inset-0 grid place-items-center">
              {t("noImage")}
            </span>
          )}
        </Link>

        {/* One badge maximum. No badge is a normal state. */}
        {product.badge ? (
          <span
            className={cn(
              "pointer-events-none absolute start-2 top-2 px-2 py-1 text-[11px] leading-none font-medium uppercase",
              product.badge === "sale" && "bg-sale text-sale-foreground",
              product.badge === "new" && "bg-foreground text-background",
              product.badge !== "sale" &&
                product.badge !== "new" &&
                "bg-surface text-foreground border-border border",
            )}
          >
            {tBadges(product.badge)}
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => setWished((v) => !v)}
          aria-pressed={wished}
          aria-label={t("wishlist", { name })}
          className="absolute end-2 top-2 grid size-8 place-items-center transition-opacity hover:opacity-70"
        >
          <HeartIcon
            className={cn("size-4", wished && "fill-current")}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="truncate text-base leading-snug">
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
              product.compareAtPrice && "text-sale font-medium",
            )}
          />
        </p>

        {product.colors.length > 0 ? (
          <ul className="mt-2.5 flex items-center gap-1.5">
            {product.colors.slice(0, MAX_SWATCHES).map((color) => (
              <li key={color.id}>
                <button
                  type="button"
                  onClick={() =>
                    setActiveColor((current) =>
                      current === color.id ? null : color.id,
                    )
                  }
                  aria-pressed={activeColor === color.id}
                  aria-label={color.name}
                  title={color.name}
                  style={{ backgroundColor: color.hex }}
                  className={cn(
                    "border-border size-4 rounded-full border transition-shadow",
                    activeColor === color.id &&
                      "ring-foreground ring-1 ring-offset-1",
                  )}
                />
              </li>
            ))}
            {extraSwatches > 0 ? (
              <li className="text-muted-foreground text-2xs">
                +{extraSwatches}
              </li>
            ) : null}
          </ul>
        ) : null}

        {product.sizes.length > 0 ? (
          <ul className="mt-2.5 flex flex-wrap items-center gap-1">
            {product.sizes.map((size) => {
              const soldOut = product.soldOutSizes.includes(size);
              return (
                <li
                  key={size}
                  className={cn(
                    "border px-1.5 py-0.5 text-[11px] leading-none",
                    soldOut
                      ? "border-border text-muted-foreground relative overflow-hidden"
                      : "border-foreground text-foreground",
                  )}
                >
                  {size}
                  {soldOut ? (
                    <span
                      aria-hidden="true"
                      className="bg-border absolute inset-0 m-auto h-px w-[140%] origin-center -rotate-[20deg]"
                    />
                  ) : null}
                  {soldOut ? (
                    <span className="sr-only">{t("soldOut")}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        {/* Only when the sheet supplied both a value and a count. */}
        {product.rating && product.rating.count > 0 ? (
          <p className="mt-2 flex items-center gap-1">
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
              <bdi dir="ltr">{product.rating.value.toFixed(1)}</bdi> (
              <bdi dir="ltr">{product.rating.count}</bdi>)
            </span>
            <span className="sr-only">
              {t("ratingLabel", {
                value: product.rating.value,
                count: product.rating.count,
              })}
            </span>
          </p>
        ) : null}
      </div>
    </article>
  );
}
