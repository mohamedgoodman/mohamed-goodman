"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon, MailIcon } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/site";

const quickLinks = [
  { href: siteConfig.social.instagram, label: "Instagram", icon: FaInstagram },
  { href: siteConfig.social.whatsapp, label: "WhatsApp", icon: FaWhatsapp },
];

export function Hero() {
  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative overflow-hidden"
    >
      {/* subtle animated gradient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="bg-primary/20 absolute top-[-10%] left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full blur-[120px] dark:opacity-40" />
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_40%,transparent_100%)] [background-size:32px_32px] opacity-[0.4]" />
      </div>

      <div className="container-page flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="ring-border ring-offset-background relative size-24 overflow-hidden rounded-full ring-2 ring-offset-4 sm:size-28"
        >
          <Image
            src={siteConfig.avatar}
            alt={`Portrait of ${siteConfig.name}`}
            fill
            sizes="112px"
            className="object-cover"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-primary mb-3 text-sm font-medium tracking-wide">
            &ldquo;{siteConfig.tagline}&rdquo;
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Hi, I&apos;m {siteConfig.name.split(" ")[0]} — {siteConfig.title}
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-balance sm:text-lg">
            {siteConfig.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Button size="lg" asChild>
            <a href="#projects">
              View work
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#contact">
              <MailIcon className="size-4" aria-hidden="true" />
              Contact me
            </a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2"
        >
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring inline-flex size-10 items-center justify-center rounded-full border outline-none focus-visible:ring-2"
            >
              <link.icon className="size-4" aria-hidden="true" />
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
