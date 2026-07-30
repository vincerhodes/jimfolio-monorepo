import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const settingsSchema = z
  .object({
    displayName: z.string().trim().min(1).max(100).optional(),
    goalFiberG: z.number().int().min(1).max(200).optional(),
  })
  .refine((v) => v.displayName !== undefined || v.goalFiberG !== undefined, {
    message: "nothing_to_update",
  });

export async function PATCH(request: Request) {
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

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: parsed.data,
  });

  return NextResponse.json({
    displayName: updated.displayName,
    goalFiberG: updated.goalFiberG,
  });
}
