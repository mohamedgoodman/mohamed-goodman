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
      className={cn(
        "font-serif text-[1.05rem] leading-none tracking-[0.22em] whitespace-nowrap uppercase sm:text-[1.25rem]",
        className,
      )}
    >
      {brand.wordmark}
    </Link>
  );
}
