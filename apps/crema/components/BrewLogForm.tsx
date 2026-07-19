"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { daysBetween } from "@/lib/coffee";

interface BrewMethod {
  id: string;
  label: string;
}

interface BrewLogFormProps {
  beanId: string;
  roastDate: string; // ISO string, serialized from the server component
}

function todayInputValue(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function BrewLogForm({ beanId, roastDate }: BrewLogFormProps) {
  const router = useRouter();
  const [methods, setMethods] = useState<BrewMethod[]>([]);
  const [methodId, setMethodId] = useState("");
  const [brewDate, setBrewDate] = useState(todayInputValue());
  const [grindSize, setGrindSize] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/crema/api/brew-methods")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: BrewMethod[]) => {
        setMethods(data);
        if (data.length > 0) setMethodId(data[0].id);
      })
      .catch(() => setMethods([]));
  }, []);

  const agePreview = brewDate
    ? daysBetween(new Date(roastDate), new Date(`${brewDate}T12:00:00`))
    : null;

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/crema/api/beans/${beanId}/brews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          methodId,
          brewDate: brewDate || undefined,
          grindSize: grindSize.trim() || undefined,
          rating: rating ?? undefined,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        setError("Couldn't log the brew. Check the fields and try again.");
        return;
      }
      setBrewDate(todayInputValue());
      setGrindSize("");
      setRating(null);
      setNotes("");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="space-y-4 rounded-lg border border-neutral-200 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading && methodId) submit();
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="brew-method" className="block text-sm font-medium">
            Method
          </label>
          <select
            id="brew-method"
            required
            value={methodId}
            onChange={(e) => setMethodId(e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            {methods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="brew-date" className="block text-sm font-medium">
            Brew date
          </label>
          <input
            id="brew-date"
            type="date"
            required
            value={brewDate}
            onChange={(e) => setBrewDate(e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          {agePreview !== null && (
            <p className="mt-1 text-xs text-neutral-500">
              Beans will be {agePreview} day{agePreview === 1 ? "" : "s"} old
            </p>
          )}
        </div>
        <div>
          <label htmlFor="brew-grind" className="block text-sm font-medium">
            Grind size
          </label>
          <input
            id="brew-grind"
            type="text"
            value={grindSize}
            onChange={(e) => setGrindSize(e.target.value)}
            placeholder="12 clicks"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium">Rating</span>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating((r) => (r === star ? null : star))}
              className={`text-2xl ${
                rating !== null && star <= rating
                  ? "text-amber-500"
                  : "text-neutral-300"
              }`}
              aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="brew-notes" className="block text-sm font-medium">
          Notes
        </label>
        <textarea
          id="brew-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !methodId}
        className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Logging…" : "Log brew"}
      </button>
    </form>
  );
}
