import { formatDate } from "@/lib/coffee";

interface BrewPoint {
  brewDate: Date | string;
  rating: number | null;
  grindSetting: number | null;
}

interface BrewHistoryChartProps {
  brews: BrewPoint[];
}

interface SeriesPoint {
  date: Date;
  value: number;
}

const W = 320;
const H = 180;
const PAD_L = 30;
const PAD_R = 10;
const PAD_T = 12;
const PAD_B = 24;

function formatTickValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function Panel({
  title,
  points,
  yMin,
  yMax,
}: {
  title: string;
  points: SeriesPoint[];
  yMin: number;
  yMax: number;
}) {
  const tMin = points[0].date.getTime();
  const tMax = points[points.length - 1].date.getTime();
  const span = tMax - tMin;

  const x = (t: number) =>
    span === 0
      ? PAD_L + (W - PAD_L - PAD_R) / 2
      : PAD_L + ((t - tMin) / span) * (W - PAD_L - PAD_R);
  const y = (v: number) =>
    yMax === yMin
      ? PAD_T + (H - PAD_T - PAD_B) / 2
      : PAD_T + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B);

  const polyline = points.map((p) => `${x(p.date.getTime())},${y(p.value)}`).join(" ");

  const yMid = (yMin + yMax) / 2;
  const gridLines = [yMin, yMid, yMax];

  const midIdx = Math.floor((points.length - 1) / 2);
  const dateTicks = [
    { idx: 0, anchor: "start" as const },
    { idx: midIdx, anchor: "middle" as const },
    { idx: points.length - 1, anchor: "end" as const },
  ].filter(
    (tick, i, arr) => arr.findIndex((t) => t.idx === tick.idx) === i
  );

  return (
    <div>
      <h3 className="text-sm font-medium text-[#7a6a5d]">{title}</h3>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 h-auto w-full"
        role="img"
        aria-label={title}
      >
        {gridLines.map((g) => (
          <g key={g}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y(g)}
              y2={y(g)}
              stroke="#e7e0d5"
              strokeWidth="1"
            />
            <text
              x={PAD_L - 4}
              y={y(g)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-[#7a6a5d]"
              fontSize="9"
            >
              {formatTickValue(g)}
            </text>
          </g>
        ))}
        <polyline
          points={polyline}
          fill="none"
          stroke="#4a2c1a"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(p.date.getTime())}
            cy={y(p.value)}
            r="3"
            fill="#4a2c1a"
          >
            <title>{`${formatDate(p.date)} — ${formatTickValue(p.value)}`}</title>
          </circle>
        ))}
        {dateTicks.map((tick) => (
          <text
            key={tick.idx}
            x={x(points[tick.idx].date.getTime())}
            y={H - 6}
            textAnchor={tick.anchor}
            className="fill-[#7a6a5d]"
            fontSize="9"
          >
            {formatDate(points[tick.idx].date)}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function BrewHistoryChart({ brews }: BrewHistoryChartProps) {
  const sorted = [...brews].sort(
    (a, b) => new Date(a.brewDate).getTime() - new Date(b.brewDate).getTime()
  );

  const ratingPoints: SeriesPoint[] = sorted
    .filter((b) => b.rating !== null)
    .map((b) => ({ date: new Date(b.brewDate), value: b.rating as number }));

  const grindPoints: SeriesPoint[] = sorted
    .filter((b) => b.grindSetting !== null)
    .map((b) => ({ date: new Date(b.brewDate), value: b.grindSetting as number }));

  const showRating = ratingPoints.length >= 2;
  const showGrind = grindPoints.length >= 2;
  if (!showRating && !showGrind) return null;

  const grindValues = grindPoints.map((p) => p.value);
  const gMin = Math.min(...grindValues);
  const gMax = Math.max(...grindValues);
  const gPad = gMax === gMin ? Math.max(Math.abs(gMin) * 0.05, 1) : (gMax - gMin) * 0.05;

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold">Brew history</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {showRating && (
          <Panel
            title="Rating over time"
            points={ratingPoints}
            yMin={1}
            yMax={5}
          />
        )}
        {showGrind && (
          <Panel
            title="Grind setting trend"
            points={grindPoints}
            yMin={gMin - gPad}
            yMax={gMax + gPad}
          />
        )}
      </div>
    </div>
  );
}
