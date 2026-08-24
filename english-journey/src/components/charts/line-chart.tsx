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
  const gradientId = useId();
  const hasData = data.some((d) => d.value > 0);
  if (!data.length || !hasData) {
    return (
      <div
        className="grid place-items-center rounded-xl bg-surface-2 text-sm text-muted"
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
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.5, 1].map((fraction) => (
        <g key={fraction}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + innerH * fraction}
            y2={padding.top + innerH * fraction}
            stroke="var(--border)"
            strokeDasharray="3 4"
          />
          <text
            x={4}
            y={padding.top + innerH * fraction + 4}
            fontSize="10"
            fill="var(--text-muted)"
          >
            {Math.round(max * (1 - fraction))}
          </text>
        </g>
      ))}

      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" />

      {data.map((d, i) =>
        d.value > 0 ? (
          <circle key={d.label + i} cx={x(i)} cy={y(d.value)} r="3" fill="var(--brand)">
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
            fill="var(--text-muted)"
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
        className="grid place-items-center rounded-xl bg-surface-2 text-sm text-muted"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-lg bg-brand transition-[height] duration-500"
              style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0)}%` }}
              title={`${d.label}: ${d.value}${suffix}`}
            />
          </div>
          <span className="truncate text-[10px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
