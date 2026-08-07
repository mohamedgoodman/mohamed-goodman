import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Projects } from "@/components/sections/projects";
import { Experience } from "@/components/sections/experience";
import { Contact } from "@/components/sections/contact";

// Testimonials section intentionally omitted — no real testimonial
// content was provided. Add `src/components/sections/testimonials.tsx`
// and data in `src/data/testimonials.ts` when you have some, then
// render <Testimonials /> here between Experience and Contact.

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Contact />
    </>
  );
}
