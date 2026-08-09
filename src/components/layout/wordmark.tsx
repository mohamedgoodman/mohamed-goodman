import { brand } from "@/data/brand";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The centred wordmark. Set in the display serif with wide tracking — the
 * one place in the system where letter-spacing opens up rather than tightens.
 * Kept as text (not an image) so it stays crisp and translatable-free.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      // EDEN HOUSE is a Latin logotype: it keeps its wide tracking even on the
      // Arabic page, and lang="en" is both the opt-out hook for the RTL
      // letter-spacing reset and the right hint for a screen reader.
      lang="en"
      className={cn(
        "font-serif text-[1.05rem] leading-none whitespace-nowrap uppercase sm:text-[1.25rem]",
        "tracking-[0.22em] [--tracking-latin-inline:0.22em]",
        // Also pin the Latin serif: on the Arabic page --font-serif points at
        // the Naskh face, whose Latin glyphs are not the logotype.
        "[--font-serif:var(--font-instrument-serif),ui-serif,serif]",
        className,
      )}
    >
      {brand.wordmark}
    </Link>
  );
}
