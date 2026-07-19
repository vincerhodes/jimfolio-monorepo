import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const methods = await db.brewMethod.findMany({
    orderBy: { label: "asc" },
  });
  return NextResponse.json(methods);
}
