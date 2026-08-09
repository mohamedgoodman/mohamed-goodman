"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";

/**
 * Search entry point. The icon opens a full-width sheet under the header with
 * a single field; submitting goes to the search results page.
 */
export function SearchOverlay() {
  const t = useTranslations("search");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="site-search"
        aria-label={t("title")}
        className="grid size-9 place-items-center rounded-xs transition-opacity hover:opacity-70"
      >
        <SearchIcon className="size-[1.15rem]" aria-hidden="true" />
      </button>

      {open ? (
        <div
          id="site-search"
          data-header-panel=""
          className="bg-surface text-foreground border-border animate-in fade-in slide-in-from-top-2 absolute inset-x-0 top-full border-b duration-200"
        >
          <form
            onSubmit={submit}
            role="search"
            className="container-editorial flex items-center gap-3 py-4"
          >
            <SearchIcon
              className="text-muted-foreground size-[1.15rem] shrink-0"
              aria-hidden="true"
            />
            <label htmlFor="site-search-input" className="sr-only">
              {t("title")}
            </label>
            <input
              ref={inputRef}
              id="site-search-input"
              name="q"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("placeholder")}
              autoComplete="off"
              className="text-md placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent outline-none"
            />
            <button
              type="submit"
              className="tracking-eyebrow hidden text-xs uppercase transition-colors hover:opacity-70 sm:block"
            >
              {t("submit")}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label={t("close")}
              className="grid size-8 shrink-0 place-items-center rounded-xs transition-opacity hover:opacity-70"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
