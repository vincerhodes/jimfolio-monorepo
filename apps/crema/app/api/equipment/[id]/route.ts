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

const patchSchema = z.object({
  archived: z.boolean().optional(),
  manufacturer: z.string().trim().nullable().optional(),
  model: z.string().trim().nullable().optional(),
  kind: equipmentKind.nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_patch" }, { status: 400 });
  }

  const { archived, manufacturer, model, kind, notes } = parsed.data;

  try {
    const equipment = await db.equipment.update({
      where: { id },
      data: {
        ...(archived !== undefined ? { archived } : {}),
        ...(manufacturer !== undefined
          ? { manufacturer: manufacturer || null }
          : {}),
        ...(model !== undefined ? { model: model || null } : {}),
        ...(kind !== undefined ? { kind } : {}),
        ...(notes !== undefined ? { notes: notes || null } : {}),
      },
    });
    return NextResponse.json(equipment);
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const equipment = await db.equipment.findUnique({
    where: { id },
    include: { _count: { select: { brews: true } } },
  });
  if (!equipment) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (equipment._count.brews > 0) {
    return NextResponse.json(
      { error: "equipment_has_brews" },
      { status: 409 }
    );
  }

  await db.equipment.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
