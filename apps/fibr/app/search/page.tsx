import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BASE_PATH, getSessionUser } from "@/lib/auth";
import SearchClient from "@/components/SearchClient";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const user = await getSessionUser();
  if (!user) redirect(`${BASE_PATH}/login`);

  const customFoods = await db.customFood.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-2xl pb-12">
      <SearchClient
        customFoods={customFoods.map((f) => ({
          id: f.id,
          name: f.name,
          fiberPer100g: f.fiberPer100g,
        }))}
        hasUsdaKey={!!process.env.USDA_API_KEY}
      />
    </main>
  );
}
