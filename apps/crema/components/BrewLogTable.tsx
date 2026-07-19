import { daysBetween, formatDate } from "@/lib/coffee";

interface BrewLogTableProps {
  brews: {
    id: string;
    brewDate: Date;
    grindSize: string | null;
    rating: number | null;
    notes: string | null;
    method: { label: string };
  }[];
  roastDate: Date;
}

export default function BrewLogTable({ brews, roastDate }: BrewLogTableProps) {
  if (brews.length === 0) {
    return <p className="text-sm text-neutral-500">No brews logged yet.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-neutral-200 text-left text-neutral-500">
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
            <tr key={brew.id} className="border-b border-neutral-100">
              <td className="py-2 pr-4 whitespace-nowrap">{formatDate(brew.brewDate)}</td>
              <td className="py-2 pr-4">{brew.method.label}</td>
              <td className="py-2 pr-4">{brew.grindSize ?? "—"}</td>
              <td className="py-2 pr-4 whitespace-nowrap">
                {ageDays} day{ageDays === 1 ? "" : "s"}
              </td>
              <td className="py-2 pr-4 whitespace-nowrap">
                {brew.rating
                  ? "★".repeat(brew.rating) + "☆".repeat(5 - brew.rating)
                  : "—"}
              </td>
              <td className="py-2">{brew.notes ?? ""}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
