import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { daysBetween, formatDate } from "@/lib/coffee";
import BrewLogTable from "@/components/BrewLogTable";
import BrewLogForm from "@/components/BrewLogForm";
import DialInSummary from "@/components/DialInSummary";
import ArchiveToggle from "@/components/ArchiveToggle";
import BeanEditButton from "@/components/BeanEditButton";

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

  const grinders = (
    await db.brewLog.findMany({
      where: { grinder: { not: null } },
      distinct: ["grinder"],
      select: { grinder: true },
    })
  )
    .map((row) => row.grinder)
    .filter((g): g is string => g !== null);

  // Best brew per method: highest rating, tie-break most recent brewDate.
  // Only brews with a grind setting are eligible.
  const bestByMethod = new Map<string, (typeof bean.brews)[number]>();
  for (const brew of bean.brews) {
    if (brew.grindSetting === null) continue;
    const current = bestByMethod.get(brew.methodId);
    if (
      !current ||
      (brew.rating ?? 0) > (current.rating ?? 0) ||
      ((brew.rating ?? 0) === (current.rating ?? 0) &&
        brew.brewDate > current.brewDate)
    ) {
      bestByMethod.set(brew.methodId, brew);
    }
  }
  const dialInEntries = [...bestByMethod.values()].map((brew) => ({
    methodLabel: brew.method.label,
    grinder: brew.grinder,
    grindSetting: brew.grindSetting as number,
    ageDays: daysBetween(bean.roastDate, brew.brewDate),
    rating: brew.rating,
  }));

  return (
    <main
      className="mx-auto max-w-4xl p-8"
      style={{ "--accent": "#4a2c1a" } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">
            {bean.name}
            {bean.archived && (
              <span className="ml-2 rounded bg-neutral-200 px-2 py-0.5 align-middle font-sans text-xs font-medium text-neutral-600">
                Archived
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-[#7a6a5d]">
            {[
              bean.roaster,
              bean.origin,
              bean.variety,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-[#7a6a5d]">
            Roasted {formatDate(bean.roastDate)}
            <span className="rounded-full bg-[#f1e9de] px-2.5 py-0.5 text-xs font-medium text-espresso">
              {ageDays} day{ageDays === 1 ? "" : "s"} old
            </span>
          </p>
          {bean.notes && (
            <p className="mt-2 text-sm text-ink/80">{bean.notes}</p>
          )}
        </div>
        <ArchiveToggle beanId={bean.id} archived={bean.archived} />
      </div>

      <div className="mt-4">
        <BeanEditButton
          bean={{
            id: bean.id,
            name: bean.name,
            roaster: bean.roaster,
            origin: bean.origin,
            variety: bean.variety,
            roastDate: bean.roastDate.toISOString(),
            notes: bean.notes,
          }}
        />
      </div>

      <div className="mt-8">
        <DialInSummary entries={dialInEntries} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Brews</h2>
        <BrewLogTable beanId={bean.id} brews={bean.brews} roastDate={bean.roastDate} grinders={grinders} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Log brew</h2>
        <BrewLogForm
          beanId={bean.id}
          roastDate={bean.roastDate.toISOString()}
          grinders={grinders}
        />
      </div>
    </main>
  );
}
