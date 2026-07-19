import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  methodId: z.string().min(1),
  grindSize: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  brewDate: z.coerce.date().optional(),
  notes: z.string().optional(),
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

  const { methodId, grindSize, rating, brewDate, notes } = parsed.data;
  const method = await db.brewMethod.findUnique({ where: { id: methodId } });
  if (!method) {
    return NextResponse.json({ error: "unknown_method" }, { status: 400 });
  }

  const brew = await db.brewLog.create({
    data: {
      beanId,
      methodId,
      grindSize: grindSize ?? null,
      rating: rating ?? null,
      brewDate: brewDate ?? new Date(),
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ id: brew.id }, { status: 201 });
}
