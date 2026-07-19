"use client";

import { useState } from "react";
import type { RecipeData } from "@/lib/recipe-schema";
import { inPantry } from "@/lib/pantry-match";
import IngredientList from "./IngredientList";
import StepGuide from "./StepGuide";

interface RecipeViewProps {
  recipe: RecipeData;
  pantryItems?: string[];
}

export default function RecipeView({ recipe, pantryItems = [] }: RecipeViewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const checked = recipe.ingredients.map(
    (ing, i) => overrides[i] ?? inPantry(ing.name, pantryItems)
  );
  const shoppingList = recipe.ingredients.filter((_, i) => !checked[i]);

  function toggle(index: number) {
    setOverrides((prev) => ({ ...prev, [index]: !checked[index] }));
  }

  async function copyShoppingList() {
    const text = shoppingList
      .map((ing) => `- ${ing.quantity} ${ing.unit} ${ing.name}${ing.notes ? ` (${ing.notes})` : ""}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="space-y-8">
        {shoppingList.length > 0 && (
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Shopping list ({shoppingList.length})</h2>
              <button
                type="button"
                onClick={copyShoppingList}
                className="rounded border border-neutral-300 px-3 py-1 text-sm font-medium"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {shoppingList.map((ing, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">
                    {ing.quantity} {ing.unit}
                  </span>{" "}
                  {ing.name}
                  {ing.notes && <span className="text-neutral-500"> ({ing.notes})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        <IngredientList ingredients={recipe.ingredients} checked={checked} onToggle={toggle} />
      </div>
      <StepGuide
        steps={recipe.steps}
        currentStepIndex={currentStepIndex}
        onStepChange={setCurrentStepIndex}
      />
    </div>
  );
}
