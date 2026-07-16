"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { EmptyState } from "@/components/design-system/state-panel";
import { RideCardSkeleton } from "@/components/design-system/skeletons";
import { loadMoreRides } from "@/features/rides/actions/explore-actions";
import { RideCard } from "@/features/rides/components/ride-card";
import type { RideFilters, RideListResult, RideWithOrganizer } from "@/services/rides";

interface RidesExplorerProps {
  initialResult: RideListResult;
  filters: RideFilters;
}

/** Infinite-scrolling list over the current filtered result set. */
export function RidesExplorer({ initialResult, filters }: RidesExplorerProps) {
  const [rides, setRides] = useState<RideWithOrganizer[]>(initialResult.rides);
  const [page, setPage] = useState(initialResult.page);
  const [total, setTotal] = useState(initialResult.total);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = rides.length < total;

  useEffect(() => {
    if (!hasMore) {
      return;
    }
    const el = sentinelRef.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isPending) {
          startTransition(async () => {
            const next = await loadMoreRides(filters, page + 1);
            setRides((current) => [...current, ...next.rides]);
            setPage(next.page);
            setTotal(next.total);
          });
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, page, isPending]);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        {total} ride{total === 1 ? "" : "s"} found
      </p>

      {rides.length === 0 ? (
        <EmptyState
          title="No rides match those filters"
          description="Try widening your search, or start your next adventure yourself."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
            {isPending && Array.from({ length: 3 }).map((_, i) => <RideCardSkeleton key={i} />)}
          </div>
          {hasMore && <div ref={sentinelRef} className="h-1" />}
        </>
      )}
    </div>
  );
}
