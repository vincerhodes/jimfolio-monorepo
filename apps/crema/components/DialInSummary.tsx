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
    <div className="card p-6">
      <h2 className="text-lg font-semibold">Dial-in</h2>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="border-b border-[#e7e0d5] text-left text-[#7a6a5d]">
            <th className="py-2 pr-4 font-medium">Method</th>
            <th className="py-2 pr-4 font-medium">Grinder</th>
            <th className="py-2 pr-4 font-medium">Setting</th>
            <th className="py-2 pr-4 font-medium">Bean age</th>
            <th className="py-2 font-medium">Rating</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.methodLabel} className="border-b border-[#f0e9df]">
              <td className="py-2 pr-4">{entry.methodLabel}</td>
              <td className="py-2 pr-4">{entry.grinder ?? "—"}</td>
              <td className="py-2 pr-4">{entry.grindSetting}</td>
              <td className="py-2 pr-4 whitespace-nowrap">
                {entry.ageDays} day{entry.ageDays === 1 ? "" : "s"}
              </td>
              <td className="py-2 whitespace-nowrap">
                {entry.rating ? (
                  <>
                    <span className="text-amber-600">{"★".repeat(entry.rating)}</span>
                    <span className="text-[#d8cfc4]">{"☆".repeat(5 - entry.rating)}</span>
                  </>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
