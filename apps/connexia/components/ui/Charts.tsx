import Link from "next/link";
import type { ReactNode } from "react";

type DonutDatum = {
  label: string;
  value: number;
  color: string;
  href?: string;
};

type BarDatum = {
  label: string;
  value: number;
  color: string;
  href?: string;
};

export function ChartCard({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <section className="cx-panel rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold tracking-tight">{title}</div>
          {subtitle ? <div className="mt-1 text-xs cx-muted">{subtitle}</div> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function DonutChart({
  data,
  centerLabel,
}: {
  data: DonutDatum[];
  centerLabel?: { title: string; subtitle?: string };
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const size = 160;
  const r = 62;
  const stroke = 18;
  const cx = size / 2;
  const cy = size / 2;

  let cursor = 0;
  const segments = total > 0
    ? data
        .filter((d) => d.value > 0)
        .map((d) => {
          const angle = (d.value / total) * 360;
          const start = cursor;
          const end = cursor + angle;
          cursor = end;
          return {
            ...d,
            start,
            end,
            d: describeArc(cx, cy, r, start, end),
          };
        })
    : [];

  return (
    <div className="grid grid-cols-[170px_1fr] gap-5 items-center">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="rgba(15, 23, 42, 0.10)" strokeWidth={stroke} />
          {segments.map((s) => (
            <path
              key={s.label}
              d={s.d}
              fill="transparent"
              stroke={s.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        {centerLabel ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-semibold tracking-tight">{centerLabel.title}</div>
            {centerLabel.subtitle ? <div className="mt-1 text-xs cx-muted">{centerLabel.subtitle}</div> : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-2">
        {data.map((d) => {
          const row = (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100 transition">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-sm text-slate-700 truncate">{d.label}</span>
              </div>
              <div className="text-sm font-medium tabular-nums text-slate-900">{d.value}</div>
            </div>
          );

          return d.href ? (
            <Link key={d.label} href={d.href} className="block">
              {row}
            </Link>
          ) : (
            <div key={d.label}>{row}</div>
          );
        })}
      </div>
    </div>
  );
}

export function BarChart({ data, maxLabelWidth = 140 }: { data: BarDatum[]; maxLabelWidth?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="grid gap-2">
      {data.map((d) => {
        const row = (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100 transition">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-slate-700 truncate" style={{ maxWidth: maxLabelWidth }}>
                {d.label}
              </div>
              <div className="text-sm font-medium tabular-nums text-slate-900">{d.value}</div>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.round((d.value / max) * 100)}%`, backgroundColor: d.color }} />
            </div>
          </div>
        );

        return d.href ? (
          <Link key={d.label} href={d.href} className="block">
            {row}
          </Link>
        ) : (
          <div key={d.label}>{row}</div>
        );
      })}
    </div>
  );
}
