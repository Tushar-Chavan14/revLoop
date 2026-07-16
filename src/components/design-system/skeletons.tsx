import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Mirrors RideCard's layout so a loading grid doesn't jump when data arrives. */
export function RideCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "ring-foreground/10 flex flex-col overflow-hidden rounded-2xl ring-1",
        className,
      )}
    >
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
        <div className="mt-auto flex items-center gap-2 pt-1">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}

export function DestinationCardSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("aspect-3/4 w-full rounded-2xl", className)} />;
}

export function ProfileCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-card ring-foreground/10 flex items-center gap-4 rounded-2xl p-4 ring-1",
        className,
      )}
    >
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-1/3 rounded" />
        <Skeleton className="h-3 w-1/4 rounded" />
      </div>
    </div>
  );
}

export function ListRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-4 py-3",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-1/2 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>
      <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
    </div>
  );
}
