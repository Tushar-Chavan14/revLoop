import { cn } from "@/lib/utils";

interface PageHeadingProps {
  /** Small tracked telemetry-style label above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-aligned slot for a primary action or filter. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * The standard page header across the app — an instrument-panel eyebrow over a
 * bold Manrope title. Keeps every screen speaking in the same brand voice.
 */
export function PageHeading({ eyebrow, title, description, action, className }: PageHeadingProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="text-telemetry text-primary text-[11px]">{eyebrow}</p>}
        <h1 className="font-heading mt-2 text-3xl font-extrabold tracking-tight text-balance">
          {title}
        </h1>
        {description && <p className="text-muted-foreground mt-1.5">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
