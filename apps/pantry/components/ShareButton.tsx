"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api-base";

export default function ShareButton({
  id,
  isPublic,
}: {
  id: string;
  isPublic: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/recipes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (!res.ok) {
        setError("Couldn't update sharing. Try again.");
        return;
      }
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
        onClick={toggle}
        disabled={loading}
        className="btn-secondary btn-sm"
      >
        {loading ? "Updating…" : isPublic ? "Unshare" : "Share"}
      </button>
      {isPublic && (
        <span className="text-sm text-[#7a6a5d]">
          Shared — other users can see this recipe.
        </span>
      )}
      {error && (
        <span className="text-sm text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
