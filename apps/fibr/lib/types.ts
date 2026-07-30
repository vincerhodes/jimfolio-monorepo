// Shared types, ported from /home/vincerhodes/dev/Fibr/src/types/index.ts
// (only what the web port uses).
export interface UsdaFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  value: number;
  unitName: string;
}

export interface UsdaSearchResultFood {
  fdcId: number;
  description: string;
  brandName?: string;
  brandOwner?: string;
  foodNutrients: UsdaFoodNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface UsdaSearchResponse {
  foods: UsdaSearchResultFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

// Simplified food shape returned by /api/usda/search and used by the
// search client's log panel.
export interface FoodSearchItem {
  id: string;
  name: string;
  brandName?: string;
  fiberPer100g: number;
  servingSizeG?: number;
  emoji?: string;
  typicalServingG?: number;
}

export interface Suggestion {
  name: string;
  emoji: string;
  fiberPer100g: number;
  typicalServingG: number;
  reason: string;
}

// Serialized FiberEntry as passed to client components.
export interface EntryDto {
  id: string;
  foodName: string;
  grams: number;
  fiberG: number;
  createdAt: string;
}
