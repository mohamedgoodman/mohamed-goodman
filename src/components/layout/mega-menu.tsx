"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { mainNav, type NavItem } from "@/data/navigation";
import { cn } from "@/lib/utils";

/**
 * Desktop navigation with a full-width mega-menu panel.
 *
 * Opens on hover and on keyboard focus; closes on Escape, on pointer leaving
 * the whole nav region, and when focus moves outside it. Each trigger is a
 * real button with aria-expanded, and the panel it controls is a plain list of
 * links — no roving tabindex needed, Tab walks it naturally.
 */
export function MegaMenu({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // Small grace period so diagonal mouse travel into the panel doesn't close it.
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpenKey(null), 120);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  useEffect(() => {
    if (!openKey) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenKey(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openKey]);

  const active = mainNav.find((item) => item.key === openKey) ?? null;

  return (
    <div
      ref={regionRef}
      className={cn("h-full", className)}
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
      onBlur={(event) => {
        if (!regionRef.current?.contains(event.relatedTarget as Node | null)) {
          setOpenKey(null);
        }
      }}
    >
      <ul className="flex h-full items-center gap-4 pe-6">
        {mainNav.map((item) => (
          <li key={item.key} className="h-full">
            <button
              type="button"
              aria-expanded={openKey === item.key}
              aria-controls={`megamenu-${item.key}`}
              onMouseEnter={() => {
                cancelClose();
                setOpenKey(item.key);
              }}
              onFocus={() => setOpenKey(item.key)}
              onClick={() =>
                setOpenKey((k) => (k === item.key ? null : item.key))
              }
              className={cn(
                "relative flex h-full items-center text-xs tracking-wide whitespace-nowrap uppercase transition-opacity hover:opacity-70",
                item.highlight && "text-sale",
              )}
            >
              {t(`items.${item.key}`)}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 bottom-0 h-px origin-center scale-x-0 bg-current transition-transform duration-200",
                  openKey === item.key && "scale-x-100",
                )}
              />
            </button>
          </li>
        ))}
      </ul>

      {active ? (
        <MegaMenuPanel item={active} onNavigate={() => setOpenKey(null)} />
      ) : null}
    </div>
  );
}

function MegaMenuPanel({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const t = useTranslations("nav");

  return (
    <div
      id={`megamenu-${item.key}`}
      // `data-header-panel` tells the header to drop its transparent
      // over-hero treatment while this panel is open.
      data-header-panel=""
      className="bg-surface text-foreground border-border animate-in fade-in slide-in-from-top-1 absolute inset-x-0 top-full border-b shadow-md duration-200"
    >
      <div className="container-editorial grid grid-cols-12 gap-8 py-10">
        <div className="col-span-7 grid grid-cols-3 gap-8">
          {item.groups.map((group) => (
            <div key={group.key}>
              <h3 className="eyebrow">{t(`groups.${group.key}`)}</h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={`${group.key}-${link.key}`}>
                    <Link
                      href={link.href}
                      onClick={onNavigate}
                      className="text-subtle-foreground hover:text-foreground text-base transition-colors"
                    >
                      {t(`links.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="col-span-5 grid grid-cols-2 gap-5">
          {item.tiles.map((tile) => (
            <Link
              key={tile.key}
              href={tile.href}
              onClick={onNavigate}
              className="group block"
            >
              <div className="bg-surface-3 relative aspect-4/5 overflow-hidden rounded-xs">
                <Image
                  src={tile.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20vw, 0px"
                  className="ease-editorial object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-3 text-sm font-medium">
                {t(`tiles.${tile.key}.title`)}
              </p>
              <p className="text-muted-foreground text-xs">
                {t(`tiles.${tile.key}.caption`)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
