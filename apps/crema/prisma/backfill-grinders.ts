import { db } from "../lib/db";

const prisma = db;

// Backfill: distinct non-null legacy BrewLog.grinder strings become Grinder
// rows (model = the string, type null), and matching brews get grinderId set.
// Idempotent: skips grinder models that already exist; re-running links any
// brews that were missed.
async function main() {
  const rows = await prisma.brewLog.findMany({
    where: { grinder: { not: null } },
    distinct: ["grinder"],
    select: { grinder: true },
  });
  // raw legacy value → trimmed display/model name
  const pairs = rows
    .map((r) => ({ raw: r.grinder as string, name: r.grinder?.trim() }))
    .filter((p): p is { raw: string; name: string } => !!p.name);
  const names = [...new Set(pairs.map((p) => p.name))];

  let created = 0;
  let linked = 0;
  for (const name of names) {
    let grinder = await prisma.grinder.findFirst({ where: { model: name } });
    if (!grinder) {
      grinder = await prisma.grinder.create({
        data: { model: name, type: null },
      });
      created++;
      console.log(`Created grinder: ${name}`);
    }
    const raws = pairs.filter((p) => p.name === name).map((p) => p.raw);
    const result = await prisma.brewLog.updateMany({
      where: { grinderId: null, grinder: { in: raws } },
      data: { grinderId: grinder.id },
    });
    linked += result.count;
    if (result.count > 0) {
      console.log(`Linked ${result.count} brew(s) to ${name}`);
    }
  }

  console.log(
    `Backfill done: ${names.length} distinct legacy grinder string(s), ${created} grinder(s) created, ${linked} brew(s) linked`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
