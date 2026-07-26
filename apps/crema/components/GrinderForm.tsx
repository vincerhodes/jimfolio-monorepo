"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api-base";

const GRINDER_TYPES = [
  { value: "FLAT_BURR", label: "Flat burr" },
  { value: "CONICAL_BURR", label: "Conical burr" },
  { value: "BLADE", label: "Blade" },
  { value: "OTHER", label: "Other" },
] as const;

interface FormState {
  manufacturer: string;
  model: string;
  type: string;
  notes: string;
}

const initialForm: FormState = {
  manufacturer: "",
  model: "",
  type: "",
  notes: "",
};

interface EditableGrinder {
  id: string;
  manufacturer: string | null;
  model: string | null;
  type: string | null;
  notes: string | null;
  catalogSlug: string | null;
}

interface CatalogGrinderOption {
  slug: string;
  brand: string;
  model: string;
  type: string;
}

interface GrinderFormProps {
  grinder?: EditableGrinder; // when set, renders an Edit button that expands into the edit form
  catalog?: CatalogGrinderOption[]; // when non-empty, renders a "from catalog" picker
}

export default function GrinderForm({ grinder, catalog }: GrinderFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [catalogSlug, setCatalogSlug] = useState(grinder?.catalogSlug ?? "");
  const [form, setForm] = useState<FormState>(
    grinder
      ? {
          manufacturer: grinder.manufacturer ?? "",
          model: grinder.model ?? "",
          type: grinder.type ?? "",
          notes: grinder.notes ?? "",
        }
      : initialForm
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function selectCatalogEntry(slug: string) {
    setCatalogSlug(slug);
    const entry = catalog?.find((e) => e.slug === slug);
    if (entry) {
      setForm((f) => ({
        ...f,
        manufacturer: entry.brand,
        model: entry.model,
        type: entry.type,
      }));
    }
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        grinder
          ? `${API_BASE}/api/grinders/${grinder.id}`
          : `${API_BASE}/api/grinders`,
        {
          method: grinder ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            manufacturer: form.manufacturer.trim() || (grinder ? null : undefined),
            model: form.model.trim() || (grinder ? null : undefined),
            type: form.type || (grinder ? null : undefined),
            notes: form.notes.trim() || (grinder ? null : undefined),
            catalogSlug: catalogSlug || (grinder ? null : undefined),
          }),
        }
      );
      if (!res.ok) {
        setError("Couldn't save the grinder. Check the fields and try again.");
        return;
      }
      if (grinder) {
        setOpen(false);
      } else {
        setForm(initialForm);
        setCatalogSlug("");
      }
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (grinder && !open) {
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

  const formId = grinder ? `grinder-${grinder.id}` : "grinder-new";

  return (
    <form
      className="card space-y-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) submit();
      }}
    >
      {catalog && catalog.length > 0 && (
        <div>
          <label htmlFor={`${formId}-catalog`} className="block text-sm font-medium">
            From catalog (optional)
          </label>
          <select
            id={`${formId}-catalog`}
            value={catalogSlug}
            onChange={(e) => selectCatalogEntry(e.target.value)}
            className="input"
          >
            <option value=""></option>
            {catalog.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {[entry.brand, entry.model].filter(Boolean).join(" ")}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={`${formId}-manufacturer`} className="block text-sm font-medium">
            Manufacturer
          </label>
          <input
            id={`${formId}-manufacturer`}
            type="text"
            value={form.manufacturer}
            onChange={(e) => update("manufacturer", e.target.value)}
            placeholder="Timemore"
            className="input"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-model`} className="block text-sm font-medium">
            Model
          </label>
          <input
            id={`${formId}-model`}
            type="text"
            value={form.model}
            onChange={(e) => update("model", e.target.value)}
            placeholder="Sculptor 078s"
            className="input"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-type`} className="block text-sm font-medium">
            Type
          </label>
          <select
            id={`${formId}-type`}
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            className="input"
          >
            <option value=""></option>
            {GRINDER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={`${formId}-notes`} className="block text-sm font-medium">
          Notes
        </label>
        <textarea
          id={`${formId}-notes`}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={2}
          className="input"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : grinder ? "Save changes" : "Add grinder"}
        </button>
        {grinder && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
