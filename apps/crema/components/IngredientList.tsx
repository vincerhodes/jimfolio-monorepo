import type { Ingredient } from "@/lib/recipe-schema";

export default function IngredientList({ ingredients }: { ingredients: Ingredient[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Ingredients</h2>
      <ul className="mt-3 space-y-2">
        {ingredients.map((ing, i) => (
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
  );
}
