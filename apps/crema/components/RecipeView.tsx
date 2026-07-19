"use client";

import { useState } from "react";
import type { RecipeData } from "@/lib/recipe-schema";
import IngredientList from "./IngredientList";
import StepGuide from "./StepGuide";

export default function RecipeView({ recipe }: { recipe: RecipeData }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <IngredientList ingredients={recipe.ingredients} />
      <StepGuide
        steps={recipe.steps}
        currentStepIndex={currentStepIndex}
        onStepChange={setCurrentStepIndex}
      />
    </div>
  );
}
