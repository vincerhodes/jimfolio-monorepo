import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Wipes the user's logged entries and custom foods (replaces the original
// app's localStorage "clear all data").
export async function DELETE() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await db.$transaction([
    db.fiberEntry.deleteMany({ where: { userId: user.id } }),
    db.customFood.deleteMany({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
