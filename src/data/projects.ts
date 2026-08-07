export type Project = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  stack: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  caseStudy: {
    problem: string;
    approach: string[];
    result: string;
  };
};

// TODO: replace — swap these for your real projects. Keep the same shape.
export const projects: Project[] = [
  {
    slug: "commerce-dashboard",
    title: "Commerce Analytics Dashboard",
    summary:
      "A real-time analytics dashboard for e-commerce teams to track sales, inventory, and customer trends.",
    image: "/projects/placeholder-1.jpg",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/",
    featured: true,
    caseStudy: {
      problem:
        "The client's team relied on spreadsheets exported daily from three disconnected systems, making it impossible to spot trends or react to inventory issues in real time.",
      approach: [
        "Audited the existing data sources and designed a unified schema in PostgreSQL.",
        "Built a Next.js dashboard with server components for fast initial loads and streaming updates.",
        "Added role-based access and saved views so different teams could focus on relevant metrics.",
      ],
      result:
        "Reduced time-to-insight from a full day to under a minute, and the team caught two inventory shortfalls before they impacted customers in the first month.",
    },
  },
  {
    slug: "wellness-mobile-app",
    title: "Wellness Tracking App",
    summary:
      "A cross-platform habit and wellness tracker with reminders, streaks, and shareable progress reports.",
    image: "/projects/placeholder-2.jpg",
    stack: ["React Native", "TypeScript", "Node.js", "Redis"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/",
    featured: true,
    caseStudy: {
      problem:
        "Existing habit trackers were either too rigid or too complex, causing users to abandon them within the first week.",
      approach: [
        "Ran a short discovery sprint with 12 target users to identify the smallest useful feature set.",
        "Designed a streak system with forgiving 'grace days' to reduce all-or-nothing drop-off.",
        "Shipped an MVP in six weeks, then iterated weekly based on in-app feedback.",
      ],
      result:
        "30-day retention improved from an industry-typical ~15% to 42% in the beta cohort.",
    },
  },
  {
    slug: "design-system",
    title: "Component Design System",
    summary:
      "A shared, themeable component library used across four internal products to unify UI and speed up delivery.",
    image: "/projects/placeholder-3.jpg",
    stack: ["React", "TypeScript", "Storybook", "Radix UI"],
    githubUrl: "https://github.com/",
    caseStudy: {
      problem:
        "Four product teams were each maintaining their own button, form, and modal components, leading to inconsistent UX and duplicated bug fixes.",
      approach: [
        "Audited existing components across teams and consolidated overlapping patterns.",
        "Built accessible, themeable primitives on Radix UI with full keyboard and screen-reader support.",
        "Documented usage in Storybook and ran migration sessions with each team.",
      ],
      result:
        "Cut new-feature UI development time by roughly a third and eliminated the majority of cross-product visual inconsistencies within two quarters.",
    },
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
