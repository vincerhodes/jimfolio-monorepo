import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const createCustomFoodSchema = z.object({
  name: z.string().trim().min(1).max(200),
  fiberPer100g: z.number().min(0).max(100),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const customFoods = await db.customFood.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ customFoods });
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

  const parsed = createCustomFoodSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { name, fiberPer100g } = parsed.data;
  // Idempotent on (userId, name) — re-logging the same custom food updates it.
  const customFood = await db.customFood.upsert({
    where: { userId_name: { userId: user.id, name } },
    create: { userId: user.id, name, fiberPer100g },
    update: { fiberPer100g },
  });

  return NextResponse.json({ customFood }, { status: 201 });
}
