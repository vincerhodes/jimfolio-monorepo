"use client";

import { useEffect, useState } from "react";
import { MODELS, DEFAULT_MODEL_ID } from "@/lib/models";
import { API_BASE } from "@/lib/api-base";
import type { RecipeData } from "@/lib/recipe-schema";

interface PromptFormProps {
  onGenerated: (result: { recipe: RecipeData; prompt: string; model: string }) => void;
}

type Mode = "ingredients" | "idea";

interface FormState {
  idea: string;
  ingredients: string;
  cuisine: string;
  maxTime: string;
  servings: string;
  freeText: string;
  model: string;
}

const initialForm: FormState = {
  idea: "",
  ingredients: "",
  cuisine: "",
  maxTime: "",
  servings: "",
  freeText: "",
  model: DEFAULT_MODEL_ID,
};

export default function PromptForm({ onGenerated }: PromptFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [mode, setMode] = useState<Mode>("ingredients");
  const [usePantry, setUsePantry] = useState(true);
  const [pantryNames, setPantryNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryable, setRetryable] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/pantry`)
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items?: { name: string }[] }) =>
        setPantryNames((data.items ?? []).map((item) => item.name))
      )
      .catch(() => setPantryNames([]));
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function mergedIngredients(): string {
    const parts: string[] = [];
    if (usePantry) parts.push(...pantryNames);
    if (form.ingredients.trim()) parts.push(form.ingredients.trim());
    return parts.join(", ");
  }

  function buildPayload() {
    const payload: Record<string, unknown> = { model: form.model, mode };
    if (mode === "idea") {
      if (form.idea.trim()) payload.idea = form.idea.trim();
    } else {
      const ingredients = mergedIngredients();
      if (ingredients) payload.ingredients = ingredients;
      if (form.freeText.trim()) payload.freeText = form.freeText.trim();
    }
    if (form.cuisine.trim()) payload.cuisine = form.cuisine.trim();
    if (form.maxTime) payload.maxTime = Number(form.maxTime);
    if (form.servings) payload.servings = Number(form.servings);
    return payload;
  }

  function buildPromptSummary(): string {
    if (mode === "idea") {
      const lines: string[] = [`Create a recipe for: ${form.idea.trim()}`];
      if (form.cuisine.trim()) lines.push(`- Cuisine: ${form.cuisine.trim()}`);
      if (form.maxTime) lines.push(`- Maximum total time: ${form.maxTime} minutes`);
      if (form.servings) lines.push(`- Servings: ${form.servings}`);
      return lines.join("\n");
    }
    const lines: string[] = ["Generate a recipe with these constraints:"];
    const ingredients = mergedIngredients();
    if (ingredients) lines.push(`- Ingredients on hand: ${ingredients}`);
    if (form.cuisine.trim()) lines.push(`- Cuisine: ${form.cuisine.trim()}`);
    if (form.maxTime) lines.push(`- Maximum total time: ${form.maxTime} minutes`);
    if (form.servings) lines.push(`- Servings: ${form.servings}`);
    if (form.freeText.trim()) lines.push(`- Additional request: ${form.freeText.trim()}`);
    return lines.join("\n");
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setRetryable(false);
    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "invalid_model_output") {
          setError("The model returned something we couldn't use. Try again.");
          setRetryable(true);
        } else if (data?.error === "rate_limited") {
          setError("Too many requests — give it a rest and try again later.");
        } else if (data?.error === "unknown_model") {
          setError("That model isn't allowed. Pick another one.");
        } else if (data?.error === "missing_api_key") {
          setError("OPENROUTER_API_KEY is not configured on the server.");
        } else if (data?.error === "invalid_request") {
          setError(
            mode === "idea"
              ? "Enter a dish idea first (at least 3 characters)."
              : "Add some ingredients (or enable your pantry) first."
          );
        } else {
          setError("Generation failed. Please try again.");
          setRetryable(true);
        }
        return;
      }
      onGenerated({ recipe: data as RecipeData, prompt: buildPromptSummary(), model: form.model });
    } catch {
      setError("Network error. Please try again.");
      setRetryable(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="card space-y-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) generate();
      }}
    >
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="radio"
            name="mode"
            checked={mode === "ingredients"}
            onChange={() => setMode("ingredients")}
            className="accent-[var(--accent)]"
          />
          Ingredients I have
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="radio"
            name="mode"
            checked={mode === "idea"}
            onChange={() => setMode("idea")}
            className="accent-[var(--accent)]"
          />
          Recipe for…
        </label>
      </div>

      {mode === "idea" ? (
        <div>
          <label htmlFor="idea" className="block text-sm font-medium">
            Dish idea
          </label>
          <input
            id="idea"
            type="text"
            value={form.idea}
            onChange={(e) => update("idea", e.target.value)}
            placeholder="mushroom risotto"
            className="input"
          />
        </div>
      ) : (
        <div>
          <label htmlFor="ingredients" className="block text-sm font-medium">
            Ingredients on hand
          </label>
          <input
            id="ingredients"
            type="text"
            value={form.ingredients}
            onChange={(e) => update("ingredients", e.target.value)}
            placeholder="chicken, rice, broccoli"
            className="input"
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-[#7a6a5d]">
            <input
              type="checkbox"
              checked={usePantry}
              onChange={(e) => setUsePantry(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Use my pantry{pantryNames.length > 0 ? ` (${pantryNames.length} items)` : ""}
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="cuisine" className="block text-sm font-medium">
            Cuisine
          </label>
          <input
            id="cuisine"
            type="text"
            value={form.cuisine}
            onChange={(e) => update("cuisine", e.target.value)}
            placeholder="Italian"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="maxTime" className="block text-sm font-medium">
            Max time (min)
          </label>
          <input
            id="maxTime"
            type="number"
            min={1}
            value={form.maxTime}
            onChange={(e) => update("maxTime", e.target.value)}
            placeholder="30"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="servings" className="block text-sm font-medium">
            Servings
          </label>
          <input
            id="servings"
            type="number"
            min={1}
            value={form.servings}
            onChange={(e) => update("servings", e.target.value)}
            placeholder="2"
            className="input"
          />
        </div>
      </div>

      {mode === "ingredients" && (
        <div>
          <label htmlFor="freeText" className="block text-sm font-medium">
            Anything else? (optional)
          </label>
          <textarea
            id="freeText"
            value={form.freeText}
            onChange={(e) => update("freeText", e.target.value)}
            placeholder="e.g. make it spicy, one-pot only"
            rows={2}
            className="input"
          />
        </div>
      )}

      <div>
        <label htmlFor="model" className="block text-sm font-medium">
          Model
        </label>
        <select
          id="model"
          value={form.model}
          onChange={(e) => update("model", e.target.value)}
          className="input"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label} — {m.costNote}
            </option>
          ))}
        </select>
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
          {loading ? "Generating…" : "Generate recipe"}
        </button>
        {retryable && !loading && (
          <button
            type="button"
            onClick={generate}
            className="btn-secondary"
          >
            Retry
          </button>
        )}
      </div>
      {loading && (
        <p className="flex items-center gap-2 text-sm text-[#7a6a5d]" role="status">
          <svg
            className="h-4 w-4 animate-spin text-terracotta"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z"
            />
          </svg>
          Working on your recipe — this can take ~20s.
        </p>
      )}
    </form>
  );
}
