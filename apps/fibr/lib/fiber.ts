// Fiber calculation helpers ported from /home/vincerhodes/dev/Fibr/src/utils/fiber.ts.
import { FIBER_NUTRIENT_NUMBER } from "./constants";
import type { UsdaSearchResultFood } from "./types";

export function extractFiberPer100g(food: UsdaSearchResultFood): number {
  const fiberNutrient = food.foodNutrients.find(
    (n) => n.nutrientNumber === FIBER_NUTRIENT_NUMBER
  );

  if (!fiberNutrient) return 0;

  if (
    food.servingSize &&
    food.servingSizeUnit?.toLowerCase() === "g" &&
    food.servingSize !== 100
  ) {
    return (fiberNutrient.value / food.servingSize) * 100;
  }

  return fiberNutrient.value;
}

export function calculateFiber(fiberPer100g: number, grams: number): number {
  return (fiberPer100g * grams) / 100;
}

export function formatFiber(grams: number): string {
  return `${grams.toFixed(1)}g`;
}

export function fiberProgress(consumed: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(consumed / goal, 1);
}

// Local date string "YYYY-MM-DD" (server timezone), matching the original
// app's device-local day bucketing.
export function getLocalDateString(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
