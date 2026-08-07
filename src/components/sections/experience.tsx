import { Reveal } from "@/components/motion/reveal";
import { experience } from "@/data/experience";

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="py-24"
    >
      <div className="container-page">
        <Reveal>
          <h2
            id="experience-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Experience
          </h2>
        </Reveal>

        <ol className="border-border relative mt-12 space-y-10 border-l">
          {experience.map((item, i) => (
            <Reveal
              as="li"
              key={`${item.company}-${item.start}`}
              delay={Math.min(i * 0.05, 0.2)}
              className="relative pl-8 sm:pl-10"
            >
              {/* Positioned relative to this li (Framer Motion's transform
                  makes it its own containing block), so left-0 always lands
                  exactly on the ol's border line regardless of padding. */}
              <span
                aria-hidden="true"
                className="bg-primary ring-background absolute top-1.5 left-0 size-3.5 -translate-x-1/2 rounded-full ring-4"
              />
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-semibold">
                  {item.role} · {item.company}
                </h3>
                <p className="text-muted-foreground text-sm whitespace-nowrap">
                  {item.start} — {item.end}
                </p>
              </div>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {item.location}
              </p>
              <ul className="text-muted-foreground mt-3 list-disc space-y-1.5 pl-4 text-sm leading-relaxed sm:text-base">
                {item.achievements.map((achievement, idx) => (
                  <li key={idx}>{achievement}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
