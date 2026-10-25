import { cn } from "@/lib/utils";

interface PageHeadingProps {
  /** @deprecated Eyebrow labels were retired; folded into the description if given. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-aligned slot for a primary action or filter. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * The standard page header across the app — the title in the poster face at
 * app size, one grey sentence under it, actions on the right. No eyebrow: the
 * title and its sentence carry everything.
 */
export function PageHeading({ title, description, action, className }: PageHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="font-display text-[2.5rem] text-balance sm:text-5xl">{title}</h1>
        {description && <p className="text-muted-foreground mt-2 text-base">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
