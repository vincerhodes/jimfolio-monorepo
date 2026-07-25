"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api-base";

const EQUIPMENT_KINDS = [
  { value: "ESPRESSO_MACHINE", label: "Espresso machine" },
  { value: "POUR_OVER", label: "Pour-over" },
  { value: "IMMERSION", label: "Immersion" },
  { value: "MOKA_POT", label: "Moka pot" },
  { value: "OTHER", label: "Other" },
] as const;

interface FormState {
  manufacturer: string;
  model: string;
  kind: string;
  notes: string;
}

const initialForm: FormState = {
  manufacturer: "",
  model: "",
  kind: "",
  notes: "",
};

interface EditableEquipment {
  id: string;
  manufacturer: string | null;
  model: string | null;
  kind: string | null;
  notes: string | null;
}

interface EquipmentFormProps {
  equipment?: EditableEquipment; // when set, renders an Edit button that expands into the edit form
}

export default function EquipmentForm({ equipment }: EquipmentFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(
    equipment
      ? {
          manufacturer: equipment.manufacturer ?? "",
          model: equipment.model ?? "",
          kind: equipment.kind ?? "",
          notes: equipment.notes ?? "",
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
        equipment
          ? `${API_BASE}/api/equipment/${equipment.id}`
          : `${API_BASE}/api/equipment`,
        {
          method: equipment ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            manufacturer: form.manufacturer.trim() || (equipment ? null : undefined),
            model: form.model.trim() || (equipment ? null : undefined),
            kind: form.kind || (equipment ? null : undefined),
            notes: form.notes.trim() || (equipment ? null : undefined),
          }),
        }
      );
      if (!res.ok) {
        setError("Couldn't save the equipment. Check the fields and try again.");
        return;
      }
      if (equipment) {
        setOpen(false);
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

  if (equipment && !open) {
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

  const formId = equipment ? `equipment-${equipment.id}` : "equipment-new";

  return (
    <form
      className="card space-y-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) submit();
      }}
    >
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
            placeholder="Lelit"
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
            placeholder="Bianca V3"
            className="input"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-kind`} className="block text-sm font-medium">
            Kind
          </label>
          <select
            id={`${formId}-kind`}
            value={form.kind}
            onChange={(e) => update("kind", e.target.value)}
            className="input"
          >
            <option value=""></option>
            {EQUIPMENT_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
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
          {loading ? "Saving…" : equipment ? "Save changes" : "Add equipment"}
        </button>
        {equipment && (
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
