import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const patchSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    servings: z.number().int().positive().nullable().optional(),
    isPublic: z.boolean().optional(),
  })
  .refine((val) => val.title !== undefined || val.isPublic !== undefined, {
    message: "nothing_to_update",
  });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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

  const data: { title?: string; servings?: number | null; isPublic?: boolean } = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.servings !== undefined) data.servings = parsed.data.servings ?? null;
  if (parsed.data.isPublic !== undefined) data.isPublic = parsed.data.isPublic;

  try {
    const recipe = await db.recipe.update({
      where: { id, userId: user.id },
      data,
    });
    return NextResponse.json(recipe);
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await db.recipe.delete({ where: { id, userId: user.id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
