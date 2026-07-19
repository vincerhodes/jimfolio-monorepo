import { db } from "@/lib/db";
import BeanCard from "@/components/BeanCard";
import BeanForm from "@/components/BeanForm";

export const dynamic = "force-dynamic";

export default async function CoffeePage() {
  const beans = await db.bean.findMany({
    where: { archived: false },
    orderBy: { roastDate: "desc" },
    include: { _count: { select: { brews: true } } },
  });

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-bold">Coffee</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {beans.map(({ _count, ...bean }) => (
          <BeanCard key={bean.id} bean={{ ...bean, brewCount: _count.brews }} />
        ))}
        {beans.length === 0 && (
          <p className="text-sm text-neutral-500">No active beans. Add one below.</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Add bean</h2>
        <BeanForm />
      </div>
    </main>
  );
}
