"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { daysBetween } from "@/lib/coffee";
import { API_BASE } from "@/lib/api-base";

interface BrewMethod {
  id: string;
  label: string;
}

interface BrewLogFormProps {
  beanId: string;
  roastDate: string; // ISO string, serialized from the server component
  grinders: string[]; // distinct grinder names used before, for the datalist
}

function todayInputValue(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function BrewLogForm({ beanId, roastDate, grinders }: BrewLogFormProps) {
  const router = useRouter();
  const [methods, setMethods] = useState<BrewMethod[]>([]);
  const [methodId, setMethodId] = useState("");
  const [brewDate, setBrewDate] = useState(todayInputValue());
  const [grinder, setGrinder] = useState("");
  const [grindSetting, setGrindSetting] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/brew-methods`)
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
      const res = await fetch(`${API_BASE}/api/beans/${beanId}/brews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          methodId,
          brewDate: brewDate || undefined,
          grinder: grinder.trim() || undefined,
          grindSetting:
            grindSetting.trim() === "" ? undefined : Number(grindSetting),
          rating: rating ?? undefined,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        setError("Couldn't log the brew. Check the fields and try again.");
        return;
      }
      setBrewDate(todayInputValue());
      setGrinder("");
      setGrindSetting("");
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
      className="card space-y-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading && methodId) submit();
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label htmlFor="brew-method" className="block text-sm font-medium">
            Method
          </label>
          <select
            id="brew-method"
            required
            value={methodId}
            onChange={(e) => setMethodId(e.target.value)}
            className="input"
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
            className="input"
          />
          {agePreview !== null && (
            <p className="mt-1 text-xs text-[#7a6a5d]">
              Beans will be {agePreview} day{agePreview === 1 ? "" : "s"} old
            </p>
          )}
        </div>
        <div>
          <label htmlFor="brew-grinder" className="block text-sm font-medium">
            Grinder
          </label>
          <input
            id="brew-grinder"
            type="text"
            list="grinder-options"
            value={grinder}
            onChange={(e) => setGrinder(e.target.value)}
            placeholder="Comandante"
            className="input"
          />
          <datalist id="grinder-options">
            {grinders.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="brew-grind-setting" className="block text-sm font-medium">
            Grind setting
          </label>
          <input
            id="brew-grind-setting"
            type="number"
            step="0.5"
            min="0"
            max="100"
            value={grindSetting}
            onChange={(e) => setGrindSetting(e.target.value)}
            placeholder="22"
            className="input"
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
                  : "text-[#d8cfc4]"
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
          className="input"
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
        className="btn-primary"
      >
        {loading ? "Logging…" : "Log brew"}
      </button>
    </form>
  );
}
