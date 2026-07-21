import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const patchSchema = z.object({
  methodId: z.string().min(1).optional(),
  grinder: z.string().max(100).nullable().optional(),
  grindSetting: z.number().min(0).max(100).nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  brewDate: z.coerce.date().optional(),
  notes: z.string().nullable().optional(),
});

async function findBrew(beanId: string, brewId: string) {
  return db.brewLog.findFirst({ where: { id: brewId, beanId } });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; brewId: string }> }
) {
  const { id: beanId, brewId } = await params;

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

  const brew = await findBrew(beanId, brewId);
  if (!brew) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { methodId, grinder, grindSetting, rating, brewDate, notes } = parsed.data;
  if (methodId) {
    const method = await db.brewMethod.findUnique({ where: { id: methodId } });
    if (!method) {
      return NextResponse.json({ error: "unknown_method" }, { status: 400 });
    }
  }

  const updated = await db.brewLog.update({
    where: { id: brewId },
    data: {
      ...(methodId !== undefined ? { methodId } : {}),
      ...(grinder !== undefined ? { grinder: grinder || null } : {}),
      ...(grindSetting !== undefined ? { grindSetting } : {}),
      ...(rating !== undefined ? { rating } : {}),
      ...(brewDate !== undefined ? { brewDate } : {}),
      ...(notes !== undefined ? { notes: notes || null } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; brewId: string }> }
) {
  const { id: beanId, brewId } = await params;

  const brew = await findBrew(beanId, brewId);
  if (!brew) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await db.brewLog.delete({ where: { id: brewId } });
  return new NextResponse(null, { status: 204 });
}
