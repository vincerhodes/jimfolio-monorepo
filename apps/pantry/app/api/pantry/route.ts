import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().optional(),
});

export async function GET() {
  const items = await db.pantryItem.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ items });
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
    return NextResponse.json({ error: "invalid_pantry_item" }, { status: 400 });
  }

  const { name, category } = parsed.data;
  try {
    const item = await db.pantryItem.create({
      data: {
        name,
        category: category?.trim() || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "duplicate" }, { status: 409 });
  }
}
