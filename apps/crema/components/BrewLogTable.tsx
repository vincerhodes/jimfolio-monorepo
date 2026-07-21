import { daysBetween, formatDate } from "@/lib/coffee";

interface BrewLogTableProps {
  brews: {
    id: string;
    brewDate: Date;
    grindSize: string | null;
    grinder: string | null;
    grindSetting: number | null;
    rating: number | null;
    notes: string | null;
    method: { label: string };
  }[];
  roastDate: Date;
}

function formatGrind(brew: {
  grindSize: string | null;
  grinder: string | null;
  grindSetting: number | null;
}): string {
  if (brew.grinder && brew.grindSetting !== null) {
    return `${brew.grinder} · ${brew.grindSetting}`;
  }
  if (brew.grinder) return brew.grinder;
  if (brew.grindSetting !== null) return String(brew.grindSetting);
  return brew.grindSize ?? "—";
}

export default function BrewLogTable({ brews, roastDate }: BrewLogTableProps) {
  if (brews.length === 0) {
    return <p className="text-sm text-[#7a6a5d]">☕ No brews logged yet — log your first brew below.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[#e7e0d5] text-left text-[#7a6a5d]">
          <th className="py-2 pr-4 font-medium">Date</th>
          <th className="py-2 pr-4 font-medium">Method</th>
          <th className="py-2 pr-4 font-medium">Grind</th>
          <th className="py-2 pr-4 font-medium">Age</th>
          <th className="py-2 pr-4 font-medium">Rating</th>
          <th className="py-2 font-medium">Notes</th>
        </tr>
      </thead>
      <tbody>
        {brews.map((brew) => {
          const ageDays = daysBetween(roastDate, brew.brewDate);
          return (
            <tr key={brew.id} className="border-b border-[#f0e9df]">
              <td className="py-2 pr-4 whitespace-nowrap">{formatDate(brew.brewDate)}</td>
              <td className="py-2 pr-4">{brew.method.label}</td>
              <td className="py-2 pr-4">{formatGrind(brew)}</td>
              <td className="py-2 pr-4 whitespace-nowrap">
                {ageDays} day{ageDays === 1 ? "" : "s"}
              </td>
              <td className="py-2 pr-4 whitespace-nowrap">
                {brew.rating ? (
                  <>
                    <span className="text-amber-600">{"★".repeat(brew.rating)}</span>
                    <span className="text-[#d8cfc4]">{"☆".repeat(5 - brew.rating)}</span>
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td className="py-2">{brew.notes ?? ""}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
