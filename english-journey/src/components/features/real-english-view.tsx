"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PhraseCard } from "@/components/practice/vocab-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { TabBar } from "@/components/ui/tabs";
import { REAL_ENGLISH, REAL_ENGLISH_CATEGORY_META } from "@/content";
import { REAL_ENGLISH_CATEGORIES, type RealEnglishCategoryId } from "@/types";

type Tab = RealEnglishCategoryId | "all";

export function RealEnglishView() {
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
    { id: "all" as Tab, label: "All", count: REAL_ENGLISH.length },
    ...REAL_ENGLISH_CATEGORIES.map((id) => ({
      id: id as Tab,
      label: REAL_ENGLISH_CATEGORY_META[id].label,
      count: REAL_ENGLISH.filter((p) => p.category === id).length,
    })),
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Real English</h1>
        <p className="mt-2 max-w-2xl text-muted">
          The English people actually use — with the part textbooks leave out: when it&apos;s appropriate,
          and what to say instead when it isn&apos;t. Slang is labelled, never taught blind.
        </p>
      </div>

      <div className="space-y-3">
        <TabBar tabs={tabs} value={tab} onChange={setTab} />
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search expressions, meanings, situations…"
            className="pl-10"
            aria-label="Search expressions"
          />
        </div>
      </div>

      {tab !== "all" ? (
        <p className="text-sm text-muted">{REAL_ENGLISH_CATEGORY_META[tab].blurb}</p>
      ) : null}

      {phrases.length === 0 ? (
        <Card>
          <p className="text-muted">
            No expressions match “{query}”. Try a shorter search — or browse a category.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {phrases.map((phrase) => (
            <Card key={phrase.id} className="animate-fade">
              <PhraseCard phrase={phrase} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
