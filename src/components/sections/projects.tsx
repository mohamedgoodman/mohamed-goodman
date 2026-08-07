import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { projects } from "@/data/projects";

export function Projects() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="bg-secondary/30 py-24"
    >
      <div className="container-page">
        <Reveal>
          <h2
            id="projects-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Projects
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl sm:text-lg">
            A selection of things I&apos;ve built recently. Each one links to a
            full case study.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={Math.min(i * 0.05, 0.2)}>
              <Card className="group h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
                <Link
                  href={`/projects/${project.slug}`}
                  className="focus-visible:ring-ring block outline-none focus-visible:ring-2"
                >
                  <div className="bg-muted relative aspect-video overflow-hidden">
                    <Image
                      src={project.image}
                      alt={`${project.title} preview`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                </Link>

                <CardHeader className="pt-6">
                  <CardTitle className="text-lg">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="focus-visible:ring-ring rounded-sm outline-none hover:underline focus-visible:ring-2"
                    >
                      {project.title}
                    </Link>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {project.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="gap-2 pb-6">
                  {project.liveUrl && (
                    <Link
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm text-sm font-medium outline-none focus-visible:ring-2"
                    >
                      Live
                      <ArrowUpRightIcon
                        className="size-3.5"
                        aria-hidden="true"
                      />
                    </Link>
                  )}
                  {project.githubUrl && (
                    <Link
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-auto inline-flex items-center gap-1 rounded-sm text-sm font-medium outline-none focus-visible:ring-2"
                    >
                      <FaGithub className="size-3.5" aria-hidden="true" />
                      Code
                    </Link>
                  )}
                </CardFooter>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
