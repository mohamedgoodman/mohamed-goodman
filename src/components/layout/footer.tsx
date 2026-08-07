import Link from "next/link";
import { FaGithub, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa6";

import { SocialIconLink } from "@/components/social-icon-link";
import { siteConfig } from "@/data/site";

const socialLinks = [
  {
    href: siteConfig.social.github,
    label: "GitHub",
    icon: FaGithub,
    brand: "neutral" as const,
  },
  {
    href: siteConfig.social.linkedin,
    label: "LinkedIn",
    icon: FaLinkedin,
    brand: "neutral" as const,
  },
  {
    href: siteConfig.social.instagram,
    label: "Instagram",
    icon: FaInstagram,
    brand: "instagram" as const,
  },
  {
    href: siteConfig.social.whatsapp,
    label: "WhatsApp",
    icon: FaWhatsapp,
    brand: "whatsapp" as const,
  },
];

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>

        <div className="flex items-center gap-1.5">
          {socialLinks.map((link) => (
            <SocialIconLink
              key={link.label}
              href={link.href}
              label={link.label}
              icon={link.icon}
              brand={link.brand}
            />
          ))}
        </div>

        <p className="text-muted-foreground text-sm">
          Built with{" "}
          <Link
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline underline-offset-4"
          >
            Next.js
          </Link>{" "}
          &{" "}
          <Link
            href="https://ui.shadcn.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline underline-offset-4"
          >
            shadcn/ui
          </Link>
        </p>
      </div>
    </footer>
  );
}
