import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

/** Horizontal progress rail for multi-step flows — ride creation, onboarding.
 * Scales to any step count: the rail stays a compact row of dots/connectors,
 * and only the current step's label is shown (avoids per-dot labels wrapping
 * and colliding once there are more than ~4 steps). */
export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex w-full items-center">
        {steps.map((label, index) => {
          const isComplete = index < currentStep;
          const isActive = index === currentStep;
          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isComplete && "bg-primary text-primary-foreground",
                  isActive && "bg-primary/15 text-primary ring-primary ring-2",
                  !isComplete && !isActive && "bg-muted text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="size-3.5" /> : index + 1}
              </span>
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    "mx-1.5 h-px flex-1 transition-colors",
                    isComplete ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-muted-foreground text-sm font-medium">
        Step {currentStep + 1} of {steps.length} — {steps[currentStep]}
      </p>
    </div>
  );
}
