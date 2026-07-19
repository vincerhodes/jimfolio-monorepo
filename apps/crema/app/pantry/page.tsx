import { db } from "@/lib/db";
import PantryForm from "@/components/PantryForm";
import PantryList from "@/components/PantryList";

export const dynamic = "force-dynamic";

export default async function PantryPage() {
  const items = await db.pantryItem.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-bold">Pantry</h1>

      <div className="mt-6">
        <PantryList items={items} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Add item</h2>
        <PantryForm />
      </div>
    </main>
  );
}
