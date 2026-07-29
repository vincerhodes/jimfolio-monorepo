import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BASE_PATH, getSessionUser } from "@/lib/auth";
import PantryForm from "@/components/PantryForm";
import PantryList from "@/components/PantryList";

export const dynamic = "force-dynamic";

export default async function PantryPage() {
  const user = await getSessionUser();
  if (!user) redirect(`${BASE_PATH}/login`);

  const items = await db.pantryItem.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return (
    <main
      className="mx-auto max-w-4xl p-4 sm:p-8"
      style={{ "--accent": "#75742c" } as React.CSSProperties}
    >
      <h1 className="page-title">Pantry</h1>

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
