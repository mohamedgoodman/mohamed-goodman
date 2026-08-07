export const siteConfig = {
  name: "Mohamed Dardari",
  title: "AI-Assisted Developer & Designer",
  tagline: "No risk, no story",
  description:
    "I build with Claude Code and design with intent — turning AI-assisted development into shipped work that's generated $10K+.",
  location: "Morocco",
  url: "https://mohamedgoodman.vercel.app",
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
  { href: "#contact", label: "Contact" },
] as const;
