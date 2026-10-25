"use client";

import { useEffect, useState } from "react";

const HOUR_MS = 60 * 60 * 1000;

// Crews roll out at first light — the countdown runs to Saturday 06:00 local.
function untilSaturdayRollout(now: Date): { days: number; hours: number } | null {
  const day = now.getDay();
  if (day === 6 || day === 0) {
    return null;
  }
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + (6 - day));
  saturday.setHours(6, 0, 0, 0);
  const hoursLeft = Math.max(0, Math.floor((saturday.getTime() - now.getTime()) / HOUR_MS));
  return { days: Math.floor(hoursLeft / 24), hours: hoursLeft % 24 };
}

/**
 * The live line of the first screen: how long until Saturday's rollout and how
 * many rides are leaving. Rendered after mount (it depends on the visitor's
 * clock); before that, and without script, the plain sentence stands in.
 */
export function WeekendCountdown({ rideCount }: { rideCount: number }) {
  const [left, setLeft] = useState<ReturnType<typeof untilSaturdayRollout> | "weekend" | null>(
    null,
  );

  useEffect(() => {
    const tick = () => setLeft(untilSaturdayRollout(new Date()) ?? "weekend");
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const rides =
    rideCount > 0
      ? `${rideCount} ride${rideCount === 1 ? "" : "s"} leaving this weekend`
      : "Nothing posted for this weekend yet";

  return (
    <p className="flex flex-col gap-1 lg:items-end lg:text-right" aria-live="polite">
      <span className="font-display text-[2.5rem] leading-none tabular-nums lg:text-5xl">
        {left === null
          ? "Rollout: Saturday, 6 am"
          : left === "weekend"
            ? "Rolling out this weekend"
            : `Saturday in ${left.days > 0 ? `${left.days}d ` : ""}${left.hours}h`}
      </span>
      <span className="text-muted-foreground text-[15px] font-medium">{rides}</span>
    </p>
  );
}
