import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { aboutBio } from "@/data/about";
import { skillGroups } from "@/data/skills";

export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="py-24">
      <div className="container-page">
        <Reveal>
          <h2
            id="about-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            About
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-5">
          <Reveal delay={0.05} className="lg:col-span-3">
            <div className="space-y-4">
              {aboutBio.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-muted-foreground leading-relaxed sm:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <Button className="mt-6" variant="outline" asChild>
              {/* TODO: replace with your real CV at public/cv.pdf */}
              <a href="/cv.pdf" download>
                <DownloadIcon className="size-4" aria-hidden="true" />
                Download CV
              </a>
            </Button>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-2">
            <div className="grid gap-6 sm:grid-cols-2">
              {skillGroups.map((group) => (
                <div key={group.category}>
                  <h3 className="text-sm font-semibold tracking-wide uppercase">
                    {group.category}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
