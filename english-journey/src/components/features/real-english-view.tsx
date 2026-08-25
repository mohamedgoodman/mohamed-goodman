"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PhraseCard } from "@/components/practice/vocab-card";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/field";
import { TabBar } from "@/components/ui/tabs";
import { REAL_ENGLISH, REAL_ENGLISH_CATEGORY_META } from "@/content";
import { useI18n } from "@/i18n/provider";
import { REAL_ENGLISH_CATEGORIES, type RealEnglishCategoryId } from "@/types";

type Tab = RealEnglishCategoryId | "all";

/** One ambient light per category, drawn from the brand palette only. */
const CATEGORY_LIGHT: Record<RealEnglishCategoryId, string> = {
  street: "rgba(168,85,247,0.35)",
  workplace: "rgba(37,99,235,0.35)",
  american: "rgba(124,58,237,0.35)",
  british: "rgba(34,211,238,0.3)",
  travel: "rgba(16,185,129,0.28)",
  social: "rgba(245,158,11,0.28)",
  internet: "rgba(34,211,238,0.32)",
  business: "rgba(37,99,235,0.32)",
};

export function RealEnglishView() {
  const { t, fmt } = useI18n();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const phrases = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return REAL_ENGLISH.filter((phrase) => {
      const matchesTab = tab === "all" || phrase.category === tab;
      const matchesQuery =
        !needle ||
        phrase.phrase.toLowerCase().includes(needle) ||
        phrase.meaning.toLowerCase().includes(needle) ||
        phrase.whenToUse.toLowerCase().includes(needle);
      return matchesTab && matchesQuery;
    });
  }, [tab, query]);

  const tabs = [
    { id: "all" as Tab, label: t.common.all, count: REAL_ENGLISH.length },
    ...REAL_ENGLISH_CATEGORIES.map((id) => ({
      id: id as Tab,
      label: t.content.categories[id].label,
      count: REAL_ENGLISH.filter((p) => p.category === id).length,
    })),
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{t.realEnglish.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t.realEnglish.subtitle}</p>
      </div>

      {/* Category grid — the way into the section, before the flat list. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {REAL_ENGLISH_CATEGORIES.map((id) => {
          const meta = REAL_ENGLISH_CATEGORY_META[id];
          const label = t.content.categories[id];
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(active ? "all" : id)}
              aria-pressed={active}
              className={cn(
                "group relative flex min-h-24 flex-col items-start justify-between overflow-hidden rounded-2xl border p-3.5 text-start",
                "transition-[transform,box-shadow,border-color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1",
                active
                  ? "border-purple/55 bg-brand-soft shadow-[0_10px_28px_rgba(124,58,237,0.3)]"
                  : "border-border-strong bg-surface/60 shadow-[var(--shadow-sm)] backdrop-blur hover:border-purple/40",
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-10 -right-8 size-24 rounded-full opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle, ${CATEGORY_LIGHT[id]}, rgba(0,0,0,0) 70%)`,
                }}
              />
              <span className="relative text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 [text-shadow:0_6px_14px_rgba(0,0,0,0.45)]">
                {meta.icon}
              </span>
              <span className="relative mt-2">
                <span className="block text-sm font-semibold">{label.label}</span>
                <span className="block text-xs text-dim">
                  {REAL_ENGLISH.filter((p) => p.category === id).length} {t.realEnglish.expressions}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <TabBar tabs={tabs} value={tab} onChange={setTab} />
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.realEnglish.searchPlaceholder}
            className="ps-10"
            aria-label={t.common.search}
          />
        </div>
      </div>

      {tab !== "all" ? (
        <p className="text-sm text-muted">{t.content.categories[tab].blurb}</p>
      ) : null}

      {phrases.length === 0 ? (
        <Card>
          <p className="text-muted">
            {fmt(t.realEnglish.noResults, { query })}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {phrases.map((phrase) => (
            <Card key={phrase.id} interactive className="animate-fade">
              <PhraseCard phrase={phrase} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
