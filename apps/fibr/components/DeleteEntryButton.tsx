"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api-base";

export default function DeleteEntryButton({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/api/entries/${entryId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      aria-label="Delete entry"
      className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-500 hover:bg-red-100 disabled:opacity-50"
    >
      ✕
    </button>
  );
}
