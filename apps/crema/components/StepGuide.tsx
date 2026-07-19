import type { RecipeStep } from "@/lib/recipe-schema";

interface StepGuideProps {
  steps: RecipeStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}

export default function StepGuide({ steps, currentStepIndex, onStepChange }: StepGuideProps) {
  const step = steps[currentStepIndex];

  return (
    <div>
      <h2 className="text-lg font-semibold">Steps</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Step {currentStepIndex + 1} of {steps.length}
      </p>
      <p className="mt-3 min-h-24 text-sm leading-relaxed">{step.instruction}</p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => onStepChange(currentStepIndex - 1)}
          disabled={currentStepIndex === 0}
          className="rounded border border-neutral-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onStepChange(currentStepIndex + 1)}
          disabled={currentStepIndex === steps.length - 1}
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
