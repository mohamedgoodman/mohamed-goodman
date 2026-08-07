# Mohamed Dardari — Portfolio

A modern, production-ready personal portfolio site: single-page scroll (Hero,
About, Projects, Experience, Contact) plus dedicated project case-study
pages. Built with Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui
primitives, and Framer Motion.

## Stack

- **Next.js 16** (App Router, Server Components by default)
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **shadcn/ui** primitives (hand-authored under `src/components/ui` — the
  `shadcn` CLI's registry fetch wasn't reachable in the build environment
  this was created in, so the components were written directly from the
  same source patterns; `components.json` is still present so the CLI works
  normally for you, e.g. `npx shadcn@latest add dialog`)
- **Framer Motion** for scroll-triggered reveals (`whileInView`)
- **next-themes** for light/dark mode (persisted, respects system preference)
- **react-hook-form + zod** for the contact form (client + server validation)
- **Resend** for sending contact-form emails (falls back to a mock API route
  if `RESEND_API_KEY` isn't set)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build         # production build
npm run start          # serve the production build
npm run lint            # ESLint
npm run format          # Prettier — write
npm run format:check    # Prettier — check only
```

## Editing content

All real content lives under `src/data/` as plain TypeScript objects —
**you never need to touch a component to change text**:

| File                     | Controls                                                       |
| ------------------------ | -------------------------------------------------------------- |
| `src/data/site.ts`       | Name, tagline, hero description, social links, CV/avatar paths |
| `src/data/about.ts`      | About section bio paragraphs                                   |
| `src/data/skills.ts`     | Skills grid, grouped by category                               |
| `src/data/experience.ts` | Experience timeline entries                                    |
| `src/data/projects.ts`   | Project cards + full case-study content                        |

Every placeholder value is marked `// TODO: replace` — search the codebase
for `TODO: replace` to find everything that needs your real information
(email, CV file, project details, work history, social profiles, deployed
domain in `siteConfig.url`).

Also replace:

- `public/assets/avatar.jpg` — your photo (used in the hero and metadata)
- `public/cv.pdf` — your real CV (the placeholder is a 1-page stub)
- `public/projects/*.jpg` — real project screenshots (any image works;
  update the `image` path in `src/data/projects.ts` to match)

### Adding a new project

1. Add a new object to the `projects` array in `src/data/projects.ts`
   (copy an existing entry as a template — `slug`, `title`, `summary`,
   `image`, `stack`, `liveUrl`/`githubUrl`, and a `caseStudy` with
   `problem` / `approach` / `result`).
2. Drop an image for it in `public/projects/`.
3. That's it — it automatically appears in the Projects grid, gets its own
   `/projects/<slug>` case-study page, and is included in `sitemap.xml`.

### Changing the accent color

The entire site's accent color is driven by two CSS variables at the top of
`src/app/globals.css`:

```css
:root {
  --accent-brand: oklch(0.585 0.233 264.1);
  --accent-brand-foreground: oklch(0.98 0.005 264.1);
}
.dark {
  --accent-brand: oklch(0.685 0.19 264.1);
  --accent-brand-foreground: oklch(0.145 0.01 264.1);
}
```

Change those (light + dark) and every button, link, ring, and highlight
re-themes automatically.

### Testimonials

The spec allows skipping testimonials if there's no real content — that
section was omitted for that reason. To add it back: create
`src/data/testimonials.ts` and `src/components/sections/testimonials.tsx`
(a grid or carousel following the same pattern as `experience.tsx`), then
render `<Testimonials />` in `src/app/page.tsx` between Experience and
Contact.

## Contact form / email

The contact form posts to `src/app/api/contact/route.ts`, which:

1. Validates input with the shared zod schema in `src/lib/validations.ts`
   (also used client-side for instant feedback).
2. Checks a hidden honeypot field — bots that fill it get a fake success
   response and no email is sent.
3. If `RESEND_API_KEY` is set, sends the message via
   [Resend](https://resend.com). Otherwise it logs the submission to the
   server console and returns success, so the full UX still works locally
   without any credentials.

To send real emails: create a [Resend](https://resend.com) account, verify
a sending domain, and set `RESEND_API_KEY` (see `.env.example`). Update the
`from` address in `route.ts` and `siteConfig.email` in `src/data/site.ts` to
match your verified domain.

## Deploying to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
   Vercel auto-detects Next.js — no config needed.
3. Add the `RESEND_API_KEY` environment variable in the Vercel project
   settings if you want real emails sent (Project → Settings →
   Environment Variables). Leave it unset to keep the mock behavior.
4. Deploy. Every push to your default branch redeploys automatically;
   every PR gets a preview deployment.
5. Update `siteConfig.url` in `src/data/site.ts` to your real Vercel/custom
   domain so metadata, the sitemap, and JSON-LD all point at the right
   place, then redeploy.

Or from the CLI:

```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

## Quality bar

- `npm run build` and `npm run lint` both run clean with zero errors and
  zero warnings.
- Semantic HTML, visible focus states, keyboard-navigable nav (incl. the
  mobile menu), `alt` text on every image, a skip-to-content link, and a
  `prefers-reduced-motion` fallback that disables animation.
- `next/image` everywhere (responsive `sizes`, lazy-loaded below the fold,
  `priority` only on the hero portrait), `next/font` for self-hosted fonts
  (no render-blocking font requests).
- Per-page `metadata`, OpenGraph/Twitter cards, a generated OG image
  (`src/app/opengraph-image.tsx`) and favicon (`src/app/icon.tsx`),
  `sitemap.xml` / `robots.txt` metadata routes, and JSON-LD
  `Person`/`ProfilePage` structured data in the root layout.
- Custom 404 (`src/app/not-found.tsx`) and error boundary
  (`src/app/error.tsx`) matching the site's design.

## Project structure

```
src/
  app/                    routes (App Router)
    api/contact/route.ts  contact form endpoint
    projects/[slug]/      project case-study pages
    layout.tsx            root layout, fonts, metadata, JSON-LD
    page.tsx              home page (assembles the sections)
    sitemap.ts / robots.ts / icon.tsx / opengraph-image.tsx
    not-found.tsx / error.tsx
  components/
    ui/                   shadcn/ui primitives
    layout/                navbar, footer
    sections/               hero, about, projects, experience, contact
    motion/reveal.tsx      scroll-triggered fade/slide-in wrapper
  data/                    all editable content (see above)
  lib/                     cn() helper, zod schemas
```
