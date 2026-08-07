import Image from "next/image";

import { Reveal } from "@/components/motion/reveal";

export function ComingSoon() {
  return (
    <section
      aria-label="Announcement"
      className="relative isolate overflow-hidden py-32 sm:py-40"
    >
      <Image
        src="/assets/coming-soon-bg.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover"
        quality={90}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-1/2 left-1/2 h-72 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,theme(colors.indigo.500),theme(colors.fuchsia.500),theme(colors.amber.400),theme(colors.indigo.500))] opacity-25 blur-[100px]" />
      </div>

      <div className="container-page text-center">
        <Reveal>
          <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-white/70 uppercase">
            Stay tuned
          </p>
          <h2 className="animate-shine bg-[linear-gradient(90deg,#6366f1,#d946ef,#f59e0b,#6366f1)] bg-[length:200%_auto] bg-clip-text text-4xl font-extrabold tracking-tight text-balance text-transparent sm:text-6xl md:text-7xl">
            Something big is coming soon
          </h2>
        </Reveal>
      </div>
    </section>
  );
}
