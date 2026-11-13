// Model allowlist for OpenRouter. Edit this file to add/remove models.
export interface ModelOption {
  id: string;
  label: string;
  costNote: string;
}

export const MODELS: ModelOption[] = [
  {
    id: "deepseek/deepseek-v4.1-flash",
    label: "DeepSeek 4.1 Flash",
    costNote: "~$0.30/$1.20 — default, fast, cheap",
  },
  {
    id: "google/gemini-3.8-flash",
    label: "Gemini 3.8 Flash",
    costNote: "~$0.83/$4.13 — reliable alternative",
  },
];

export const DEFAULT_MODEL_ID = "deepseek/deepseek-v4.1-flash";

export function defaultModel(): string {
  return process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL_ID;
}

export function isAllowedModel(id: string): boolean {
  return MODELS.some((m) => m.id === id);
}
