import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const grinderType = z.enum(["FLAT_BURR", "CONICAL_BURR", "BLADE", "OTHER"]);

const createSchema = z.object({
  manufacturer: z.string().trim().nullable().optional(),
  model: z.string().trim().nullable().optional(),
  type: grinderType.nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  catalogSlug: z.string().trim().nullable().optional(),
});

export async function GET() {
  const grinders = await db.grinder.findMany({
    orderBy: [{ archived: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { brews: true } } },
  });
  return NextResponse.json(
    grinders.map(({ _count, ...grinder }) => ({
      ...grinder,
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
    return NextResponse.json({ error: "invalid_grinder" }, { status: 400 });
  }

  const { manufacturer, model, type, notes, catalogSlug } = parsed.data;
  const grinder = await db.grinder.create({
    data: {
      manufacturer: manufacturer || null,
      model: model || null,
      type: type ?? null,
      notes: notes || null,
      catalogSlug: catalogSlug || null,
    },
  });

  return NextResponse.json({ id: grinder.id }, { status: 201 });
}
