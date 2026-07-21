import { db } from "@/lib/db";
import Generator from "@/components/Generator";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await db.pantryItem.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });
  const pantryItems = items.map((item) => item.name);

  return (
    <main
      className="mx-auto max-w-4xl p-8"
      style={{ "--accent": "#c2571f" } as React.CSSProperties}
    >
      <h1 className="page-title mb-6">Generator</h1>
      <Generator pantryItems={pantryItems} />
    </main>
  );
}
