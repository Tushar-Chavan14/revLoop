import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

/**
 * Trip-odometer style progress rail for multi-step flows — ride creation,
 * onboarding. A big Bebas step number reads like a trip meter, and the segmented
 * bar tracks distance covered rather than a row of generic numbered dots.
 */
export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-4xl leading-none tabular-nums">{currentStep + 1}</span>
          <span className="text-muted-foreground text-sm font-medium tabular-nums">
            of {steps.length}
          </span>
        </div>
        <p className="text-right text-sm font-semibold">{steps[currentStep]}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {steps.map((label, index) => (
          <span
            key={label}
            className={cn(
              "h-1.5 flex-1 rounded-sm transition-colors duration-300",
              index <= currentStep ? "bg-foreground" : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}
