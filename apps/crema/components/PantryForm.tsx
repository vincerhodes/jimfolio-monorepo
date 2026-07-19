"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api-base";

interface FormState {
  name: string;
  category: string;
}

const initialForm: FormState = {
  name: "",
  category: "",
};

export default function PantryForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/pantry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim() || undefined,
        }),
      });
      if (!res.ok) {
        setError(
          res.status === 409
            ? "That item is already in your pantry."
            : "Couldn't save the item. Check the fields and try again."
        );
        return;
      }
      setForm(initialForm);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="space-y-4 rounded-lg border border-neutral-200 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) submit();
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pantry-name" className="block text-sm font-medium">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="pantry-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Eggs"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="pantry-category" className="block text-sm font-medium">
            Category
          </label>
          <input
            id="pantry-category"
            type="text"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            placeholder="dairy"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add item"}
      </button>
    </form>
  );
}
