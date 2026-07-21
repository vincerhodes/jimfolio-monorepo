"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { daysBetween, formatDate } from "@/lib/coffee";
import { API_BASE } from "@/lib/api-base";

interface Brew {
  id: string;
  brewDate: Date;
  grindSize: string | null;
  grinder: string | null;
  grindSetting: number | null;
  rating: number | null;
  notes: string | null;
  methodId: string;
  method: { label: string };
}

interface BrewLogTableProps {
  beanId: string;
  brews: Brew[];
  roastDate: Date;
  grinders: string[]; // distinct grinder names used before, for the datalist
}

interface BrewMethod {
  id: string;
  label: string;
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

function dateInputValue(date: Date): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface EditState {
  brewDate: string;
  methodId: string;
  grinder: string;
  grindSetting: string;
  rating: number | null;
  notes: string;
}

function toEditState(brew: Brew): EditState {
  return {
    brewDate: dateInputValue(brew.brewDate),
    methodId: brew.methodId,
    grinder: brew.grinder ?? "",
    grindSetting: brew.grindSetting !== null ? String(brew.grindSetting) : "",
    rating: brew.rating,
    notes: brew.notes ?? "",
  };
}

export default function BrewLogTable({ beanId, brews, roastDate, grinders }: BrewLogTableProps) {
  const router = useRouter();
  const [methods, setMethods] = useState<BrewMethod[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/brew-methods`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: BrewMethod[]) => setMethods(data))
      .catch(() => setMethods([]));
  }, []);

  function startEdit(brew: Brew) {
    setEditingId(brew.id);
    setEdit(toEditState(brew));
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEdit(null);
    setError(null);
  }

  async function saveEdit(brewId: string) {
    if (!edit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/beans/${beanId}/brews/${brewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          methodId: edit.methodId,
          brewDate: edit.brewDate || undefined,
          grinder: edit.grinder.trim() || null,
          grindSetting: edit.grindSetting.trim() === "" ? null : Number(edit.grindSetting),
          rating: edit.rating,
          notes: edit.notes.trim() || null,
        }),
      });
      if (!res.ok) {
        setError("Couldn't save. Check the fields and try again.");
        return;
      }
      cancelEdit();
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(brewId: string) {
    if (!window.confirm("Delete this brew? This can't be undone.")) return;
    setDeletingId(brewId);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/beans/${beanId}/brews/${brewId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Couldn't delete. Try again.");
        return;
      }
      if (editingId === brewId) cancelEdit();
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setDeletingId(null);
    }
  }

  if (brews.length === 0) {
    return <p className="text-sm text-[#7a6a5d]">☕ No brews logged yet — log your first brew below.</p>;
  }

  return (
    <>
      {error && (
        <p className="mb-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e7e0d5] text-left text-[#7a6a5d]">
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Method</th>
            <th className="py-2 pr-4 font-medium">Grind</th>
            <th className="py-2 pr-4 font-medium">Age</th>
            <th className="py-2 pr-4 font-medium">Rating</th>
            <th className="py-2 pr-4 font-medium">Notes</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {brews.map((brew) => {
            if (editingId === brew.id && edit) {
              return (
                <tr key={brew.id} className="border-b border-[#f0e9df]">
                  <td colSpan={7} className="py-3">
                    <form
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!saving && edit.methodId) saveEdit(brew.id);
                      }}
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                        <div>
                          <label htmlFor={`edit-method-${brew.id}`} className="block text-sm font-medium">
                            Method
                          </label>
                          <select
                            id={`edit-method-${brew.id}`}
                            required
                            value={edit.methodId}
                            onChange={(e) => setEdit({ ...edit, methodId: e.target.value })}
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
                          <label htmlFor={`edit-date-${brew.id}`} className="block text-sm font-medium">
                            Brew date
                          </label>
                          <input
                            id={`edit-date-${brew.id}`}
                            type="date"
                            required
                            value={edit.brewDate}
                            onChange={(e) => setEdit({ ...edit, brewDate: e.target.value })}
                            className="input"
                          />
                        </div>
                        <div>
                          <label htmlFor={`edit-grinder-${brew.id}`} className="block text-sm font-medium">
                            Grinder
                          </label>
                          <input
                            id={`edit-grinder-${brew.id}`}
                            type="text"
                            list="grinder-options"
                            value={edit.grinder}
                            onChange={(e) => setEdit({ ...edit, grinder: e.target.value })}
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
                          <label htmlFor={`edit-setting-${brew.id}`} className="block text-sm font-medium">
                            Grind setting
                          </label>
                          <input
                            id={`edit-setting-${brew.id}`}
                            type="number"
                            step="0.5"
                            min="0"
                            max="100"
                            value={edit.grindSetting}
                            onChange={(e) => setEdit({ ...edit, grindSetting: e.target.value })}
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
                              onClick={() =>
                                setEdit({ ...edit, rating: edit.rating === star ? null : star })
                              }
                              className={`text-2xl ${
                                edit.rating !== null && star <= edit.rating
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
                        <label htmlFor={`edit-notes-${brew.id}`} className="block text-sm font-medium">
                          Notes
                        </label>
                        <textarea
                          id={`edit-notes-${brew.id}`}
                          value={edit.notes}
                          onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
                          rows={2}
                          className="input"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button type="submit" disabled={saving || !edit.methodId} className="btn-primary btn-sm">
                          {saving ? "Saving…" : "Save changes"}
                        </button>
                        <button type="button" onClick={cancelEdit} disabled={saving} className="btn-secondary btn-sm">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              );
            }

            const ageDays = daysBetween(new Date(roastDate), new Date(brew.brewDate));
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
                <td className="py-2 pr-4">{brew.notes ?? ""}</td>
                <td className="py-2 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => startEdit(brew)}
                    disabled={editingId !== null}
                    className="text-sm text-[#7a6a5d] hover:underline disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(brew.id)}
                    disabled={deletingId === brew.id}
                    className="ml-3 text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deletingId === brew.id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
