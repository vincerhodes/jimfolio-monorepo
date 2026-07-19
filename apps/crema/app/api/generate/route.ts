import { NextResponse } from "next/server";
import { z } from "zod";
import { recipeSchema } from "@/lib/recipe-schema";
import { defaultModel, isAllowedModel } from "@/lib/models";
import { buildUserPrompt, callOpenRouter } from "@/lib/openrouter";

const generateBodySchema = z
  .object({
    model: z.string().optional(),
    mode: z.enum(["ingredients", "idea"]).default("ingredients"),
    idea: z.string().trim().min(3).optional(),
    ingredients: z.string().trim().min(1).optional(),
    cuisine: z.string().trim().optional(),
    maxTime: z.number().int().positive().optional(),
    servings: z.number().int().positive().optional(),
    freeText: z.string().trim().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.mode === "idea" && !val.idea) {
      ctx.addIssue({ code: "custom", message: "idea_required", path: ["idea"] });
    }
    if (val.mode === "ingredients" && !val.ingredients) {
      ctx.addIssue({ code: "custom", message: "ingredients_required", path: ["ingredients"] });
    }
  });

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const parsedBody = generateBodySchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "invalid_request", detail: z.prettifyError(parsedBody.error) },
      { status: 400 }
    );
  }
  const body = parsedBody.data;

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
