import { NextResponse } from "next/server";
import { recipeSchema } from "@/lib/recipe-schema";
import { defaultModel, isAllowedModel } from "@/lib/models";
import { buildUserPrompt, callOpenRouter, type GenerateInput } from "@/lib/openrouter";

export async function POST(request: Request) {
  let body: GenerateInput & { model?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const model = body.model ?? defaultModel();
  if (!isAllowedModel(model)) {
    return NextResponse.json({ error: "unknown_model", model }, { status: 400 });
  }

  let raw: unknown;
  try {
    raw = await callOpenRouter(model, buildUserPrompt(body));
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message === "missing_api_key") {
      return NextResponse.json({ error: "missing_api_key" }, { status: 500 });
    }
    return NextResponse.json({ error: "openrouter_error", detail: message }, { status: 502 });
  }

  const parsed = recipeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_model_output" }, { status: 502 });
  }

  return NextResponse.json(parsed.data);
}
