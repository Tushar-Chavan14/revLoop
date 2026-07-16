"use client";

import { useEffect, useState } from "react";

function formatCountdown(ms: number) {
  if (ms <= 0) {
    return "It's today";
  }
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/** Live countdown to a ride's departure — mounts as a neutral placeholder to avoid an SSR/client mismatch. */
export function RideCountdown({ targetIso, className }: { targetIso: string; className?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const initial = setTimeout(tick, 0);
    const id = setInterval(tick, 60_000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, []);

  return (
    <span className={className}>
      {now === null ? "—" : formatCountdown(new Date(targetIso).getTime() - now)}
    </span>
  );
}
