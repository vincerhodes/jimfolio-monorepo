"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api-base";

export interface PantryItem {
  id: string;
  name: string;
  category: string | null;
}

export default function PantryList({ items }: { items: PantryItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const groups = new Map<string, PantryItem[]>();
  for (const item of items) {
    const key = item.category?.trim() || "";
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  const sortedGroups = [...groups.entries()].sort(([a], [b]) => {
    if (a === "") return 1;
    if (b === "") return -1;
    return a.localeCompare(b);
  });

  async function remove(id: string) {
    setDeletingId(id);
    try {
      await fetch(`${API_BASE}/api/pantry/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-[#7a6a5d]">🧺 No pantry items yet — add your first item below.</p>;
  }

  return (
    <div className="space-y-6">
      {sortedGroups.map(([category, groupItems]) => (
        <div key={category || "uncategorised"}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7a6a5d]">
            {category || "Uncategorised"}
          </h3>
          <ul className="card mt-2 divide-y divide-[#eee7dd]">
            {groupItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between px-4 py-2"
              >
                <span className="text-sm">{item.name}</span>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  disabled={deletingId === item.id}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  {deletingId === item.id ? "Deleting…" : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
