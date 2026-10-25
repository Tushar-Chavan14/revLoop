import type { LucideIcon } from "lucide-react";


import { CountUp } from "@/components/design-system/count-up";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  className?: string;
}

/**
 * A single metric as type, not a tile: grey label over the figure. The icon
 * prop is kept for old call sites but no longer drawn — KPIs read as numbers.
 * Composes into one strip split by a tone step (see StatStrip usage).
 */
export function StatCard({ label, value, suffix, className }: StatCardProps) {
  return (
    <div data-slot="stat-card" className={cn("bg-card flex flex-col gap-1 rounded-md p-5", className)}>
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold tabular-nums">
        <CountUp value={value} suffix={suffix} />
      </p>
    </div>
  );
}
