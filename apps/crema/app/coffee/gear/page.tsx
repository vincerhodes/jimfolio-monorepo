import Link from "next/link";
import { db } from "@/lib/db";
import { grinderDisplayName, equipmentDisplayName } from "@/lib/coffee";
import GrinderForm from "@/components/GrinderForm";
import EquipmentForm from "@/components/EquipmentForm";
import ArchiveToggle from "@/components/ArchiveToggle";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  FLAT_BURR: "Flat burr",
  CONICAL_BURR: "Conical burr",
  BLADE: "Blade",
  OTHER: "Other",
};

const KIND_LABELS: Record<string, string> = {
  ESPRESSO_MACHINE: "Espresso machine",
  POUR_OVER: "Pour-over",
  IMMERSION: "Immersion",
  MOKA_POT: "Moka pot",
  OTHER: "Other",
};

export default async function GearPage() {
  const grinders = await db.grinder.findMany({
    orderBy: [{ archived: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { brews: true } } },
  });
  const equipment = await db.equipment.findMany({
    orderBy: [{ archived: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { brews: true } } },
  });

  return (
    <main
      className="mx-auto max-w-4xl p-4 sm:p-8"
      style={{ "--accent": "#4a2c1a" } as React.CSSProperties}
    >
      <h1 className="page-title">Gear</h1>
      <p className="mt-1 text-sm text-[#7a6a5d]">
        <Link href="/coffee" className="hover:underline">
          ← Back to coffee
        </Link>
      </p>

      <h2 className="mt-6 text-lg font-semibold">Grinders</h2>
      <div className="mt-6 space-y-4">
        {grinders.map(({ _count, ...grinder }) => (
          <div key={grinder.id} className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold">
                  {grinderDisplayName(grinder)}
                  {grinder.archived && (
                    <span className="ml-2 rounded bg-neutral-200 px-2 py-0.5 align-middle font-sans text-xs font-medium text-neutral-600">
                      Archived
                    </span>
                  )}
                </h2>
                <p className="mt-1 text-sm text-[#7a6a5d]">
                  {[
                    grinder.type ? TYPE_LABELS[grinder.type] ?? grinder.type : null,
                    `${_count.brews} brew${_count.brews === 1 ? "" : "s"}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {grinder.notes && (
                  <p className="mt-2 text-sm text-ink/80">{grinder.notes}</p>
                )}
              </div>
              <ArchiveToggle
                endpoint={`/api/grinders/${grinder.id}`}
                archived={grinder.archived}
              />
            </div>
            <div className="mt-4">
              <GrinderForm
                grinder={{
                  id: grinder.id,
                  manufacturer: grinder.manufacturer,
                  model: grinder.model,
                  type: grinder.type,
                  notes: grinder.notes,
                }}
              />
            </div>
          </div>
        ))}
        {grinders.length === 0 && (
          <p className="text-sm text-[#7a6a5d]">
            No grinders yet — add your first one below.
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Add grinder</h2>
        <GrinderForm />
      </div>

      <h2 className="mt-12 text-lg font-semibold">Equipment</h2>
      <div className="mt-6 space-y-4">
        {equipment.map(({ _count, ...item }) => (
          <div key={item.id} className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold">
                  {equipmentDisplayName(item)}
                  {item.archived && (
                    <span className="ml-2 rounded bg-neutral-200 px-2 py-0.5 align-middle font-sans text-xs font-medium text-neutral-600">
                      Archived
                    </span>
                  )}
                </h2>
                <p className="mt-1 text-sm text-[#7a6a5d]">
                  {[
                    item.kind ? KIND_LABELS[item.kind] ?? item.kind : null,
                    `${_count.brews} brew${_count.brews === 1 ? "" : "s"}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {item.notes && (
                  <p className="mt-2 text-sm text-ink/80">{item.notes}</p>
                )}
              </div>
              <ArchiveToggle
                endpoint={`/api/equipment/${item.id}`}
                archived={item.archived}
              />
            </div>
            <div className="mt-4">
              <EquipmentForm
                equipment={{
                  id: item.id,
                  manufacturer: item.manufacturer,
                  model: item.model,
                  kind: item.kind,
                  notes: item.notes,
                }}
              />
            </div>
          </div>
        ))}
        {equipment.length === 0 && (
          <p className="text-sm text-[#7a6a5d]">
            No equipment yet — add your first one below.
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Add equipment</h2>
        <EquipmentForm />
      </div>
    </main>
  );
}
