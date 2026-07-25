import Link from "next/link";
import { db } from "@/lib/db";
import { grinderDisplayName } from "@/lib/coffee";
import GrinderForm from "@/components/GrinderForm";
import ArchiveToggle from "@/components/ArchiveToggle";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  FLAT_BURR: "Flat burr",
  CONICAL_BURR: "Conical burr",
  BLADE: "Blade",
  OTHER: "Other",
};

export default async function GearPage() {
  const grinders = await db.grinder.findMany({
    orderBy: [{ archived: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { brews: true } } },
  });

  return (
    <main
      className="mx-auto max-w-4xl p-8"
      style={{ "--accent": "#4a2c1a" } as React.CSSProperties}
    >
      <h1 className="page-title">Gear</h1>
      <p className="mt-1 text-sm text-[#7a6a5d]">
        <Link href="/coffee" className="hover:underline">
          ← Back to coffee
        </Link>
      </p>

      <div className="mt-6 space-y-4">
        {grinders.map(({ _count, ...grinder }) => (
          <div key={grinder.id} className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
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
    </main>
  );
}
