import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { daysBetween, formatDate } from "@/lib/coffee";
import BrewLogTable from "@/components/BrewLogTable";
import BrewLogForm from "@/components/BrewLogForm";
import ArchiveToggle from "@/components/ArchiveToggle";

export const dynamic = "force-dynamic";

export default async function BeanPage({
  params,
}: {
  params: Promise<{ beanId: string }>;
}) {
  const { beanId } = await params;
  const bean = await db.bean.findUnique({
    where: { id: beanId },
    include: {
      brews: {
        include: { method: true },
        orderBy: { brewDate: "desc" },
      },
    },
  });
  if (!bean) notFound();

  const ageDays = daysBetween(bean.roastDate, new Date());

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {bean.name}
            {bean.archived && (
              <span className="ml-2 rounded bg-neutral-200 px-2 py-0.5 align-middle text-xs font-medium text-neutral-600">
                Archived
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {[
              bean.roaster,
              bean.origin,
              bean.variety,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Roasted {formatDate(bean.roastDate)} · {ageDays} day
            {ageDays === 1 ? "" : "s"} old
          </p>
          {bean.notes && (
            <p className="mt-2 text-sm text-neutral-600">{bean.notes}</p>
          )}
        </div>
        <ArchiveToggle beanId={bean.id} archived={bean.archived} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Brews</h2>
        <BrewLogTable brews={bean.brews} roastDate={bean.roastDate} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Log brew</h2>
        <BrewLogForm beanId={bean.id} roastDate={bean.roastDate.toISOString()} />
      </div>
    </main>
  );
}
