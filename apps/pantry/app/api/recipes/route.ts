import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { recipeSchema } from "@/lib/recipe-schema";
import { isAllowedModel } from "@/lib/models";

const saveSchema = z.object({
  recipe: recipeSchema,
  prompt: z.string().min(1),
  model: z.string().min(1),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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
      userId: user.id,
    },
  });

  return NextResponse.json({ id: saved.id }, { status: 201 });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const recipes = await db.recipe.findMany({
    where: { userId: user.id },
    select: { id: true, title: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(recipes);
}
