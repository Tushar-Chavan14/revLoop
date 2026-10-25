import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusChipVariants = cva(
  "inline-flex h-6 w-fit flex-none shrink-0 items-center gap-1.5 rounded-sm px-2 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      status: {
        open: "bg-success/12 text-success",
        filling: "bg-warning/12 text-warning",
        full: "bg-muted text-muted-foreground",
        cancelled: "bg-destructive/10 text-destructive",
        completed: "bg-muted text-muted-foreground",
        live: "bg-primary-soft text-primary-soft-foreground",
      },
    },
    defaultVariants: {
      status: "open",
    },
  },
);

const DOT_COLOR: Record<NonNullable<VariantProps<typeof statusChipVariants>["status"]>, string> = {
  open: "bg-success",
  filling: "bg-warning",
  full: "bg-muted-foreground",
  cancelled: "bg-destructive",
  completed: "bg-muted-foreground",
  live: "bg-primary",
};

const STATUS_LABEL: Record<
  NonNullable<VariantProps<typeof statusChipVariants>["status"]>,
  string
> = {
  open: "Open",
  filling: "Filling up",
  full: "Full",
  cancelled: "Cancelled",
  completed: "Completed",
  live: "Live now",
};

interface StatusChipProps extends VariantProps<typeof statusChipVariants> {
  className?: string;
  /** Overrides the default label for the status. */
  children?: React.ReactNode;
  /** Adds a pulse animation to the dot — reserve for genuinely live/active states. */
  pulse?: boolean;
}

function StatusChip({ className, status = "open", pulse = false, children }: StatusChipProps) {
  return (
    <span data-slot="status-chip" className={cn(statusChipVariants({ status }), className)}>
      <span className="relative flex size-1.5 shrink-0">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-75",
              DOT_COLOR[status ?? "open"],
            )}
          />
        )}
        <span
          className={cn("relative inline-flex size-1.5 rounded-full", DOT_COLOR[status ?? "open"])}
        />
      </span>
      {children ?? STATUS_LABEL[status ?? "open"]}
    </span>
  );
}

export { StatusChip, statusChipVariants };
