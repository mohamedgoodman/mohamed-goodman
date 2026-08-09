"use client";

import { useEffect, useState } from "react";
import { ShoppingBagIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { Wordmark } from "@/components/layout/wordmark";
import { WhatsAppContactLink } from "@/components/shop/whatsapp-button";
import { useCartCount } from "@/lib/cart/use-cart-count";
import { cn } from "@/lib/utils";

/**
 * Sticky header: wordmark left, nav centre, three actions right.
 *
 * The previous version carried nav, a centred wordmark, a phone number, three
 * language codes and three icons in one row — too much to scan. Everything
 * that isn't shopping (language, phone) is now demoted: language to a
 * dropdown, phone into the trust strip and footer where it has room to be a
 * real, tappable number.
 *
 * Pages that open on a full-bleed hero render `<HeaderHeroSentinel />` first;
 * while it's in view the header floats transparent over the image and turns
 * solid the moment it scrolls past.
 */
export function Header() {
  const t = useTranslations("common");
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
        // mega-menu or the search panel opens beneath it, it goes solid or its
        // white labels would sit on the panel's light background.
        overHero
          ? "text-on-image has-[[data-header-panel]]:bg-background has-[[data-header-panel]]:text-foreground bg-transparent"
          : "bg-background border-border border-b",
      )}
    >
      <div className="container-editorial relative flex h-(--header-h) items-center gap-4 lg:h-(--header-h-lg)">
        {/* start: wordmark, with the drawer trigger beside it on phones */}
        <div className="flex items-center gap-1">
          <MobileNav />
          <Wordmark />
        </div>

        {/* centre: five items, desktop only */}
        <MainNav className="hidden flex-1 justify-center lg:flex" />

        {/* end: search, WhatsApp, cart */}
        <div className="ms-auto flex items-center gap-0.5 sm:gap-1 lg:ms-0">
          <LocaleSwitcher className="me-1 hidden sm:block" />

          <SearchOverlay />

          <WhatsAppContactLink className="grid size-9 place-items-center" />

          <Link
            href="/cart"
            className="relative grid size-9 place-items-center transition-opacity hover:opacity-70"
          >
            <ShoppingBagIcon className="size-[1.15rem]" aria-hidden="true" />
            {count > 0 ? (
              <span
                aria-hidden="true"
                className="bg-foreground text-background text-2xs absolute end-0.5 top-1 grid min-w-4 place-items-center rounded-full px-1 leading-4 font-medium"
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
