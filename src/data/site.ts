export const siteConfig = {
  name: "Mohamed Dardari",
  // TODO: replace — one-line value proposition shown in the hero
  title: "Full-Stack Developer",
  tagline: "1% Chance · 99% Faith",
  // TODO: replace — short value proposition sentence for hero + meta description
  description:
    "I design and build fast, accessible web products — from idea to production.",
  location: "Morocco",
  url: "https://mohameddardari.dev", // TODO: replace with real deployed domain
  ogImage: "/opengraph-image",
  email: "hello@example.com", // TODO: replace with real contact email
  cvUrl: "/cv.pdf", // TODO: replace — add your real CV at public/cv.pdf
  avatar: "/assets/avatar.jpg",
  social: {
    instagram: "https://www.instagram.com/mohameed.dardari",
    whatsapp: "https://wa.me/212641141355",
    // TODO: replace — add your real profiles
    github: "https://github.com/mohamedgoodman",
    linkedin: "https://www.linkedin.com/",
    twitter: "https://twitter.com/",
  },
} as const;

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
] as const;
