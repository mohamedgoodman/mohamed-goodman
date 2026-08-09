"use client";

import { useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Wordmark } from "@/components/layout/wordmark";
import { footerNav, mainNav } from "@/data/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Mobile drawer. Slides from the inline-start edge, so it comes from the left
 * in French/English and from the right in Arabic.
 *
 * Flat list, no accordions: with five categories, a disclosure triangle is one
 * more tap between someone and the sneakers. Sub-collections follow as a
 * secondary list.
 */
export function MobileNav({
  populatedCollections,
}: {
  populatedCollections: string[];
}) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const isLive = (href: string) =>
    !href.startsWith("/collections/") ||
    populatedCollections.some((handle) => href.endsWith(`/${handle}`));

  const items = mainNav.filter((item) => isLive(item.href));
  const secondary = footerNav
    .filter((column) => column.key !== "shop")
    .map((column) => ({
      ...column,
      links: column.links.filter((l) => isLive(l.href)),
    }))
    .filter((column) => column.links.length > 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t("openMenu")}
        className="-ms-2 grid size-9 place-items-center transition-opacity hover:opacity-70 lg:hidden"
      >
        <MenuIcon className="size-5" aria-hidden="true" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className={cn(
          "bg-background w-[86%] gap-0 p-0 sm:max-w-sm",
          // Radix's "left" side is physically left; mirror it for Arabic so
          // the drawer enters from the same edge as the trigger.
          "rtl:right-0 rtl:left-auto rtl:border-r-0 rtl:border-l",
          "rtl:data-[state=closed]:slide-out-to-right rtl:data-[state=open]:slide-in-from-right",
          "[&>button:last-child]:hidden",
        )}
      >
        <div className="border-border flex h-(--header-h) items-center justify-between border-b px-(--gutter)">
          <SheetTitle asChild>
            <span>
              <Wordmark />
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t("openMenu")}
          </SheetDescription>
          <button
            type="button"
            onClick={close}
            aria-label={t("closeMenu")}
            className="-me-2 grid size-9 place-items-center transition-opacity hover:opacity-70"
          >
            <XIcon className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain pb-(--space-16)">
          <ul>
            {items.map((item) => (
              <li key={item.key} className="border-border border-b">
                <Link
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "text-h5 font-display block px-(--gutter) py-4 font-bold",
                    item.highlight && "text-sale",
                  )}
                >
                  {t(`items.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>

          {secondary.map((column) => (
            <ul key={column.key} className="mt-6 space-y-3 px-(--gutter)">
              {column.links.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="text-muted-foreground text-sm"
                  >
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          ))}

          <div className="border-border mt-6 border-t px-(--gutter) pt-5">
            <LocaleSwitcher />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
