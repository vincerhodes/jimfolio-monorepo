"use client";

import { useState } from "react";
import type { RecipeStep } from "@/lib/recipe-schema";

interface StepGuideProps {
  steps: RecipeStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}

export default function StepGuide({ steps, currentStepIndex, onStepChange }: StepGuideProps) {
  const [showAll, setShowAll] = useState(false);
  const step = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];

  function jumpTo(index: number) {
    onStepChange(index);
    setShowAll(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Steps</h2>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="btn-secondary btn-sm"
        >
          {showAll ? "Step by step" : "View all"}
        </button>
      </div>

      {showAll ? (
        <ol className="mt-3 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <button
                type="button"
                onClick={() => jumpTo(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  i === currentStepIndex
                    ? "bg-[var(--accent,#33261d)] text-white"
                    : "bg-[#efe9e1] text-[#7a6a5d] hover:bg-[#e5dcd1]"
                }`}
              >
                {i + 1}
              </button>
              <p className={i === currentStepIndex ? "font-medium" : undefined}>{s.instruction}</p>
            </li>
          ))}
        </ol>
      ) : (
        <>
          <p className="mt-1 text-sm text-[#7a6a5d]">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
          <p className="mt-3 min-h-24 text-sm leading-relaxed">{step.instruction}</p>
          {nextStep && (
            <button
              type="button"
              onClick={() => onStepChange(currentStepIndex + 1)}
              className="mt-3 block w-full rounded-lg border border-dashed border-[#d8cfc4] px-3 py-2 text-left text-xs text-[#7a6a5d] hover:bg-[#f5f1ea]"
            >
              <span className="font-semibold">Up next — step {currentStepIndex + 2}:</span>{" "}
              {nextStep.instruction.length > 120
                ? `${nextStep.instruction.slice(0, 120)}…`
                : nextStep.instruction}
            </button>
          )}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => onStepChange(currentStepIndex - 1)}
              disabled={currentStepIndex === 0}
              className="btn-secondary disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => onStepChange(currentStepIndex + 1)}
              disabled={currentStepIndex === steps.length - 1}
              className="btn-primary disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
