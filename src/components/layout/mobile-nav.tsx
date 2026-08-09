"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { footerNav, mainNav } from "@/data/navigation";
import { brand } from "@/data/brand";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Mobile drawer navigation. Slides from the inline-start edge, so it comes
 * from the left in French/English and from the right in Arabic.
 *
 * Sections are native <details> — free keyboard support, and they still open
 * if hydration is delayed on a slow connection.
 */
export function MobileNav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t("openMenu")}
        className="grid size-9 place-items-center rounded-xs transition-opacity hover:opacity-70 xl:hidden"
      >
        <MenuIcon className="size-5" aria-hidden="true" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className={cn(
          "bg-background w-[86%] gap-0 p-0 sm:max-w-sm",
          // Radix's "left" side is physically left; mirror it for Arabic so
          // the drawer enters from the same edge as the hamburger.
          "rtl:right-0 rtl:left-auto rtl:border-r-0 rtl:border-l",
          "rtl:data-[state=closed]:slide-out-to-right rtl:data-[state=open]:slide-in-from-right",
          // The sheet ships its own close button; ours sits in the header row.
          "[&>button:last-child]:hidden",
        )}
      >
        <div className="border-border flex h-(--header-h) items-center justify-between border-b px-(--gutter)">
          <SheetTitle className="font-serif text-base tracking-[0.2em] uppercase">
            {brand.wordmark}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t("openMenu")}
          </SheetDescription>
          <button
            type="button"
            onClick={close}
            aria-label={t("closeMenu")}
            className="grid size-9 place-items-center rounded-xs transition-opacity hover:opacity-70"
          >
            <XIcon className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain pb-(--space-16)">
          <ul>
            {mainNav.map((item) => (
              <li key={item.key} className="border-border border-b">
                <details className="group">
                  <summary
                    className={cn(
                      "text-h5 flex cursor-pointer list-none items-center justify-between px-(--gutter) py-4 font-serif",
                      item.highlight && "text-sale",
                    )}
                  >
                    {t(`items.${item.key}`)}
                    <ChevronDownIcon
                      className="text-muted-foreground size-4 transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>

                  <div className="px-(--gutter) pb-6">
                    {item.groups.map((group) => (
                      <div key={group.key} className="mb-5 last:mb-0">
                        <h3 className="eyebrow">{t(`groups.${group.key}`)}</h3>
                        <ul className="mt-2.5 space-y-2.5">
                          {group.links.map((link) => (
                            <li key={`${group.key}-${link.key}`}>
                              <Link
                                href={link.href}
                                onClick={close}
                                className="text-subtle-foreground text-md block"
                              >
                                {t(`links.${link.key}`)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    <div className="scroll-row -mx-(--gutter) mt-5 gap-3 px-(--gutter)">
                      {item.tiles.map((tile) => (
                        <Link
                          key={tile.key}
                          href={tile.href}
                          onClick={close}
                          className="w-40"
                        >
                          <div className="bg-surface-3 relative aspect-4/5 overflow-hidden rounded-xs">
                            <Image
                              src={tile.image}
                              alt=""
                              fill
                              sizes="160px"
                              className="object-cover"
                            />
                          </div>
                          <p className="mt-2 text-sm font-medium">
                            {t(`tiles.${tile.key}.title`)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>

          <ul className="mt-6 space-y-3 px-(--gutter)">
            {(footerNav.find((c) => c.key === "help")?.links ?? []).map(
              (link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="text-muted-foreground text-sm"
                  >
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <div className="border-border mt-6 border-t px-(--gutter) pt-5">
            <LocaleSwitcher />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
