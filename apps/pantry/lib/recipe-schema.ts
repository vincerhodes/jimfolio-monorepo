import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  notes: z.string().optional(),
});

export const stepSchema = z.object({
  stepNumber: z.number().int().positive(),
  instruction: z.string().min(1),
});

export const recipeSchema = z.object({
  title: z.string().min(1),
  servings: z.number().int().positive().optional(),
  ingredients: z.array(ingredientSchema).min(1),
  steps: z.array(stepSchema).min(1),
});

export type RecipeData = z.infer<typeof recipeSchema>;
export type Ingredient = z.infer<typeof ingredientSchema>;
export type RecipeStep = z.infer<typeof stepSchema>;
