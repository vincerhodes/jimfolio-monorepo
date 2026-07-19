"use client";

import { useState } from "react";
import { MODELS, DEFAULT_MODEL_ID } from "@/lib/models";
import type { RecipeData } from "@/lib/recipe-schema";

interface PromptFormProps {
  onGenerated: (result: { recipe: RecipeData; prompt: string; model: string }) => void;
}

interface FormState {
  ingredients: string;
  cuisine: string;
  maxTime: string;
  servings: string;
  freeText: string;
  model: string;
}

const initialForm: FormState = {
  ingredients: "",
  cuisine: "",
  maxTime: "",
  servings: "",
  freeText: "",
  model: DEFAULT_MODEL_ID,
};

export default function PromptForm({ onGenerated }: PromptFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryable, setRetryable] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    const payload: Record<string, unknown> = { model: form.model };
    if (form.ingredients.trim()) payload.ingredients = form.ingredients.trim();
    if (form.cuisine.trim()) payload.cuisine = form.cuisine.trim();
    if (form.maxTime) payload.maxTime = Number(form.maxTime);
    if (form.servings) payload.servings = Number(form.servings);
    if (form.freeText.trim()) payload.freeText = form.freeText.trim();
    return payload;
  }

  function buildPromptSummary(): string {
    const lines: string[] = ["Generate a recipe with these constraints:"];
    if (form.ingredients.trim()) lines.push(`- Ingredients on hand: ${form.ingredients.trim()}`);
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
      const res = await fetch("/crema/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "invalid_model_output") {
          setError("The model returned something we couldn't use. Try again.");
          setRetryable(true);
        } else if (data?.error === "unknown_model") {
          setError("That model isn't allowed. Pick another one.");
        } else if (data?.error === "missing_api_key") {
          setError("OPENROUTER_API_KEY is not configured on the server.");
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
      className="space-y-4 rounded-lg border border-neutral-200 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) generate();
      }}
    >
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
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

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
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
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
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
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
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

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
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium">
          Model
        </label>
        <select
          id="model"
          value={form.model}
          onChange={(e) => update("model", e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
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
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate recipe"}
        </button>
        {retryable && !loading && (
          <button
            type="button"
            onClick={generate}
            className="rounded border border-neutral-300 px-4 py-2 text-sm font-medium"
          >
            Retry
          </button>
        )}
      </div>
    </form>
  );
}
