import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { recipeSchema } from "@/lib/recipe-schema";
import { isAllowedModel } from "@/lib/models";

const saveSchema = z.object({
  recipe: recipeSchema,
  prompt: z.string().min(1),
  model: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_recipe" }, { status: 400 });
  }
  if (!isAllowedModel(parsed.data.model)) {
    return NextResponse.json({ error: "unknown_model" }, { status: 400 });
  }

  const { recipe, prompt, model } = parsed.data;
  const saved = await db.recipe.create({
    data: {
      title: recipe.title,
      servings: recipe.servings ?? null,
      ingredients: JSON.stringify(recipe.ingredients),
      steps: JSON.stringify(recipe.steps),
      prompt,
      model,
    },
  });

  return NextResponse.json({ id: saved.id }, { status: 201 });
}

export async function GET() {
  const recipes = await db.recipe.findMany({
    select: { id: true, title: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(recipes);
}
