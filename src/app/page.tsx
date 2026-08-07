import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";

// Projects and Experience sections were removed — add them back with real
// content when there's something to show:
// `src/components/sections/projects.tsx` + `src/data/projects.ts`
// `src/components/sections/experience.tsx` + `src/data/experience.ts`
// (also re-add "Projects"/"Experience" to `navLinks` in `src/data/site.ts`)

// Testimonials section intentionally omitted — no real testimonial
// content was provided. Add `src/components/sections/testimonials.tsx`
// and data in `src/data/testimonials.ts` when you have some, then
// render <Testimonials /> here.

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Contact />
    </>
  );
}
