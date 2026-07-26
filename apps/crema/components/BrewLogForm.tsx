"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { daysBetween, grinderDisplayName, equipmentDisplayName } from "@/lib/coffee";
import { API_BASE } from "@/lib/api-base";

interface BrewMethod {
  id: string;
  label: string;
}

interface GrinderOption {
  id: string;
  manufacturer: string | null;
  model: string | null;
  archived: boolean;
}

interface EquipmentOption {
  id: string;
  manufacturer: string | null;
  model: string | null;
  archived: boolean;
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
  const [grinders, setGrinders] = useState<GrinderOption[]>([]);
  const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
  const [methodId, setMethodId] = useState("");
  const [brewDate, setBrewDate] = useState(todayInputValue());
  const [grinderId, setGrinderId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [grindSetting, setGrindSetting] = useState("");
  const [doseG, setDoseG] = useState("");
  const [yieldG, setYieldG] = useState("");
  const [brewTimeSec, setBrewTimeSec] = useState("");
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
    fetch(`${API_BASE}/api/grinders`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: GrinderOption[]) =>
        setGrinders(data.filter((g) => !g.archived))
      )
      .catch(() => setGrinders([]));
    fetch(`${API_BASE}/api/equipment`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: EquipmentOption[]) =>
        setEquipment(data.filter((e) => !e.archived))
      )
      .catch(() => setEquipment([]));
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
          grinderId: grinderId || undefined,
          equipmentId: equipmentId || undefined,
          grindSetting:
            grindSetting.trim() === "" ? undefined : Number(grindSetting),
          doseG: doseG.trim() === "" ? undefined : Number(doseG),
          yieldG: yieldG.trim() === "" ? undefined : Number(yieldG),
          brewTimeSec:
            brewTimeSec.trim() === "" ? undefined : Number(brewTimeSec),
          rating: rating ?? undefined,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        setError("Couldn't log the brew. Check the fields and try again.");
        return;
      }
      setBrewDate(todayInputValue());
      setGrinderId("");
      setEquipmentId("");
      setGrindSetting("");
      setDoseG("");
      setYieldG("");
      setBrewTimeSec("");
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
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
          <select
            id="brew-grinder"
            value={grinderId}
            onChange={(e) => setGrinderId(e.target.value)}
            className="input"
          >
            <option value="">— none —</option>
            {grinders.map((g) => (
              <option key={g.id} value={g.id}>
                {grinderDisplayName(g)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="brew-equipment" className="block text-sm font-medium">
            Equipment
          </label>
          <select
            id="brew-equipment"
            value={equipmentId}
            onChange={(e) => setEquipmentId(e.target.value)}
            className="input"
          >
            <option value="">— none —</option>
            {equipment.map((e) => (
              <option key={e.id} value={e.id}>
                {equipmentDisplayName(e)}
              </option>
            ))}
          </select>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="brew-dose" className="block text-sm font-medium">
            Dose (g)
          </label>
          <input
            id="brew-dose"
            type="number"
            step="0.1"
            min="0"
            value={doseG}
            onChange={(e) => setDoseG(e.target.value)}
            placeholder="18"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="brew-yield" className="block text-sm font-medium">
            Yield (g)
          </label>
          <input
            id="brew-yield"
            type="number"
            step="0.1"
            min="0"
            value={yieldG}
            onChange={(e) => setYieldG(e.target.value)}
            placeholder="36"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="brew-time" className="block text-sm font-medium">
            Time (s)
          </label>
          <input
            id="brew-time"
            type="number"
            step="1"
            min="0"
            value={brewTimeSec}
            onChange={(e) => setBrewTimeSec(e.target.value)}
            placeholder="28"
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
              className={`p-1 text-2xl ${
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
