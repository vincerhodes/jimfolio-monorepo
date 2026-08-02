// Port of src/components/StreakBadge.tsx.
import { getStreakMessage } from "@/lib/constants";
import Icon from "@/components/Icon";

export default function StreakBadge({ days }: { days: number }) {
  const message = getStreakMessage(days);

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 ${
        days > 0 ? "bg-mint" : "bg-gray-50"
      }`}
    >
      {days > 0 ? (
        <Icon name="flame" className="h-7 w-7 text-amber-500" />
      ) : (
        <Icon name="sprout" className="h-7 w-7 text-primary" />
      )}
      <div>
        <div className="text-base font-bold text-ink">
          {days} day{days !== 1 ? "s" : ""}
        </div>
        <div className="text-xs text-gray-500">{message}</div>
      </div>
    </div>
  );
}
