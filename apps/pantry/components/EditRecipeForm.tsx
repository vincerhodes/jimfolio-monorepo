"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api-base";

interface EditRecipeFormProps {
  id: string;
  title: string;
  servings: number | null;
}

export default function EditRecipeForm({ id, title, servings }: EditRecipeFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editServings, setEditServings] = useState(servings ? String(servings) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cancel() {
    setEditTitle(title);
    setEditServings(servings ? String(servings) : "");
    setError(null);
    setOpen(false);
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/recipes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          servings: editServings.trim() === "" ? null : Number(editServings),
        }),
      });
      if (!res.ok) {
        setError("Couldn't save. Check the fields and try again.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary btn-sm"
      >
        Edit
      </button>
    );
  }

  return (
    <form
      className="card w-full space-y-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading && editTitle.trim()) submit();
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="edit-recipe-title" className="block text-sm font-medium">
            Title <span className="text-red-600">*</span>
          </label>
          <input
            id="edit-recipe-title"
            type="text"
            required
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="edit-recipe-servings" className="block text-sm font-medium">
            Servings
          </label>
          <input
            id="edit-recipe-servings"
            type="number"
            min={1}
            value={editServings}
            onChange={(e) => setEditServings(e.target.value)}
            placeholder="2"
            className="input"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading || !editTitle.trim()} className="btn-primary">
          {loading ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={cancel} disabled={loading} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
