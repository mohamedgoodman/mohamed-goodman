import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getProjectBySlug, projects } from "@/data/projects";
import { siteConfig } from "@/data/site";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [{ url: project.image }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images: [project.image],
    },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <article className="py-16">
      <div className="container-page max-w-3xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-3">
          <Link href={`${siteConfig.url}/#projects`}>
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            Back to projects
          </Link>
        </Button>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {project.title}
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">{project.summary}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>

          <div className="ml-auto flex gap-2">
            {project.liveUrl && (
              <Button size="sm" asChild>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live site
                  <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button size="sm" variant="outline" asChild>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub className="size-3.5" aria-hidden="true" />
                  Source
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="bg-muted relative mt-8 aspect-video overflow-hidden rounded-xl">
          <Image
            src={project.image}
            alt={`${project.title} preview`}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>

        <Separator className="my-10" />

        <div className="space-y-10">
          <section aria-labelledby="problem-heading">
            <h2 id="problem-heading" className="text-xl font-semibold">
              Problem
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              {project.caseStudy.problem}
            </p>
          </section>

          <section aria-labelledby="approach-heading">
            <h2 id="approach-heading" className="text-xl font-semibold">
              Approach
            </h2>
            <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-5 leading-relaxed">
              {project.caseStudy.approach.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="result-heading">
            <h2 id="result-heading" className="text-xl font-semibold">
              Result
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              {project.caseStudy.result}
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
