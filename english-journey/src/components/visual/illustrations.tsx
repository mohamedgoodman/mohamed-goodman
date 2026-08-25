/**
 * Illustration set.
 *
 * Drawn as inline SVG rather than exported raster art for three reasons that
 * matter for this audience: they weigh a couple of kilobytes instead of
 * hundreds (mobile data in Morocco is not free), they stay sharp on every
 * screen, and they read the theme tokens so they work in light and dark
 * without a second asset.
 */

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-brand`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="55%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
      <linearGradient id={`${id}-soft`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05" />
      </linearGradient>
      <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="6" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/**
 * Hero art: a speech bubble climbing a set of steps — the product's whole
 * argument (language built by consistent, rising practice) in one shape.
 */
export function HeroIllustration({ className }: { className?: string }) {
  const id = "hero";
  return (
    <svg viewBox="0 0 420 320" className={className} role="img" aria-hidden fill="none">
      <Defs id={id} />
      <ellipse cx="210" cy="285" rx="165" ry="22" fill={`url(#${id}-soft)`} opacity="0.5" />

      {/* Rising steps */}
      {[0, 1, 2, 3].map((step) => (
        <rect
          key={step}
          x={54 + step * 82}
          y={244 - step * 34}
          width="70"
          height={30 + step * 34}
          rx="10"
          fill="var(--surface-2)"
          stroke="var(--border-strong)"
        />
      ))}
      {[0, 1, 2, 3].map((step) => (
        <rect
          key={`cap-${step}`}
          x={54 + step * 82}
          y={244 - step * 34}
          width="70"
          height="7"
          rx="3.5"
          fill={`url(#${id}-brand)`}
          opacity={0.5 + step * 0.16}
        />
      ))}

      {/* Speech bubble at the top step */}
      <g filter={`url(#${id}-glow)`}>
        <rect x="248" y="52" width="132" height="80" rx="22" fill={`url(#${id}-brand)`} />
        <path d="M286 132 L300 132 L288 152 Z" fill="#2563eb" />
      </g>
      <rect x="266" y="78" width="76" height="9" rx="4.5" fill="#fff" opacity="0.92" />
      <rect x="266" y="98" width="52" height="9" rx="4.5" fill="#fff" opacity="0.6" />

      {/* Small orbiting marks: the daily reps */}
      <circle cx="96" cy="96" r="7" fill="#22d3ee" filter={`url(#${id}-glow)`} />
      <circle cx="150" cy="58" r="4.5" fill="#a855f7" />
      <circle cx="196" cy="112" r="3.5" fill="#2563eb" />
    </svg>
  );
}

/** Empty-state art: an open book with a soundwave rising out of it. */
export function EmptyStateIllustration({ className }: { className?: string }) {
  const id = "empty";
  return (
    <svg viewBox="0 0 240 160" className={className} role="img" aria-hidden fill="none">
      <Defs id={id} />
      <path
        d="M32 46c28-12 52-12 88 4 36-16 60-16 88-4v76c-28-12-52-12-88 4-36-16-60-16-88-4V46Z"
        fill="var(--surface-2)"
        stroke="var(--border-strong)"
        strokeWidth="2"
      />
      <path d="M120 50v76" stroke="var(--border-strong)" strokeWidth="2" />
      {[62, 76, 90].map((y, index) => (
        <rect key={y} x="46" y={y} width={58 - index * 12} height="5" rx="2.5" fill="var(--surface-3)" />
      ))}
      {[10, 18, 26, 18, 10].map((height, index) => (
        <rect
          key={index}
          x={140 + index * 13}
          y={80 - height / 2}
          width="6"
          height={height}
          rx="3"
          fill={`url(#${id}-brand)`}
          opacity={0.55 + index * 0.1}
        />
      ))}
    </svg>
  );
}

/** Streak art: a flame made of the brand gradient. */
export function StreakIllustration({ className }: { className?: string }) {
  const id = "streak";
  return (
    <svg viewBox="0 0 120 140" className={className} role="img" aria-hidden fill="none">
      <defs>
        <linearGradient id={`${id}-flame`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>
      </defs>
      <path
        d="M60 8c4 26 26 30 26 58 0 24-12 42-26 42S34 90 34 66c0-14 8-22 12-32 4 12 10 14 14 8 4-6-4-18 0-34Z"
        fill={`url(#${id}-flame)`}
      />
      <path
        d="M60 60c2 12 12 14 12 26 0 12-6 20-12 20s-12-8-12-20c0-8 6-12 12-26Z"
        fill="#fff"
        opacity="0.65"
      />
    </svg>
  );
}

/**
 * Goal art for the onboarding header — five paths converging on one point,
 * which is what choosing a goal actually does to the curriculum.
 */
export function GoalIllustration({ className }: { className?: string }) {
  const id = "goal";
  return (
    <svg viewBox="0 0 260 120" className={className} role="img" aria-hidden fill="none">
      <Defs id={id} />
      {[18, 44, 60, 76, 102].map((y, index) => (
        <path
          key={y}
          d={`M14 ${y} C 90 ${y}, 130 60, 214 60`}
          stroke={`url(#${id}-brand)`}
          strokeWidth="2"
          opacity={0.28 + index * 0.12}
          strokeLinecap="round"
        />
      ))}
      <circle cx="222" cy="60" r="14" fill={`url(#${id}-brand)`} filter={`url(#${id}-glow)`} />
      <circle cx="222" cy="60" r="5" fill="#fff" />
    </svg>
  );
}
