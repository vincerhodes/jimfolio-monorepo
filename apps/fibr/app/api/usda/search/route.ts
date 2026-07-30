import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { FIBER_NUTRIENT_NUMBER, USDA_API_BASE } from "@/lib/constants";
import { extractFiberPer100g } from "@/lib/fiber";
import { rateLimit } from "@/lib/rate-limit";
import type { UsdaSearchResponse } from "@/lib/types";

// Server-side proxy to USDA FoodData Central so USDA_API_KEY stays
// server-only (the original app leaked it via EXPO_PUBLIC_).
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ disabled: true, foods: [] });
  }

  if (!rateLimit(`usda:${user.id}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ foods: [] });
  }

  const url = `${USDA_API_BASE}/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=15&dataType=Foundation,SR%20Legacy&sortBy=dataType.keyword&sortOrder=asc`;

  let data: UsdaSearchResponse;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "usda_error" }, { status: 502 });
    }
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "usda_error" }, { status: 502 });
  }

  const foods = data.foods
    .filter((food) =>
      food.foodNutrients.some(
        (n) => n.nutrientNumber === FIBER_NUTRIENT_NUMBER && n.value > 0
      )
    )
    .map((food) => ({
      fdcId: food.fdcId,
      name: food.description,
      brandName: food.brandName || food.brandOwner,
      fiberPer100g: extractFiberPer100g(food),
      servingSizeG: food.servingSize,
    }));

  return NextResponse.json({ foods });
}
