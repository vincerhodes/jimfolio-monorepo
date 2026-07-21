"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api-base";

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

interface EditableBean {
  id: string;
  name: string;
  roaster: string | null;
  origin: string | null;
  variety: string | null;
  roastDate: string; // ISO string, serialized from the server component
  notes: string | null;
}

interface BeanFormProps {
  bean?: EditableBean; // when set, the form edits instead of adding
  onDone?: () => void; // called after a successful edit or on Cancel
}

export default function BeanForm({ bean, onDone }: BeanFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    bean
      ? {
          name: bean.name,
          roaster: bean.roaster ?? "",
          origin: bean.origin ?? "",
          variety: bean.variety ?? "",
          roastDate: bean.roastDate.slice(0, 10),
          notes: bean.notes ?? "",
        }
      : initialForm
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        bean ? `${API_BASE}/api/beans/${bean.id}` : `${API_BASE}/api/beans`,
        {
          method: bean ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            roaster: form.roaster.trim() || (bean ? null : undefined),
            origin: form.origin.trim() || (bean ? null : undefined),
            variety: form.variety.trim() || (bean ? null : undefined),
            roastDate: form.roastDate,
            notes: form.notes.trim() || (bean ? null : undefined),
          }),
        }
      );
      if (!res.ok) {
        setError("Couldn't save the bean. Check the fields and try again.");
        return;
      }
      if (bean) {
        onDone?.();
      } else {
        setForm(initialForm);
      }
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="card space-y-4 p-6"
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
            className="input"
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
            className="input"
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
            className="input"
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
            className="input"
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
            className="input"
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
          className="input"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Saving…" : bean ? "Save changes" : "Add bean"}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
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
