import { brand } from "@/data/brand";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The wordmark, set in the display grotesque at its heaviest weight.
 *
 * It stays Latin in every locale — a logotype isn't translated — so it keeps
 * its slight tracking even on the Arabic page. `lang="en"` is both the opt-out
 * hook for the RTL letter-spacing reset and the right hint for a screen
 * reader.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      lang="en"
      className={cn(
        "font-display text-base leading-none font-black whitespace-nowrap uppercase sm:text-lg",
        "tracking-[0.04em] [--tracking-latin-inline:0.04em]",
        // Pin the Latin face: on the Arabic page --font-display points at the
        // Arabic family, whose Latin glyphs are not the logotype.
        "[--font-display:var(--font-archivo),ui-sans-serif,sans-serif]",
        className,
      )}
    >
      {brand.wordmark}
    </Link>
  );
}
