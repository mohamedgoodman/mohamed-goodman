"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { mainNav } from "@/data/navigation";
import { cn } from "@/lib/utils";

/**
 * Desktop navigation: five plain links, centred.
 *
 * No mega-menu. With five categories there is nothing to reveal that a click
 * doesn't already get you to faster, and the panel was the main reason the old
 * header felt crowded. Sub-collections live in the footer and the mobile
 * drawer, where there's room for them.
 */
export function MainNav({
  className,
  populatedCollections,
}: {
  className?: string;
  populatedCollections: string[];
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  // Never link to a category with nothing in it.
  const items = mainNav.filter((item) =>
    populatedCollections.some((handle) => item.href.endsWith(`/${handle}`)),
  );

  return (
    <nav className={cn("items-center", className)} aria-label={t("openMenu")}>
      <ul className="flex items-center gap-6 xl:gap-8">
        {items.map((item) => {
          const current = pathname.startsWith(item.href);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "relative block py-1 text-sm whitespace-nowrap transition-opacity hover:opacity-70",
                  // Promos is the one place --sale is allowed in the chrome.
                  item.highlight && "text-sale font-medium",
                  current &&
                    "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-current",
                )}
              >
                {t(`items.${item.key}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
