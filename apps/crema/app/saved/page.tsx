import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const recipes = await db.recipe.findMany({
    select: { id: true, title: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-bold">Saved recipes</h1>
      {recipes.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">No saved recipes yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200">
          {recipes.map((r) => (
            <li key={r.id} className="py-3">
              <Link href={`/saved/${r.id}`} className="font-medium hover:underline">
                {r.title}
              </Link>
              <span className="ml-3 text-sm text-neutral-500">
                {r.createdAt.toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
