import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const patchSchema = z.object({
  archived: z.boolean().optional(),
  name: z.string().trim().min(1).optional(),
  roaster: z.string().trim().nullable().optional(),
  origin: z.string().trim().nullable().optional(),
  variety: z.string().trim().nullable().optional(),
  roastDate: z.coerce.date().optional(),
  notes: z.string().trim().nullable().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bean = await db.bean.findUnique({
    where: { id },
    include: {
      brews: {
        include: { method: true },
        orderBy: { brewDate: "desc" },
      },
    },
  });
  if (!bean) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(bean);
}

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

  const { archived, name, roaster, origin, variety, roastDate, notes } = parsed.data;

  try {
    const bean = await db.bean.update({
      where: { id },
      data: {
        ...(archived !== undefined ? { archived } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(roaster !== undefined ? { roaster: roaster || null } : {}),
        ...(origin !== undefined ? { origin: origin || null } : {}),
        ...(variety !== undefined ? { variety: variety || null } : {}),
        ...(roastDate !== undefined ? { roastDate } : {}),
        ...(notes !== undefined ? { notes: notes || null } : {}),
      },
    });
    return NextResponse.json(bean);
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
