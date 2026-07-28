import type { LucideIcon } from "lucide-react";

import { CountUp } from "@/components/design-system/count-up";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  className?: string;
}

/** A single community metric — riders count, cities, km ridden. Composes into a grid of 2-4. */
export function StatCard({ icon: Icon, label, value, suffix, className }: StatCardProps) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "bg-card ring-foreground/10 flex flex-col gap-3 rounded-2xl p-5 ring-1",
        className,
      )}
    >
      <Icon className="text-muted-foreground size-5" aria-hidden />
      <p className="font-display text-5xl tabular-nums">
        <CountUp value={value} suffix={suffix} />
      </p>
      <p className="text-muted-foreground text-telemetry text-[11px]">{label}</p>
    </div>
  );
}
