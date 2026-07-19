import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const patchSchema = z.object({
  archived: z.boolean(),
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

  try {
    const bean = await db.bean.update({
      where: { id },
      data: { archived: parsed.data.archived },
    });
    return NextResponse.json(bean);
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
