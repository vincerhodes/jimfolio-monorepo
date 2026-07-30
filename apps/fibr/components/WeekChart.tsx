// Port of src/components/WeekChart.tsx — 7-bar SVG chart. Day data is
// computed server-side in lib/stats.ts and passed in as props.
import type { WeekDay } from "@/lib/stats";

const BAR_WIDTH = 28;
const BAR_GAP = 8;
const CHART_HEIGHT = 80;

export default function WeekChart({
  days,
  goalFiberG,
}: {
  days: WeekDay[];
  goalFiberG: number;
}) {
  const totalWidth = 7 * BAR_WIDTH + 6 * BAR_GAP;

  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="mb-3 text-[13px] font-semibold text-gray-500">
        Last 7 days
      </div>
      <div className="flex flex-col items-center">
        <svg width={totalWidth} height={CHART_HEIGHT}>
          {days.map((day, i) => {
            const x = i * (BAR_WIDTH + BAR_GAP);
            const ratio = goalFiberG > 0 ? Math.min(1, day.fiber / goalFiberG) : 0;
            const barH = Math.max(4, ratio * (CHART_HEIGHT - 4));
            const y = CHART_HEIGHT - barH;
            const met = day.fiber >= goalFiberG && day.fiber > 0;
            const fill = day.fiber === 0 ? "#e5e7eb" : met ? "#10b981" : "#6ee7b7";
            return (
              <rect
                key={day.dateStr}
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={barH}
                rx={6}
                fill={fill}
              />
            );
          })}
        </svg>
        <div className="mt-1.5 flex">
          {days.map((day, i) => (
            <div
              key={day.dateStr}
              className="text-center text-[11px] font-semibold text-gray-400"
              style={{ width: BAR_WIDTH, marginRight: i < 6 ? BAR_GAP : 0 }}
            >
              {day.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
