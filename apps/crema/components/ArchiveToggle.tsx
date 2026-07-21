"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api-base";

interface ArchiveToggleProps {
  beanId: string;
  archived: boolean;
}

export default function ArchiveToggle({ beanId, archived }: ArchiveToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/beans/${beanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !archived }),
      });
      if (!res.ok) {
        setError("Couldn't update. Try again.");
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
        {loading ? "Updating…" : archived ? "Unarchive" : "Archive"}
      </button>
      {error && (
        <span className="text-sm text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
