import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BASE_PATH, getSessionUser } from "@/lib/auth";
import { recipeSchema } from "@/lib/recipe-schema";
import RecipeView from "@/components/RecipeView";
import EditRecipeForm from "@/components/EditRecipeForm";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";
import ShareButton from "@/components/ShareButton";

export const dynamic = "force-dynamic";

export default async function SavedRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect(`${BASE_PATH}/login`);

  const { id } = await params;
  const row = await db.recipe.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });
  if (!row) notFound();

  const isOwner = row.userId === user.id;
  if (!isOwner && !row.isPublic) notFound();

  const pantry = await db.pantryItem.findMany({
    where: { userId: user.id },
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
      className="mx-auto max-w-4xl p-4 sm:p-8"
      style={{ "--accent": "#5f7a52" } as React.CSSProperties}
    >
      <h1 className="page-title">{recipe.title}</h1>
      <p className="mt-1 text-sm text-[#7a6a5d]">
        {recipe.servings ? `Serves ${recipe.servings} · ` : ""}
        Generated with {row.model}
        {!isOwner ? ` · Shared by ${row.user.name}` : ""}
      </p>
      {isOwner && (
        <div className="mt-4 flex flex-wrap items-start gap-2">
          <EditRecipeForm id={row.id} title={recipe.title} servings={recipe.servings ?? null} />
          <DeleteRecipeButton id={row.id} />
          <ShareButton id={row.id} isPublic={row.isPublic} />
        </div>
      )}
      <div className="mt-8">
        <RecipeView recipe={recipe} pantryItems={pantryItems} />
      </div>
    </main>
  );
}
