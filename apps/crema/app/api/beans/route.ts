import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1),
  roaster: z.string().optional(),
  origin: z.string().optional(),
  variety: z.string().optional(),
  roastDate: z.coerce.date(),
  notes: z.string().optional(),
});

export async function GET() {
  const beans = await db.bean.findMany({
    where: { archived: false },
    orderBy: { roastDate: "desc" },
    include: { _count: { select: { brews: true } } },
  });
  return NextResponse.json(
    beans.map(({ _count, ...bean }) => ({ ...bean, brewCount: _count.brews }))
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
    return NextResponse.json({ error: "invalid_bean" }, { status: 400 });
  }

  const { name, roaster, origin, variety, roastDate, notes } = parsed.data;
  const bean = await db.bean.create({
    data: {
      name,
      roaster: roaster ?? null,
      origin: origin ?? null,
      variety: variety ?? null,
      roastDate,
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ id: bean.id }, { status: 201 });
}
