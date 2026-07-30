import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// JSON dump of the user's data (replaces the original localStorage export).
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const entries = await db.fiberEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const payload = {
    entries,
    goalFiberG: user.goalFiberG,
    displayName: user.displayName,
    exportedAt: new Date().toISOString(),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="fibr-data.json"',
    },
  });
}
