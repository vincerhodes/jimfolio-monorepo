"use client";

// Port of app/(tabs)/settings.tsx: display name, daily goal (1–200g), stats,
// JSON export, clear all data.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api-base";

function StatItem({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl">{emoji}</div>
      <div className="mt-1 text-xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

export default function SettingsClient({
  displayName,
  goalFiberG,
  streakDays,
  totalEntries,
  totalFiber,
}: {
  displayName: string;
  goalFiberG: number;
  streakDays: number;
  totalEntries: number;
  totalFiber: number;
}) {
  const router = useRouter();
  const [goalInput, setGoalInput] = useState(String(goalFiberG));
  const [editingGoal, setEditingGoal] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [editingName, setEditingName] = useState(false);
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  async function patchSettings(data: { displayName?: string; goalFiberG?: number }) {
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      setError("Couldn't save. Try again.");
      return false;
    }
    setError("");
    router.refresh();
    return true;
  }

  async function handleSaveGoal() {
    const g = parseInt(goalInput, 10);
    if (isNaN(g) || g < 1 || g > 200) {
      setError("Goal must be a number between 1 and 200.");
      return;
    }
    if (await patchSettings({ goalFiberG: g })) setEditingGoal(false);
  }

  async function handleSaveName() {
    const name = nameInput.trim();
    if (!name) {
      setError("Enter a name.");
      return;
    }
    if (await patchSettings({ displayName: name })) setEditingName(false);
  }

  async function handleClearData() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setClearing(true);
    try {
      await fetch(`${API_BASE}/api/settings/clear`, { method: "DELETE" });
      setConfirmClear(false);
      router.refresh();
    } finally {
      setClearing(false);
    }
  }

  return (
    <div>
      {error !== "" && (
        <div className="mx-6 mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Display name */}
      <div className="mb-7 px-6">
        <div className="mb-2 text-xs font-bold uppercase text-gray-400">Your Name</div>
        <div className="rounded-2xl bg-gray-50 p-4">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); }}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="rounded-lg bg-primary px-4 py-2.5 font-bold text-white hover:bg-primarydark"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setNameInput(displayName); setEditingName(true); }}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <div className="text-xl font-bold text-ink">{displayName}</div>
                <div className="mt-0.5 text-xs text-gray-400">Tap to change</div>
              </div>
              <span className="text-2xl">✏️</span>
            </button>
          )}
        </div>
      </div>

      {/* Daily goal */}
      <div className="mb-7 px-6">
        <div className="mb-2 text-xs font-bold uppercase text-gray-400">Daily Fiber Goal</div>
        <div className="rounded-2xl bg-gray-50 p-4">
          {editingGoal ? (
            <div className="flex items-center gap-2">
              <input
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                inputMode="numeric"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveGoal(); }}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-center text-lg focus:border-primary focus:outline-none"
              />
              <span className="text-base text-gray-500">g</span>
              <button
                type="button"
                onClick={handleSaveGoal}
                className="rounded-lg bg-primary px-4 py-2.5 font-bold text-white hover:bg-primarydark"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setGoalInput(String(goalFiberG)); setEditingGoal(true); }}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <div className="text-2xl font-extrabold text-primary">{goalFiberG}g</div>
                <div className="mt-0.5 text-xs text-gray-400">Tap to change</div>
              </div>
              <span className="text-2xl">✏️</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-7 px-6">
        <div className="mb-2 text-xs font-bold uppercase text-gray-400">Your Stats</div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="flex justify-around">
            <StatItem label="Streak" value={`${streakDays}`} emoji="🔥" />
            <StatItem label="Entries" value={`${totalEntries}`} emoji="📝" />
            <StatItem label="Total fiber" value={`${totalFiber.toFixed(0)}g`} emoji="🌿" />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="mb-7 px-6">
        <div className="mb-2 text-xs font-bold uppercase text-gray-400">About</div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="text-sm text-gray-500">Fibr v1.0.0</div>
          <div className="mt-1 text-xs text-gray-400">
            Nutrition data from USDA FoodData Central
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Data stored securely in your account
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="mb-3 px-6">
        <a
          href={`${API_BASE}/api/export`}
          download="fibr-data.json"
          className="block rounded-xl bg-mintlight py-4 text-center text-base font-semibold text-primary"
        >
          Export Data (JSON)
        </a>
      </div>

      {/* Clear data */}
      <div className="px-6">
        <button
          type="button"
          onClick={handleClearData}
          disabled={clearing}
          className="w-full rounded-xl bg-red-50 py-4 text-center text-base font-semibold text-red-500 disabled:opacity-50"
        >
          {confirmClear ? "Tap again to confirm — this deletes everything" : "Clear All Data"}
        </button>
      </div>
    </div>
  );
}
