"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api-base";

export default function DeleteRecipeButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm("Delete this recipe? This can't be undone.")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/recipes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Couldn't delete. Try again.");
        return;
      }
      router.push("/saved");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={remove}
        disabled={loading}
        className="btn-secondary btn-sm text-red-600"
      >
        {loading ? "Deleting…" : "Delete"}
      </button>
      {error && (
        <span className="text-sm text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
