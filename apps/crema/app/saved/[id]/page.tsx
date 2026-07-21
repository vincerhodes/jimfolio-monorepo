import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { recipeSchema } from "@/lib/recipe-schema";
import RecipeView from "@/components/RecipeView";

export const dynamic = "force-dynamic";

export default async function SavedRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await db.recipe.findUnique({ where: { id } });
  if (!row) notFound();

  const pantry = await db.pantryItem.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });
  const pantryItems = pantry.map((item) => item.name);

  const parsed = recipeSchema.safeParse({
    title: row.title,
    servings: row.servings ?? undefined,
    ingredients: JSON.parse(row.ingredients),
    steps: JSON.parse(row.steps),
  });
  if (!parsed.success) notFound();

  const recipe = parsed.data;

  return (
    <main
      className="mx-auto max-w-4xl p-8"
      style={{ "--accent": "#5f7a52" } as React.CSSProperties}
    >
      <h1 className="page-title">{recipe.title}</h1>
      <p className="mt-1 text-sm text-[#7a6a5d]">
        {recipe.servings ? `Serves ${recipe.servings} · ` : ""}
        Generated with {row.model}
      </p>
      <div className="mt-8">
        <RecipeView recipe={recipe} pantryItems={pantryItems} />
      </div>
    </main>
  );
}
