export interface GenerateInput {
  ingredients?: string;
  cuisine?: string;
  maxTime?: number;
  servings?: number;
  freeText?: string;
}

export const SYSTEM_PROMPT = `You are a recipe generator. You reply with a single JSON object and nothing else — no markdown, no code fences, no commentary.

The JSON object must match this exact shape:
{
  "title": "string",
  "servings": 2,
  "ingredients": [
    { "name": "string", "quantity": 200, "unit": "g", "notes": "optional string" }
  ],
  "steps": [
    { "stepNumber": 1, "instruction": "string" }
  ]
}

Rules:
1. Output is a single JSON object matching the shape above, nothing else. "servings" is optional; every other field is required.
2. Metric measurements only: grams (g), millilitres (ml), and degrees Celsius (°C). Never use cups, ounces, pounds, tablespoons, teaspoons, or Fahrenheit.
3. Every step must be self-contained: restate the exact ingredient quantities used in that step (e.g. "Add 200 g flour and 5 g salt to the bowl"), never "add the flour" or "add the remaining ingredients". If a step uses no ingredients (e.g. "Preheat the oven to 180 °C"), say so explicitly.

Use realistic quantities and techniques. Keep instructions clear and concise.`;

export function buildUserPrompt(input: GenerateInput): string {
  const lines: string[] = ["Generate a recipe with these constraints:"];
  if (input.ingredients) lines.push(`- Ingredients on hand: ${input.ingredients}`);
  if (input.cuisine) lines.push(`- Cuisine: ${input.cuisine}`);
  if (input.maxTime) lines.push(`- Maximum total time: ${input.maxTime} minutes`);
  if (input.servings) lines.push(`- Servings: ${input.servings}`);
  if (input.freeText) lines.push(`- Additional request: ${input.freeText}`);
  if (lines.length === 1) lines.push("- Surprise me with any simple recipe.");
  return lines.join("\n");
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

export async function callOpenRouter(model: string, userPrompt: string): Promise<unknown> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("missing_api_key");
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`openrouter_http_${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("openrouter_empty_response");
  }

  return JSON.parse(content);
}
