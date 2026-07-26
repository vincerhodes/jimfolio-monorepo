import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const grinderType = z.enum(["FLAT_BURR", "CONICAL_BURR", "BLADE", "OTHER"]);

const patchSchema = z.object({
  archived: z.boolean().optional(),
  manufacturer: z.string().trim().nullable().optional(),
  model: z.string().trim().nullable().optional(),
  type: grinderType.nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  catalogSlug: z.string().trim().nullable().optional(),
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

  const { archived, manufacturer, model, type, notes, catalogSlug } =
    parsed.data;

  try {
    const grinder = await db.grinder.update({
      where: { id },
      data: {
        ...(archived !== undefined ? { archived } : {}),
        ...(manufacturer !== undefined
          ? { manufacturer: manufacturer || null }
          : {}),
        ...(model !== undefined ? { model: model || null } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(notes !== undefined ? { notes: notes || null } : {}),
        ...(catalogSlug !== undefined
          ? { catalogSlug: catalogSlug || null }
          : {}),
      },
    });
    return NextResponse.json(grinder);
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const grinder = await db.grinder.findUnique({
    where: { id },
    include: { _count: { select: { brews: true } } },
  });
  if (!grinder) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (grinder._count.brews > 0) {
    return NextResponse.json(
      { error: "grinder_has_brews" },
      { status: 409 }
    );
  }

  await db.grinder.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
