"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { StreakChip, XpChip } from "@/components/visual/stat-chips";
import { CHALLENGE_META } from "@/lib/learning/levels";
import { useT } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useAppState();
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const primary = NAV_ITEMS.filter((item) => item.primary);
  const dueCount = state.reviewCounts.dueNow;
  const initials = state.user.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-dvh">
      {/* ---------------------------------------------------------------- */}
      {/* Desktop: a floating glass panel, not a wall attached to the edge   */}
      {/* ---------------------------------------------------------------- */}
      <aside className="fixed inset-y-4 start-4 z-40 hidden w-60 flex-col rounded-3xl border border-border-strong bg-surface/70 shadow-[var(--shadow-lg)] backdrop-blur-2xl lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-70"
          style={{
            background:
              "radial-gradient(120% 45% at 50% 0%, rgba(124,58,237,0.20), rgba(124,58,237,0) 70%)",
          }}
        />
        <div className="relative flex h-16 items-center gap-2.5 px-5">
          <Logo />
        </div>
        <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 pb-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              label={t.nav[item.labelKey]}
              active={isActive(pathname, item.href)}
              badge={item.href === "/review" && dueCount > 0 ? dueCount : undefined}
            />
          ))}
        </nav>
        <div className="relative space-y-3 border-t border-border p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <StreakChip days={state.streak.current} compact />
            <XpChip xp={state.progress.xpTotal} compact />
          </div>
          <div className="flex items-center justify-between gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut} aria-label={t.nav.signOut} title={t.nav.signOut}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* Mobile header                                                     */}
      {/* ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 lg:hidden">
        <div className="flex h-14 items-center justify-between gap-2 border-b border-border bg-bg/80 px-4 backdrop-blur-xl">
          <Link href="/dashboard" className="-my-1 flex min-h-11 items-center gap-2 py-1">
            <Logo compact />
          </Link>
          <div className="flex items-center gap-1.5">
            <StreakChip days={state.streak.current} compact />
            <XpChip xp={state.progress.xpTotal} compact />
            <button
              onClick={() => setMenuOpen(true)}
              aria-label={t.nav.openMenu}
              className="press grid size-9 place-items-center rounded-xl border border-border-strong bg-surface-2/70 text-muted"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
        <GradientRule />
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Desktop header                                                    */}
      {/* ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-30 hidden bg-bg/85 backdrop-blur-xl lg:block lg:ps-[17.5rem]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
          <p className="text-sm text-muted">
            {t.dashboard.challengeLevel} {state.profile.challengeLevel} ·{" "}
            <span className="text-text">
              {t.content.challenge[state.profile.challengeLevel].label}
            </span>
          </p>
          <div className="flex items-center gap-2.5">
            <StreakChip days={state.streak.current} />
            <XpChip xp={state.progress.xpTotal} />
            <Link
              href="/review"
              aria-label={dueCount > 0 ? `${dueCount} · ${t.nav.notifications}` : t.nav.notifications}
              className="press relative grid size-10 place-items-center rounded-xl border border-border-strong bg-surface-2/70 text-muted transition-colors hover:text-text"
            >
              <Bell className="size-4" />
              {dueCount > 0 ? (
                <span className="absolute -top-1 -end-1 grid min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]">
                  {dueCount > 9 ? "9+" : dueCount}
                </span>
              ) : null}
            </Link>
            <Link href="/settings" aria-label={t.nav.settings} title={state.user.name}>
              <Avatar initials={initials} />
            </Link>
          </div>
        </div>
        <GradientRule />
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Content                                                           */}
      {/* ---------------------------------------------------------------- */}
      <main className="scene pb-28 lg:pb-12 lg:ps-[17.5rem]">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-7">{children}</div>
      </main>

      {/* ---------------------------------------------------------------- */}
      {/* Mobile slide-over                                                 */}
      {/* ---------------------------------------------------------------- */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="animate-fade absolute inset-0 bg-[#04060f]/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label={t.common.close}
          />
          <div className="animate-in-up absolute inset-y-0 end-0 flex w-[17rem] flex-col border-s border-border-strong bg-surface/90 shadow-[var(--shadow-lg)] backdrop-blur-2xl">
            <div className="flex h-14 items-center justify-between px-4">
              <Avatar initials={initials} size="sm" />
              <span className="min-w-0 flex-1 truncate px-3 text-sm font-medium">
                {state.user.name}
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label={t.common.close}
                className="press grid size-9 place-items-center rounded-xl border border-border-strong bg-surface-2/70 text-muted"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  label={t.nav[item.labelKey]}
                  active={isActive(pathname, item.href)}
                  onClick={() => setMenuOpen(false)}
                  badge={item.href === "/review" && dueCount > 0 ? dueCount : undefined}
                />
              ))}
            </nav>
            <div className="flex items-center justify-between gap-2 border-t border-border p-4">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="size-4" />
                {t.nav.signOut}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Mobile bottom navigation — the sidebar's phone form               */}
      {/* ---------------------------------------------------------------- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="pb-safe mx-3 mb-3 rounded-2xl border border-border-strong bg-surface/85 px-1.5 py-1.5 shadow-[var(--shadow-lg)] backdrop-blur-2xl">
          <div className="flex">
            {primary.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10.5px] font-medium transition-colors",
                    active ? "text-white" : "text-dim",
                  )}
                >
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-xl [background:var(--grad-brand)] opacity-95 shadow-[0_4px_16px_rgba(124,58,237,0.45)]"
                    />
                  ) : null}
                  <span className="relative flex flex-col items-center gap-1">
                    <Icon className="size-[18px]" />
                    {t.nav[item.labelKey]}
                  </span>
                  {item.href === "/review" && dueCount > 0 ? (
                    <span className="absolute top-0.5 end-1/4 size-1.5 rounded-full bg-danger shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

function Logo({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 font-semibold">
      <span
        className={cn(
          "grid place-items-center rounded-xl text-white shadow-[0_4px_16px_rgba(124,58,237,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]",
          "[background:var(--grad-brand)]",
          compact ? "size-8 text-[13px]" : "size-9 text-sm",
        )}
      >
        EJ
      </span>
      <span className={cn(compact && "text-[15px]")}>English Journey</span>
    </span>
  );
}

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full p-[2px]",
        "[background:var(--grad-brand-bright)] shadow-[0_0_14px_rgba(124,58,237,0.45)]",
        size === "sm" ? "size-9" : "size-10",
      )}
    >
      <span className="grid size-full place-items-center rounded-full bg-surface text-xs font-semibold">
        {initials || "EJ"}
      </span>
    </span>
  );
}

/** The hairline that ties the header into the same lighting system. */
function GradientRule() {
  return (
    <div
      aria-hidden
      className="h-px w-full"
      style={{
        background:
          "linear-gradient(90deg, rgba(124,58,237,0) 0%, rgba(124,58,237,0.5) 25%, rgba(34,211,238,0.4) 60%, rgba(37,99,235,0) 100%)",
      }}
    />
  );
}

function NavLink({
  item,
  label,
  active,
  onClick,
  badge,
}: {
  item: (typeof NAV_ITEMS)[number];
  label: string;
  active: boolean;
  onClick?: () => void;
  badge?: number;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
        "transition-[transform,background,color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
        active
          ? "text-white shadow-[0_6px_20px_rgba(124,58,237,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] [background:var(--grad-brand)]"
          : "text-muted hover:translate-x-0.5 hover:bg-surface-2/70 hover:text-text",
      )}
    >
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-[filter]",
          active && "drop-shadow-[0_0_6px_rgba(255,255,255,0.65)]",
        )}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge ? (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
            active ? "bg-white/20 text-white" : "bg-danger/20 text-on-danger",
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export { CHALLENGE_META };
