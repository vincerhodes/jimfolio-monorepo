"use client";

import { useState } from "react";
import type { RecipeData } from "@/lib/recipe-schema";
import { API_BASE } from "@/lib/api-base";

interface SaveButtonProps {
  recipe: RecipeData;
  prompt: string;
  model: string;
}

export default function SaveButton({ recipe, prompt, model }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe, prompt, model }),
      });
      if (!res.ok) {
        setError("Couldn't save. Try again.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={save}
        disabled={saved || saving}
        className="btn-primary"
      >
        {saved ? "Saved ✓" : saving ? "Saving…" : "Save recipe"}
      </button>
      {error && (
        <span className="text-sm text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
