"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/shop/product-card";
import type { Product } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

/**
 * Horizontal product rail. Takes a title, a link and a list — nothing about it
 * is specific to any one section.
 *
 * Scrolling is native CSS scroll-snap, no carousel library: it gets momentum,
 * accessibility and RTL from the platform.
 *
 * RTL is the part that usually breaks. In a right-to-left container, browsers
 * report `scrollLeft` as *negative* (0 at the right edge, decreasing as you
 * move left). Comparing raw scrollLeft against 0 therefore marks the wrong
 * arrow disabled. Everything below works in a direction-agnostic "distance
 * travelled from the start edge" space, computed once in `readEdges`.
 */
export function ProductCarousel({
  title,
  href,
  linkLabel,
  products,
  viewAllHref,
  className,
  priorityFirst = false,
}: {
  title: string;
  /** Where the section heading's link goes. */
  href: string;
  linkLabel: string;
  products: Product[];
  /** When set, a "view all" tile is appended after the last card. */
  viewAllHref?: string;
  className?: string;
  priorityFirst?: boolean;
}) {
  const t = useTranslations("carousel");
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const readEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    // Normalise across directions: `travelled` is always 0 at the start edge
    // and grows towards the end edge, whichever way that points on screen.
    const travelled = Math.abs(track.scrollLeft);
    const maximum = track.scrollWidth - track.clientWidth;

    setAtStart(travelled <= 1);
    setAtEnd(travelled >= maximum - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    readEdges();
    track.addEventListener("scroll", readEdges, { passive: true });

    const observer = new ResizeObserver(readEdges);
    observer.observe(track);

    return () => {
      track.removeEventListener("scroll", readEdges);
      observer.disconnect();
    };
  }, [readEdges, products.length]);

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;

    const isRtl = getComputedStyle(track).direction === "rtl";
    const card = track.querySelector("li");
    const step = card
      ? card.getBoundingClientRect().width * 1.5
      : track.clientWidth * 0.8;

    // `direction` is logical (1 = towards the end). In RTL, moving towards the
    // end means decreasing scrollLeft, hence the flip.
    track.scrollBy({
      left: step * direction * (isRtl ? -1 : 1),
      behavior: "smooth",
    });
  }, []);

  function onKeyDown(event: React.KeyboardEvent) {
    // Arrow keys are physical, not logical: in RTL, "left" still means the
    // key on the left of the keyboard, which moves towards the end.
    const isRtl = getComputedStyle(event.currentTarget).direction === "rtl";
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByPage(isRtl ? -1 : 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByPage(isRtl ? 1 : -1);
    }
  }

  if (products.length === 0) return null;

  return (
    <section className={cn("section-y", className)}>
      <div className="container-editorial flex items-baseline justify-between gap-6">
        <h2 className="text-h2">{title}</h2>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={href}
            className="link-underline text-sm whitespace-nowrap"
          >
            {linkLabel}
          </Link>

          {/* Arrows are a desktop affordance; on touch the cut-off card is the
              affordance, and a tap target that duplicates swiping just eats
              space. */}
          <div className="ms-4 hidden items-center gap-1 lg:flex">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              disabled={atStart}
              aria-label={t("previous")}
              className="border-border hover:border-foreground grid size-9 place-items-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeftIcon className="rtl-flip size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              disabled={atEnd}
              aria-label={t("next")}
              className="border-border hover:border-foreground grid size-9 place-items-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowRightIcon className="rtl-flip size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={trackRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={title}
        className={cn(
          "scroll-row mt-(--space-8) gap-4 px-(--gutter) pb-2",
          // Without this the first card snaps its edge to the *border* box,
          // so the track sits scrolled by one gutter at rest and the "previous"
          // arrow never reads as disabled.
          "[scroll-padding-inline-start:var(--gutter)]",
          // Cards peek so it's obvious the row scrolls: ~1.4 per screen on a
          // phone, 2.5 at tablet, 4 from desktop.
          // Full-bleed on phones so a card is cut off at the edge; from xl the
          // track lines up with the container so the cards sit under the
          // heading rather than running to the window edge.
          "xl:mx-auto xl:max-w-(--container)",
          // Card widths are chosen so a whole number of cards *plus* the cut
          // one fits: ~1.4 per screen on a phone, ~2.5 at tablet, exactly 4
          // from 1280 up. The min() keeps the desktop maths honest between
          // 1280 and the container's 1440 cap.
          "[&>li]:w-[68vw] sm:[&>li]:w-[44vw] md:[&>li]:w-[38vw] lg:[&>li]:w-[30vw]",
          "xl:[&>li]:w-[calc((min(100vw,var(--container))-2*var(--gutter)-3*1rem)/4)]",
          "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-4",
        )}
      >
        {products.map((product, index) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              priority={priorityFirst && index === 0}
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 36vw, 68vw"
            />
          </li>
        ))}

        {viewAllHref ? (
          <li>
            <Link
              href={viewAllHref}
              className="border-border hover:border-foreground flex aspect-3/4 w-full flex-col items-center justify-center rounded-xs border border-dashed text-center transition-colors"
            >
              <span className="text-h5 font-display">{t("viewAll")}</span>
              <span className="text-muted-foreground mt-2 text-xs">
                {t("viewAllCount", { count: products.length })}
              </span>
            </Link>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
