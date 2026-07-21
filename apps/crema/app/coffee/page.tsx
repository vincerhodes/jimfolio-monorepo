import Link from "next/link";
import { db } from "@/lib/db";
import BeanCard from "@/components/BeanCard";
import BeanForm from "@/components/BeanForm";
import BeanSearch from "@/components/BeanSearch";

export const dynamic = "force-dynamic";

interface CoffeePageProps {
  searchParams: Promise<{ view?: string; q?: string }>;
}

export default async function CoffeePage({ searchParams }: CoffeePageProps) {
  const { view, q: rawQ } = await searchParams;
  const archived = view === "archived";
  const q = (rawQ ?? "").trim();

  const beans = await db.bean.findMany({
    where: {
      archived,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { roaster: { contains: q } },
              { origin: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { roastDate: "desc" },
    include: { _count: { select: { brews: true } } },
  });

  const qSuffix = q ? `&q=${encodeURIComponent(q)}` : "";

  return (
    <main
      className="mx-auto max-w-4xl p-8"
      style={{ "--accent": "#4a2c1a" } as React.CSSProperties}
    >
      <h1 className="page-title">Coffee</h1>

      <div className="mt-4 flex items-center gap-4 border-b border-[#e7e0d5]">
        <Link
          href={`/coffee${q ? `?q=${encodeURIComponent(q)}` : ""}`}
          aria-current={!archived ? "page" : undefined}
          className={`-mb-px border-b-2 px-1 pb-2 text-sm font-medium ${
            !archived
              ? "border-espresso text-espresso"
              : "border-transparent text-[#7a6a5d] hover:text-ink"
          }`}
        >
          Active
        </Link>
        <Link
          href={`/coffee?view=archived${qSuffix}`}
          aria-current={archived ? "page" : undefined}
          className={`-mb-px border-b-2 px-1 pb-2 text-sm font-medium ${
            archived
              ? "border-espresso text-espresso"
              : "border-transparent text-[#7a6a5d] hover:text-ink"
          }`}
        >
          Archived
        </Link>
      </div>

      <div className="mt-4">
        <BeanSearch key={`${view ?? ""}-${q}`} initialQuery={q} view={view ?? ""} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {beans.map(({ _count, ...bean }) => (
          <BeanCard key={bean.id} bean={{ ...bean, brewCount: _count.brews }} />
        ))}
        {beans.length === 0 && (
          <p className="text-sm text-[#7a6a5d]">
            {q
              ? `No beans match “${q}” — try a different search.`
              : archived
                ? "No archived beans yet."
                : "☕ No beans yet — add your first bag below."}
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Add bean</h2>
        <BeanForm />
      </div>
    </main>
  );
}
