import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const equipmentKind = z.enum([
  "ESPRESSO_MACHINE",
  "POUR_OVER",
  "IMMERSION",
  "MOKA_POT",
  "OTHER",
]);

const createSchema = z.object({
  manufacturer: z.string().trim().nullable().optional(),
  model: z.string().trim().nullable().optional(),
  kind: equipmentKind.nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export async function GET() {
  const equipment = await db.equipment.findMany({
    orderBy: [{ archived: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { brews: true } } },
  });
  return NextResponse.json(
    equipment.map(({ _count, ...item }) => ({
      ...item,
      brewCount: _count.brews,
    }))
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_equipment" }, { status: 400 });
  }

  const { manufacturer, model, kind, notes } = parsed.data;
  const equipment = await db.equipment.create({
    data: {
      manufacturer: manufacturer || null,
      model: model || null,
      kind: kind ?? null,
      notes: notes || null,
    },
  });

  return NextResponse.json({ id: equipment.id }, { status: 201 });
}
