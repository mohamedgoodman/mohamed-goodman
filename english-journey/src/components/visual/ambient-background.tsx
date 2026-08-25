/**
 * The deep-space field that sits behind the whole product.
 *
 * Three cheap layers, no canvas and no WebGL: two large radial glows, two
 * slowly drifting blobs, and a handful of floating particles. Everything is
 * `position: fixed` and `pointer-events: none`, so it never affects layout or
 * interaction, and the animated parts are disabled on small screens and under
 * `prefers-reduced-motion`.
 */
const PARTICLES = [
  { left: "8%", top: "72%", size: 2, delay: 0, duration: 17, color: "var(--purple-bright)" },
  { left: "22%", top: "88%", size: 1.5, delay: 3, duration: 21, color: "var(--cyan)" },
  { left: "37%", top: "64%", size: 2.5, delay: 7, duration: 19, color: "var(--blue)" },
  { left: "54%", top: "82%", size: 1.5, delay: 2, duration: 23, color: "var(--purple-bright)" },
  { left: "68%", top: "70%", size: 2, delay: 9, duration: 18, color: "var(--cyan)" },
  { left: "81%", top: "90%", size: 1.5, delay: 5, duration: 22, color: "var(--purple)" },
  { left: "92%", top: "66%", size: 2, delay: 12, duration: 20, color: "var(--blue)" },
  { left: "46%", top: "94%", size: 1.5, delay: 14, duration: 24, color: "var(--purple-bright)" },
];

export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base grade — keeps the very top of the page from reading as flat black. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -20%, rgba(124,58,237,0.16) 0%, rgba(8,11,24,0) 60%)," +
            "radial-gradient(90% 60% at 85% 10%, rgba(37,99,235,0.13) 0%, rgba(8,11,24,0) 55%)," +
            "radial-gradient(70% 50% at 10% 90%, rgba(34,211,238,0.07) 0%, rgba(8,11,24,0) 60%)",
        }}
      />

      {/* Two drifting light blobs. Hidden below `sm` — phones get the static
          gradient only, which is materially cheaper to composite. */}
      <div
        className="animate-float-slow absolute -top-40 -left-32 hidden size-[38rem] rounded-full opacity-60 blur-[110px] sm:block"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.30), rgba(124,58,237,0) 70%)",
          animation: "drift 26s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-40 bottom-[-14rem] hidden size-[42rem] rounded-full opacity-50 blur-[120px] sm:block"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.28), rgba(37,99,235,0) 70%)",
          animation: "drift 34s ease-in-out infinite reverse",
        }}
      />

      {/* Sparse particles. Eight, not eighty. */}
      <div className="particle-field absolute inset-0 hidden sm:block">
        {PARTICLES.map((particle) => (
          <span
            key={particle.left + particle.top}
            className="absolute rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              background: particle.color,
              boxShadow: `0 0 ${particle.size * 4}px ${particle.color}`,
              animation: `particle-rise ${particle.duration}s linear ${particle.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* A whisper of grain stops the large gradients from banding. */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
