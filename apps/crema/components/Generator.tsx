"use client";

import { useState } from "react";
import type { RecipeData } from "@/lib/recipe-schema";
import PromptForm from "./PromptForm";
import RecipeView from "./RecipeView";
import SaveButton from "./SaveButton";

interface Generated {
  recipe: RecipeData;
  prompt: string;
  model: string;
}

export default function Generator({ pantryItems = [] }: { pantryItems?: string[] }) {
  const [generated, setGenerated] = useState<Generated | null>(null);

  return (
    <div className="space-y-8">
      <PromptForm onGenerated={setGenerated} />
      {generated && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">{generated.recipe.title}</h1>
            <SaveButton
              recipe={generated.recipe}
              prompt={generated.prompt}
              model={generated.model}
            />
          </div>
          {generated.recipe.servings && (
            <p className="text-sm text-[#7a6a5d]">Serves {generated.recipe.servings}</p>
          )}
          <RecipeView recipe={generated.recipe} pantryItems={pantryItems} />
        </div>
      )}
    </div>
  );
}
