import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const recipes = await db.recipe.findMany({
    select: { id: true, title: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main
      className="mx-auto max-w-4xl p-8"
      style={{ "--accent": "#5f7a52" } as React.CSSProperties}
    >
      <h1 className="page-title">Saved recipes</h1>
      {recipes.length === 0 ? (
        <p className="mt-4 text-sm text-[#7a6a5d]">
          🍽️ No saved recipes yet — generate one and hit “Save recipe”.
        </p>
      ) : (
        <ul className="card mt-6 divide-y divide-[#eee7dd]">
          {recipes.map((r) => (
            <li key={r.id} className="px-4 py-3">
              <Link href={`/saved/${r.id}`} className="font-medium hover:underline">
                {r.title}
              </Link>
              <span className="ml-3 text-sm text-[#7a6a5d]">
                {r.createdAt.toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
