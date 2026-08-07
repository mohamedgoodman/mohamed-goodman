import Link from "next/link";
import type { IconType } from "react-icons";

import { cn } from "@/lib/utils";

type Brand = "instagram" | "whatsapp" | "neutral";

const brandStyles: Record<Brand, string> = {
  instagram:
    "text-white [background:linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)] hover:opacity-90",
  whatsapp: "bg-[#25D366] text-white hover:opacity-90",
  neutral: "text-muted-foreground hover:text-foreground hover:bg-accent border",
};

type SocialIconLinkProps = {
  href: string;
  label: string;
  icon: IconType;
  brand?: Brand;
  size?: "sm" | "lg";
};

export function SocialIconLink({
  href,
  label,
  icon: Icon,
  brand = "neutral",
  size = "sm",
}: SocialIconLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "focus-visible:ring-ring inline-flex items-center justify-center rounded-full transition-opacity outline-none focus-visible:ring-2",
        size === "lg" ? "size-10" : "size-9",
        brandStyles[brand],
      )}
    >
      <Icon
        className={size === "lg" ? "size-4" : "size-4"}
        aria-hidden="true"
      />
    </Link>
  );
}
