"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { RideMap as RideMapComponent } from "@/features/rides/components/ride-map";

// maplibre-gl is ~800KB of JS (+ its CSS). Split it into its own chunk, and
// only fetch that chunk once the map is about to scroll into view — riders
// who never scroll down to the route never download it.
const RideMap = dynamic(
  () => import("@/features/rides/components/ride-map").then((mod) => mod.RideMap),
  { ssr: false, loading: () => <Skeleton className="size-full rounded-lg" /> },
);

/** Drop-in for RideMap — takes the same props, and the caller's className sizes the frame. */
export function LazyRideMap({ className, ...props }: ComponentProps<typeof RideMapComponent>) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || nearViewport) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nearViewport]);

  return (
    <div ref={sentinelRef} className={cn("h-80 w-full", className)}>
      {nearViewport ? (
        <RideMap {...props} className="h-full" />
      ) : (
        <Skeleton className="size-full rounded-lg" />
      )}
    </div>
  );
}
