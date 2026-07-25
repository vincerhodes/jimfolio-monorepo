// Model allowlist for OpenRouter. Edit this file to add/remove models.
export interface ModelOption {
  id: string;
  label: string;
  costNote: string;
}

export const MODELS: ModelOption[] = [
  {
    id: "deepseek/deepseek-v4-flash",
    label: "DeepSeek v4 Flash",
    costNote: "~$0.10/$0.20 per 1M tok — cheapest",
  },
  {
    id: "google/gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash Lite",
    costNote: "~$0.25/$1.50 — cheap, fast, current-gen",
  },
  {
    id: "openai/gpt-5-mini",
    label: "GPT-5 mini",
    costNote: "~$0.25/$2.00 — default, reliable structured output",
  },
  {
    id: "qwen/qwen3.7-plus",
    label: "Qwen 3.7 Plus",
    costNote: "~$0.32/$1.28 — strong all-rounder",
  },
  {
    id: "openai/gpt-5.4-mini",
    label: "GPT-5.4 mini",
    costNote: "~$0.75/$4.50 — newest OpenAI mini",
  },
  {
    id: "anthropic/claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    costNote: "~$1.00/$5.00 — best instruction following",
  },
];

export const DEFAULT_MODEL_ID = "openai/gpt-5-mini";

export function defaultModel(): string {
  return process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL_ID;
}

export function isAllowedModel(id: string): boolean {
  return MODELS.some((m) => m.id === id);
}
