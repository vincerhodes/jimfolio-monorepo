"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormState {
  name: string;
  roaster: string;
  origin: string;
  variety: string;
  roastDate: string;
  notes: string;
}

const initialForm: FormState = {
  name: "",
  roaster: "",
  origin: "",
  variety: "",
  roastDate: "",
  notes: "",
};

export default function BeanForm() {
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
      const res = await fetch("/crema/api/beans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          roaster: form.roaster.trim() || undefined,
          origin: form.origin.trim() || undefined,
          variety: form.variety.trim() || undefined,
          roastDate: form.roastDate,
          notes: form.notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        setError("Couldn't save the bean. Check the fields and try again.");
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
          <label htmlFor="bean-name" className="block text-sm font-medium">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="bean-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ethiopia Guji"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="bean-roast-date" className="block text-sm font-medium">
            Roast date <span className="text-red-600">*</span>
          </label>
          <input
            id="bean-roast-date"
            type="date"
            required
            value={form.roastDate}
            onChange={(e) => update("roastDate", e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="bean-roaster" className="block text-sm font-medium">
            Roaster
          </label>
          <input
            id="bean-roaster"
            type="text"
            value={form.roaster}
            onChange={(e) => update("roaster", e.target.value)}
            placeholder="Square Mile"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="bean-origin" className="block text-sm font-medium">
            Origin
          </label>
          <input
            id="bean-origin"
            type="text"
            value={form.origin}
            onChange={(e) => update("origin", e.target.value)}
            placeholder="Ethiopia"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="bean-variety" className="block text-sm font-medium">
            Variety
          </label>
          <input
            id="bean-variety"
            type="text"
            value={form.variety}
            onChange={(e) => update("variety", e.target.value)}
            placeholder="Heirloom"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bean-notes" className="block text-sm font-medium">
          Notes
        </label>
        <textarea
          id="bean-notes"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
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
        {loading ? "Adding…" : "Add bean"}
      </button>
    </form>
  );
}
