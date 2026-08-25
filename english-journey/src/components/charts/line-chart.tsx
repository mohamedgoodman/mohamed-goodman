"use client";

import { useId } from "react";

export interface Point {
  label: string;
  value: number;
}

/**
 * Hand-rolled SVG charts — no charting dependency, no runtime cost, and they
 * inherit the theme tokens automatically.
 */
export function LineChart({
  data,
  height = 180,
  suffix = "",
  emptyMessage = "No data yet.",
}: {
  data: Point[];
  height?: number;
  suffix?: string;
  emptyMessage?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const gradientId = `fill-${uid}`;
  const strokeId = `stroke-${uid}`;
  const glowId = `glow-${uid}`;
  const hasData = data.some((d) => d.value > 0);
  if (!data.length || !hasData) {
    return (
      <div
        className="grid place-items-center rounded-xl border border-border bg-surface-2/40 text-sm text-dim"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  const width = 600;
  const padding = { top: 12, right: 8, bottom: 22, left: 28 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const x = (i: number) => padding.left + (i / Math.max(data.length - 1, 1)) * innerW;
  const y = (value: number) => padding.top + innerH - (value / max) * innerH;

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.value)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${padding.top + innerH} L${x(0)},${padding.top + innerH} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="block w-full max-w-full"
      style={{ height }}
      role="img"
      aria-label={`Chart: ${data.map((d) => `${d.label} ${d.value}${suffix}`).join(", ")}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.42" />
          <stop offset="60%" stopColor="#2563eb" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <filter id={glowId} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {[0, 0.5, 1].map((fraction) => (
        <g key={fraction}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + innerH * fraction}
            y2={padding.top + innerH * fraction}
            stroke="var(--border)"
            strokeDasharray="2 6"
          />
          <text
            x={4}
            y={padding.top + innerH * fraction + 4}
            fontSize="10"
            fill="var(--text-dim)"
          >
            {Math.round(max * (1 - fraction))}
          </text>
        </g>
      ))}

      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={`url(#${strokeId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />

      {data.map((d, i) =>
        d.value > 0 ? (
          <circle
            key={d.label + i}
            cx={x(i)}
            cy={y(d.value)}
            r="3.2"
            fill="#22d3ee"
            stroke="var(--surface)"
            strokeWidth="1.5"
            filter={`url(#${glowId})`}
          >
            <title>{`${d.label}: ${d.value}${suffix}`}</title>
          </circle>
        ) : null,
      )}

      {data.map((d, i) =>
        i % Math.ceil(data.length / 7) === 0 ? (
          <text
            key={`label-${d.label}-${i}`}
            x={x(i)}
            y={height - 6}
            fontSize="10"
            textAnchor="middle"
            fill="var(--text-dim)"
          >
            {d.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export function BarChart({
  data,
  height = 160,
  suffix = "",
  emptyMessage = "No data yet.",
}: {
  data: Point[];
  height?: number;
  suffix?: string;
  emptyMessage?: string;
}) {
  const hasData = data.some((d) => d.value > 0);
  if (!data.length || !hasData) {
    return (
      <div
        className="grid place-items-center rounded-xl border border-border bg-surface-2/40 text-sm text-dim"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  // With 30 or 90 bars there isn't room for every label — show a readable few.
  const labelEvery = Math.ceil(data.length / 7);

  return (
    <div className="flex items-stretch gap-1 sm:gap-1.5" style={{ height }}>
      {data.map((d, index) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          {/* The bar is absolutely positioned so its percentage height always
              resolves against the track, whatever the flex context does. */}
          <div className="relative w-full flex-1">
            <div
              className="absolute inset-x-0 bottom-0 rounded-t-md transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                height: `${d.value > 0 ? Math.max((d.value / max) * 100, 6) : 0}%`,
                background: "linear-gradient(180deg,#22d3ee 0%,#2563eb 45%,#7c3aed 100%)",
                boxShadow: d.value > 0 ? "0 0 12px rgba(37,99,235,0.45)" : undefined,
              }}
              title={`${d.label}: ${d.value}${suffix}`}
            />
            {/* A faint baseline keeps empty days legible as "no practice". */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
          </div>
          <span className="h-3 truncate text-[10px] text-dim">
            {index % labelEvery === 0 ? d.label : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
