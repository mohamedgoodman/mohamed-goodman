import Link from "next/link";
import { FaGithub, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa6";

import { siteConfig } from "@/data/site";

const socialLinks = [
  { href: siteConfig.social.github, label: "GitHub", icon: FaGithub },
  { href: siteConfig.social.linkedin, label: "LinkedIn", icon: FaLinkedin },
  {
    href: siteConfig.social.instagram,
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    href: siteConfig.social.whatsapp,
    label: "WhatsApp",
    icon: FaWhatsapp,
  },
];

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>

        <div className="flex items-center gap-1">
          {socialLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-md outline-none focus-visible:ring-2"
            >
              <link.icon className="size-4" aria-hidden="true" />
            </Link>
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
