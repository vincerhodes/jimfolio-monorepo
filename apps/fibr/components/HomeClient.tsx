"use client";

// Interactive parts of the Home tab: today's log (delete), suggestion cards
// with gram stepper, toast, and the goal-celebration overlay.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api-base";
import { calculateFiber, formatFiber } from "@/lib/fiber";
import type { EntryDto, Suggestion } from "@/lib/types";
import DeleteEntryButton from "@/components/DeleteEntryButton";

export default function HomeClient({
  todayEntries,
  todayFiber,
  goalFiberG,
  suggestions,
}: {
  todayEntries: EntryDto[];
  todayFiber: number;
  goalFiberG: number;
  suggestions: Suggestion[];
}) {
  const router = useRouter();
  const [logSuggestion, setLogSuggestion] = useState<Suggestion | null>(null);
  const [logGramsStr, setLogGramsStr] = useState("0");
  const [logging, setLogging] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [celebrating, setCelebrating] = useState(false);
  const goalMetRef = useRef(todayFiber >= goalFiberG);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Goal-celebration overlay: fires once when today's fiber crosses the goal.
  useEffect(() => {
    if (todayFiber >= goalFiberG && !goalMetRef.current) {
      goalMetRef.current = true;
      setCelebrating(true);
      const t = setTimeout(() => setCelebrating(false), 2300);
      return () => clearTimeout(t);
    }
    if (todayFiber < goalFiberG) {
      goalMetRef.current = false;
    }
  }, [todayFiber, goalFiberG]);

  function showToast(msg: string) {
    setToastMessage(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(""), 3000);
  }

  function handleSuggestionLog(suggestion: Suggestion) {
    setLogSuggestion(suggestion);
    setLogGramsStr(String(suggestion.typicalServingG ?? 25));
    setLogging(false);
  }

  async function handleConfirmLog() {
    if (!logSuggestion || logging) return;
    const grams = Math.max(1, parseFloat(logGramsStr) || 1);
    setLogging(true);
    try {
      const res = await fetch(`${API_BASE}/api/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName: logSuggestion.name,
          fiberPer100g: logSuggestion.fiberPer100g,
          grams,
        }),
      });
      if (!res.ok) {
        showToast("Couldn't log entry. Try again.");
        return;
      }
      setLogSuggestion(null);
      showToast(
        `${logSuggestion.name} (${grams}g) — ${formatFiber(calculateFiber(logSuggestion.fiberPer100g, grams))} fiber added`
      );
      router.refresh();
    } finally {
      setLogging(false);
    }
  }

  const logGrams = Math.max(1, parseFloat(logGramsStr) || 1);

  return (
    <>
      {toastMessage !== "" && (
        <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-3rem)] max-w-xl -translate-x-1/2 rounded-xl bg-primary p-4 text-center text-sm font-bold text-white shadow-lg">
          {toastMessage}
        </div>
      )}

      {celebrating && (
        <div className="fixed left-1/2 top-4 z-40 w-[calc(100%-3rem)] max-w-xl -translate-x-1/2 animate-pulse rounded-xl bg-primarydark p-4 text-center text-base font-extrabold text-white shadow-lg">
          🎉 Daily goal reached! Keep it up!
        </div>
      )}

      {todayEntries.length > 0 && (
        <div className="mb-6 px-6">
          <h2 className="mb-3 text-base font-bold text-ink">Today&apos;s log</h2>
          {todayEntries.map((entry) => (
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
              <div className="mr-3 text-[15px] font-bold text-primary">
                +{entry.fiberG.toFixed(1)}g
              </div>
              <DeleteEntryButton entryId={entry.id} />
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 px-6 text-base font-bold text-ink">
            Next sprouts to try 🌿
          </h2>
          <div className="flex gap-3 overflow-x-auto px-6 pb-1">
            {suggestions.map((s) => (
              <div
                key={s.name}
                className="w-44 shrink-0 rounded-2xl bg-mint p-4 shadow-sm"
              >
                <div className="mb-1 text-base font-bold text-emerald-900">
                  {s.emoji} {s.name}
                </div>
                <div className="mb-1 text-xs font-semibold text-emerald-700">
                  {s.fiberPer100g}g fiber / 100g
                </div>
                <div className="mb-3 text-[11px] text-gray-500">{s.reason}</div>
                <button
                  type="button"
                  onClick={() => handleSuggestionLog(s)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primarydark"
                >
                  Log it
                </button>
              </div>
            ))}
          </div>

          {logSuggestion && (
            <div className="mx-6 mt-3 rounded-2xl border-2 border-primary bg-mintlight p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-base font-bold text-emerald-900">
                    {logSuggestion.emoji} {logSuggestion.name}
                  </div>
                  <div className="mt-0.5 text-[13px] text-emerald-700">
                    {logSuggestion.fiberPer100g}g fiber per 100g
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLogSuggestion(null)}
                  aria-label="Close"
                  className="text-xl text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setLogGramsStr((s) =>
                      String(Math.max(5, (parseFloat(s) || 5) - 5))
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-900"
                >
                  −
                </button>

                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      value={logGramsStr}
                      onChange={(e) => setLogGramsStr(e.target.value)}
                      onBlur={() =>
                        setLogGramsStr(String(Math.max(1, parseFloat(logGramsStr) || 1)))
                      }
                      inputMode="decimal"
                      className="w-20 border-b-2 border-primary bg-transparent pb-0.5 text-center text-3xl font-extrabold text-ink focus:outline-none"
                    />
                    <span className="text-lg font-semibold text-gray-500">g</span>
                  </div>
                  <div className="mt-1 text-[13px] font-bold text-primary">
                    = {formatFiber(calculateFiber(logSuggestion.fiberPer100g, logGrams))} fiber
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setLogGramsStr((s) => String((parseFloat(s) || 0) + 5))
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-900"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmLog}
                disabled={logging}
                className="mt-3 w-full rounded-lg bg-primary py-3.5 text-[15px] font-bold text-white hover:bg-primarydark disabled:opacity-60"
              >
                Add to today&apos;s log
              </button>
            </div>
          )}
        </div>
      )}

      {todayEntries.length === 0 && (
        <div className="px-6 pt-4 text-center">
          <div className="mb-2 text-5xl">🥦</div>
          <p className="whitespace-pre-line text-base text-gray-400">
            {"No entries yet today.\nSearch a food to get started!"}
          </p>
          <Link
            href="/search"
            className="mt-4 inline-block rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-white hover:bg-primarydark"
          >
            Browse foods
          </Link>
        </div>
      )}
    </>
  );
}
