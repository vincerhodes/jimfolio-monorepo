import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { calculateFiber } from "@/lib/fiber";

const createEntrySchema = z.object({
  foodName: z.string().trim().min(1).max(200),
  fiberPer100g: z.number().min(0).max(100),
  grams: z.number().positive().max(10000),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const entries = await db.fiberEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const parsed = createEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { foodName, fiberPer100g, grams } = parsed.data;
  const entry = await db.fiberEntry.create({
    data: {
      userId: user.id,
      foodName,
      fiberPer100g,
      grams,
      fiberG: calculateFiber(fiberPer100g, grams),
    },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
