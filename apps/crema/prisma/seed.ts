import { db } from "../lib/db";

const prisma = db;

const BREW_METHODS = [
  "Espresso — Lelit Bianca",
  "V60 pour-over",
  "AeroPress",
  "French press",
];

async function main() {
  for (const label of BREW_METHODS) {
    await prisma.brewMethod.upsert({
      where: { label },
      update: {},
      create: { label },
    });
  }
  console.log(`Seeded ${BREW_METHODS.length} brew methods`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
