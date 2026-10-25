import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Mirrors RideCard's layout (photo, then the facts set flat underneath) so a
 * loading grid doesn't jump when data arrives. */
export function RideCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Skeleton className="aspect-4/3 w-full rounded-md" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3 rounded-sm" />
        <Skeleton className="h-3.5 w-1/2 rounded-sm" />
        <Skeleton className="h-3.5 w-2/5 rounded-sm" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-3.5 w-24 rounded-sm" />
      </div>
    </div>
  );
}

export function DestinationCardSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("aspect-3/4 w-full rounded-md", className)} />;
}

export function ProfileCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card flex items-center gap-4 rounded-md p-4", className)}>
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-1/3 rounded-sm" />
        <Skeleton className="h-3 w-1/4 rounded-sm" />
      </div>
    </div>
  );
}

export function ListRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-card flex items-center justify-between gap-3 rounded-md px-4 py-3",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-1/2 rounded-sm" />
        <Skeleton className="h-3 w-1/3 rounded-sm" />
      </div>
      <Skeleton className="h-6 w-16 shrink-0 rounded-sm" />
    </div>
  );
}
