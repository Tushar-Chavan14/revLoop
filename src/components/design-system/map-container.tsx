import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MapContainerProps {
  children: React.ReactNode;
  loading?: boolean;
  /** Small overlay badge, e.g. distance or ride type — top-left corner. */
  badge?: React.ReactNode;
  className?: string;
}

/** The frame every map embed (RideMap, a future static preview) sits inside. */
export function MapContainer({ children, loading = false, badge, className }: MapContainerProps) {
  return (
    <div
      data-slot="map-container"
      className={cn("bg-muted relative isolate h-80 w-full overflow-hidden rounded-md", className)}
    >
      {children}
      {badge && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-background rounded-sm px-2 py-1 text-xs font-bold tabular-nums">
            {badge}
          </div>
        </div>
      )}
      {loading && <Skeleton className="absolute inset-0 rounded-none" />}
    </div>
  );
}
