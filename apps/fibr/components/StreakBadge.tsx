// Port of src/components/StreakBadge.tsx.
import { getStreakMessage } from "@/lib/constants";

export default function StreakBadge({ days }: { days: number }) {
  const message = getStreakMessage(days);

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 ${
        days > 0 ? "bg-mint" : "bg-gray-50"
      }`}
    >
      <span className="text-2xl">{days > 0 ? "🔥" : "🌱"}</span>
      <div>
        <div className="text-base font-bold text-ink">
          {days} day{days !== 1 ? "s" : ""}
        </div>
        <div className="text-xs text-gray-500">{message}</div>
      </div>
    </div>
  );
}
