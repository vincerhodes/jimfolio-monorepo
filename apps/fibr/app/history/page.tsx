import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BASE_PATH, getSessionUser } from "@/lib/auth";
import { getLocalDateString } from "@/lib/fiber";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string): string {
  const today = new Date();
  const date = new Date(dateStr + "T00:00:00");
  const diffMs = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: today.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
  });
}

export default async function HistoryPage() {
  const user = await getSessionUser();
  if (!user) redirect(`${BASE_PATH}/login`);

  const goalFiberG = user.goalFiberG;
  const entries = await db.fiberEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const groupedByDate = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const date = getLocalDateString(entry.createdAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <main className="mx-auto max-w-2xl pb-12">
      <div className="px-6 pb-2 pt-4">
        <h1 className="text-2xl font-extrabold text-ink">History</h1>
      </div>

      {entries.length === 0 ? (
        <div className="pt-24 text-center">
          <Icon name="leaf" className="mx-auto mb-3 h-12 w-12 text-emerald-200" />
          <p className="whitespace-pre-line text-gray-400">
            {"No entries yet.\nStart logging to build your history!"}
          </p>
        </div>
      ) : (
        <div className="px-6">
          {sortedDates.map((date) => {
            const dayEntries = groupedByDate[date];
            const dayTotal = dayEntries.reduce((sum, e) => sum + e.fiberG, 0);
            const met = dayTotal >= goalFiberG;

            return (
              <div key={date} className="mb-5">
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-500">
                        {formatDate(date)}
                      </span>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          met ? "bg-primary" : "bg-gray-300"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        met ? "text-primary" : "text-gray-500"
                      }`}
                    >
                      {dayTotal.toFixed(1)}g fiber
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-sm bg-gray-100">
                    <div
                      className={`h-1 rounded-sm ${met ? "bg-primary" : "bg-emerald-300"}`}
                      style={{
                        width: `${Math.min(100, (dayTotal / goalFiberG) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                {dayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between border-b border-gray-100 py-2.5"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-ink">
                        {entry.foodName}
                      </div>
                      <div className="text-xs text-gray-400">{entry.grams}g</div>
                    </div>
                    <div className="mr-3 text-sm font-bold text-primary">
                      +{entry.fiberG.toFixed(1)}g
                    </div>
                    <DeleteEntryButton entryId={entry.id} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
