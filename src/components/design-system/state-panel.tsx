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
  neutral: "text-muted-foreground",
  success: "text-success",
  danger: "text-destructive",
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
        "bg-card flex flex-col items-center gap-3 rounded-md px-6 py-14 text-center",
        className,
      )}
    >
      <Icon className={cn("size-7", TONE_STYLES[tone])} strokeWidth={1.5} aria-hidden />
      <div className="flex flex-col gap-1.5">
        <p className="text-lg font-bold">{title}</p>
        {description && (
          <p className="text-muted-foreground max-w-sm text-[15px]">{description}</p>
        )}
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
