import type { Ingredient } from "@/lib/recipe-schema";

interface IngredientListProps {
  ingredients: Ingredient[];
  checked?: boolean[];
  onToggle?: (index: number) => void;
  canAddToPantry?: boolean[];
  addedToPantry?: Record<number, boolean>;
  onAddToPantry?: (index: number) => void;
}

export default function IngredientList({
  ingredients,
  checked,
  onToggle,
  canAddToPantry,
  addedToPantry,
  onAddToPantry,
}: IngredientListProps) {
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
                className="mr-2 align-middle accent-[var(--accent)]"
                aria-label={`Have ${ing.name}`}
              />
            )}
            <span className="font-medium">
              {ing.quantity} {ing.unit}
            </span>{" "}
            {ing.name}
            {ing.notes && <span className="text-[#7a6a5d]"> ({ing.notes})</span>}
            {onAddToPantry && canAddToPantry?.[i] && (
              <button
                type="button"
                onClick={() => onAddToPantry(i)}
                disabled={addedToPantry?.[i]}
                className="btn-secondary btn-sm ml-2"
              >
                {addedToPantry?.[i] ? "Added" : "+ Pantry"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
