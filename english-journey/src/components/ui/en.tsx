import { cn } from "@/lib/utils";

/**
 * Wraps the English being taught so it keeps its own direction inside the
 * Darija (RTL) interface.
 *
 * Without this, an English sentence in an RTL paragraph has its trailing
 * punctuation flipped to the front ("of a story." renders as ".of a story"),
 * which is exactly the kind of small wrongness that makes a language app feel
 * untrustworthy. `unicode-bidi: isolate` on the `.ltr` utility fixes it.
 */
export function En({
  as: Tag = "span",
  className,
  children,
  ...props
}: {
  as?: "span" | "p" | "div" | "li" | "strong" | "h2" | "h3" | "h4";
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag dir="ltr" className={cn("ltr", className)} {...props}>
      {children}
    </Tag>
  );
}
