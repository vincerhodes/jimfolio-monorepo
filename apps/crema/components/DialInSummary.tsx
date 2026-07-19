interface DialInEntry {
  methodLabel: string;
  grinder: string | null;
  grindSetting: number;
  ageDays: number;
  rating: number | null;
}

interface DialInSummaryProps {
  entries: DialInEntry[];
}

export default function DialInSummary({ entries }: DialInSummaryProps) {
  if (entries.length === 0) return null;

  return (
    <div className="rounded-lg border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold">Dial-in</h2>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th className="py-2 pr-4 font-medium">Method</th>
            <th className="py-2 pr-4 font-medium">Grinder</th>
            <th className="py-2 pr-4 font-medium">Setting</th>
            <th className="py-2 pr-4 font-medium">Bean age</th>
            <th className="py-2 font-medium">Rating</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.methodLabel} className="border-b border-neutral-100">
              <td className="py-2 pr-4">{entry.methodLabel}</td>
              <td className="py-2 pr-4">{entry.grinder ?? "—"}</td>
              <td className="py-2 pr-4">{entry.grindSetting}</td>
              <td className="py-2 pr-4 whitespace-nowrap">
                {entry.ageDays} day{entry.ageDays === 1 ? "" : "s"}
              </td>
              <td className="py-2 whitespace-nowrap">
                {entry.rating
                  ? "★".repeat(entry.rating) + "☆".repeat(5 - entry.rating)
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
