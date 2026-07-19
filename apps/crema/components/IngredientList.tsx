import type { Ingredient } from "@/lib/recipe-schema";

interface IngredientListProps {
  ingredients: Ingredient[];
  checked?: boolean[];
  onToggle?: (index: number) => void;
}

export default function IngredientList({ ingredients, checked, onToggle }: IngredientListProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Ingredients</h2>
      <ul className="mt-3 space-y-2">
        {ingredients.map((ing, i) => (
          <li key={i} className="text-sm">
            {onToggle && (
              <input
                type="checkbox"
                checked={checked?.[i] ?? false}
                onChange={() => onToggle(i)}
                className="mr-2 align-middle"
                aria-label={`Have ${ing.name}`}
              />
            )}
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
