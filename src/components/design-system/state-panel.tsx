import { AlertTriangle, CheckCircle2, Compass, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatePanelProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  tone?: "neutral" | "success" | "danger";
}

const TONE_STYLES: Record<NonNullable<StatePanelProps["tone"]>, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  danger: "bg-destructive/10 text-destructive",
};

function StatePanel({
  icon: Icon = Compass,
  title,
  description,
  action,
  tone = "neutral",
  className,
}: StatePanelProps) {
  return (
    <div
      className={cn(
        "border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      <span
        className={cn("flex size-12 items-center justify-center rounded-full", TONE_STYLES[tone])}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-heading font-semibold">{title}</p>
        {description && <p className="text-muted-foreground max-w-sm text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** No rides yet, no results found, empty inbox — the road ahead is open, not broken. */
export function EmptyState(props: Omit<StatePanelProps, "tone" | "icon"> & { icon?: LucideIcon }) {
  return <StatePanel tone="neutral" {...props} />;
}

/** Something failed — a fetch, a submit, a realtime disconnect. */
export function ErrorState(props: Omit<StatePanelProps, "tone" | "icon"> & { icon?: LucideIcon }) {
  return <StatePanel tone="danger" icon={AlertTriangle} {...props} />;
}

/** Confirms an action landed — request sent, ride created, seat booked. */
export function SuccessState(
  props: Omit<StatePanelProps, "tone" | "icon"> & { icon?: LucideIcon },
) {
  return <StatePanel tone="success" icon={CheckCircle2} {...props} />;
}
