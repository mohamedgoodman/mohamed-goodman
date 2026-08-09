"use client";

import { useEffect, useState } from "react";
import { PhoneIcon, ShoppingBagIcon, UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { Wordmark } from "@/components/layout/wordmark";
import { WhatsAppContactLink } from "@/components/shop/whatsapp-button";
import { brand } from "@/data/brand";
import { useCartCount } from "@/lib/cart/use-cart-count";
import { cn } from "@/lib/utils";

/**
 * Sticky site header.
 *
 * Pages that open on full-bleed photography render `<HeaderHeroSentinel />` as
 * their first element; while that sentinel is in view the header floats
 * transparently over the image, and it turns solid the moment it scrolls past.
 * Pages without a sentinel are solid from the start, so this stays a per-page
 * decision without the layout needing to know which page it's rendering.
 */
export function Header() {
  const t = useTranslations("common");
  const tNav = useTranslations("nav");
  const tCart = useTranslations("cart");
  const pathname = usePathname();
  const count = useCartCount();

  const [overHero, setOverHero] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;

    // Wait a frame: on a route change the new page's DOM (and therefore its
    // sentinel, or absence of one) isn't in place when this effect first runs.
    const frame = requestAnimationFrame(() => {
      const sentinel = document.getElementById("header-hero-sentinel");
      if (!sentinel) {
        setOverHero(false);
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => setOverHero(entry.isIntersecting),
        { rootMargin: "-1px 0px 0px 0px", threshold: 0 },
      );
      observer.observe(sentinel);
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [pathname]);

  return (
    <header
      data-over-hero={overHero || undefined}
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-300 ease-out",
        // Over a hero the header floats transparent — but the moment a
        // mega-menu or the search panel opens beneath it, it has to become
        // solid or its white labels sit on the panel's light background.
        overHero
          ? "text-on-image has-[[data-header-panel]]:bg-background has-[[data-header-panel]]:text-foreground bg-transparent"
          : "bg-background/95 border-border border-b backdrop-blur-sm",
      )}
    >
      <div className="container-editorial relative flex h-(--header-h) items-center justify-between lg:h-(--header-h-lg) xl:grid xl:grid-cols-[1fr_auto_1fr]">
        {/* start: menu (mobile) / primary nav (desktop) */}
        <div className="flex h-full items-center justify-start">
          <MobileNav />
          <MegaMenu className="hidden xl:block" />
        </div>

        {/* Centre: two layouts, because the two constraints differ.
            Below xl there is no nav, but the icon counts on each side are
            unequal — a three-column grid would push the logo visibly off
            centre, so it is absolutely centred instead.
            From xl the mega-menu is present and the real risk is the nav
            running under the logo, so the grid comes back and reserves the
            space. (Centring is symmetric, so the physical translate below xl
            is correct in RTL too.) */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center xl:pointer-events-auto xl:static xl:translate-x-0 xl:justify-center">
          <Wordmark className="pointer-events-auto" />
        </div>

        {/* end: utilities */}
        <div className="flex h-full items-center justify-end gap-0.5 sm:gap-1">
          {/* A visible phone number on desktop does more for trust here than
              any badge — plenty of customers will call before they buy. */}
          <a
            href={`tel:${brand.phone}`}
            dir="ltr"
            className="me-3 hidden items-center gap-1.5 text-sm tabular-nums transition-opacity hover:opacity-70 xl:flex"
          >
            <PhoneIcon className="size-4" aria-hidden="true" />
            {brand.phoneDisplay}
          </a>

          {/* On phones, WhatsApp replaces it: nobody types a number they can
              tap through to a chat. */}
          <WhatsAppContactLink className="grid size-9 place-items-center xl:hidden" />

          <LocaleSwitcher className="me-1 hidden xl:flex" />
          <SearchOverlay />

          <Link
            href="/orders/track"
            aria-label={tNav("links.orderTracking")}
            className="hidden size-9 place-items-center rounded-xs transition-opacity hover:opacity-70 sm:grid"
          >
            <UserIcon className="size-[1.15rem]" aria-hidden="true" />
          </Link>

          <Link
            href="/cart"
            className="relative grid size-9 place-items-center rounded-xs transition-opacity hover:opacity-70"
          >
            <ShoppingBagIcon className="size-[1.15rem]" aria-hidden="true" />
            {count > 0 ? (
              <span
                aria-hidden="true"
                className="bg-sale text-sale-foreground text-2xs absolute end-0.5 top-1 grid min-w-4 place-items-center rounded-full px-1 leading-4 font-medium"
              >
                {count}
              </span>
            ) : null}
            <span className="sr-only">
              {t("cart")} — {tCart("itemCount", { count })}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/**
 * Marks the region a page's hero occupies. Render it as the first child of a
 * page whose header should float over the image.
 */
export function HeaderHeroSentinel() {
  return (
    <div
      id="header-hero-sentinel"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
    />
  );
}
