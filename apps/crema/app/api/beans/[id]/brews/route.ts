import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  methodId: z.string().min(1),
  grindSize: z.string().optional(),
  grinder: z.string().max(100).optional(),
  grindSetting: z.number().min(0).max(100).optional(),
  grinderId: z.string().nullable().optional(),
  equipmentId: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  brewDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  doseG: z.coerce.number().positive().optional(),
  yieldG: z.coerce.number().positive().optional(),
  brewTimeSec: z.coerce.number().int().positive().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: beanId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_brew_log" }, { status: 400 });
  }

  const bean = await db.bean.findUnique({ where: { id: beanId } });
  if (!bean) {
    return NextResponse.json({ error: "bean_not_found" }, { status: 404 });
  }

  const { methodId, grindSize, grinder, grindSetting, grinderId, equipmentId, rating, brewDate, notes, doseG, yieldG, brewTimeSec } = parsed.data;
  const method = await db.brewMethod.findUnique({ where: { id: methodId } });
  if (!method) {
    return NextResponse.json({ error: "unknown_method" }, { status: 400 });
  }
  if (grinderId) {
    const grinderRow = await db.grinder.findUnique({ where: { id: grinderId } });
    if (!grinderRow) {
      return NextResponse.json({ error: "unknown_grinder" }, { status: 400 });
    }
  }
  if (equipmentId) {
    const equipmentRow = await db.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipmentRow) {
      return NextResponse.json({ error: "unknown_equipment" }, { status: 400 });
    }
  }

  const brew = await db.brewLog.create({
    data: {
      beanId,
      methodId,
      grindSize: grindSize ?? null,
      grinder: grinder ?? null,
      grindSetting: grindSetting ?? null,
      grinderId: grinderId ?? null,
      equipmentId: equipmentId ?? null,
      rating: rating ?? null,
      brewDate: brewDate ?? new Date(),
      notes: notes ?? null,
      doseG: doseG ?? null,
      yieldG: yieldG ?? null,
      brewTimeSec: brewTimeSec ?? null,
    },
  });

  return NextResponse.json({ id: brew.id }, { status: 201 });
}
